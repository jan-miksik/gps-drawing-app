<template>
  <div id="app">
    <canvas
      ref="canvasEl"
      class="canvas"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
    />
    <div class="coordinates">Lat: {{ currentLat.toFixed(6) }}, Lon: {{ currentLon.toFixed(6) }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { Geolocation } from '@capacitor/geolocation';

interface Point {
  lat: number;
  lon: number;
  timestamp: number;
}

interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

const canvasEl = ref<HTMLCanvasElement | null>(null); // Renamed for clarity
const context = ref<CanvasRenderingContext2D | null>(null);
const points = ref<Point[]>([]);
const bounds = ref<Bounds | null>(null);
let watchId: string | null = null;

// Zoom and pan state
const scale = ref(1);
const viewOffsetX = ref(0); // Renamed to avoid confusion with point offsets
const viewOffsetY = ref(0);
const isDragging = ref(false);
const lastDragX = ref(0); // Renamed for clarity
const lastDragY = ref(0);

// Current GPS position
const currentLat = ref(0);
const currentLon = ref(0);

// Padding around the drawing within the canvas
const DRAWING_PADDING = 40; // In logical pixels

// Detect if we're on desktop
const isDesktop = computed(() => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > 768 && !('ontouchstart' in window);
});

const calculateBounds = () => {
  if (points.value.length === 0) {
    bounds.value = null;
    return;
  }
  if (points.value.length === 1) {
    // For a single point, create a small default bound around it
    const p = points.value[0];
    const delta = 0.0001; // Small delta for single point bounds
    bounds.value = {
      minLat: p.lat - delta,
      maxLat: p.lat + delta,
      minLon: p.lon - delta,
      maxLon: p.lon + delta,
    };
    return;
  }

  const lats = points.value.map(p => p.lat);
  const lons = points.value.map(p => p.lon);

  bounds.value = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
  };
};

const project = (
  point: { lat: number; lon: number },
  currentBounds: Bounds,
  canvasLogicalWidth: number,
  canvasLogicalHeight: number
): { x: number; y: number } => {
  // If only one point exists (or bounds indicate no range), center it.
  if (currentBounds.minLat === currentBounds.maxLat || currentBounds.minLon === currentBounds.maxLon) {
    return {
      x: (canvasLogicalWidth - 2 * DRAWING_PADDING) / 2 + DRAWING_PADDING,
      y: (canvasLogicalHeight - 2 * DRAWING_PADDING) / 2 + DRAWING_PADDING,
    };
  }

  const latRange = currentBounds.maxLat - currentBounds.minLat;
  const lonRange = currentBounds.maxLon - currentBounds.minLon;

  const drawableWidth = canvasLogicalWidth - 2 * DRAWING_PADDING;
  const drawableHeight = canvasLogicalHeight - 2 * DRAWING_PADDING;

  // Handle potential division by zero if range is extremely small (though bounds check helps)
  const scaleX = lonRange > 1e-9 ? drawableWidth / lonRange : 1;
  const scaleY = latRange > 1e-9 ? drawableHeight / latRange : 1;

  // Use the smaller scale to fit the entire drawing within the drawable area and maintain aspect ratio
  const baseScale = Math.min(scaleX, scaleY);

  // Calculate the center of the bounds in lat/lon
  const centerXLatLon = (currentBounds.minLat + currentBounds.maxLat) / 2;
  const centerYLatLon = (currentBounds.minLon + currentBounds.maxLon) / 2;

  // Calculate the center of the drawable area on canvas
  const canvasCenterX = drawableWidth / 2 + DRAWING_PADDING;
  const canvasCenterY = drawableHeight / 2 + DRAWING_PADDING;

  // Project the point:
  // 1. Get offset from the center of the bounds (in lat/lon units, scaled by baseScale)
  // 2. Add to canvas center
  // Y is inverted because canvas Y increases downwards, latitude increases upwards
  const x = canvasCenterX + (point.lon - centerYLatLon) * baseScale;
  const y = canvasCenterY - (point.lat - centerXLatLon) * baseScale;

  return { x, y };
};

const drawPath = () => {
  if (!context.value || !canvasEl.value) {
    console.warn('Canvas or context not available for drawing.');
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const canvas = canvasEl.value;
  const ctx = context.value;

  // Logical dimensions (CSS pixels)
  const logicalWidth = canvas.width / dpr;
  const logicalHeight = canvas.height / dpr;

  // 0. Reset transform to identity and clear
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Apply DPR scale, reset others
  ctx.clearRect(0, 0, logicalWidth, logicalHeight); // Clear based on logical size
  ctx.restore();

  if (points.value.length === 0 || !bounds.value) {
    // console.log('No points or bounds to draw.');
    return;
  }

  ctx.save();

  // 1. Apply Device Pixel Ratio scaling (base transform)
  ctx.scale(dpr, dpr);

  // 2. Apply view pan (user dragging) - these are offsets in logical pixels
  ctx.translate(viewOffsetX.value, viewOffsetY.value);

  // 3. Apply view zoom (user wheel/pinch) - centered zoom
  // To zoom from the center of the viewport:
  // Translate so the current center of the view is at the origin (0,0)
  ctx.translate(logicalWidth / 2, logicalHeight / 2);
  ctx.scale(scale.value, scale.value); // Apply zoom
  // Translate back
  ctx.translate(-logicalWidth / 2, -logicalHeight / 2);


  // --- Drawing logic ---
  if (points.value.length >= 1 && bounds.value) { // Need at least one point to draw a dot
    ctx.beginPath();
    for (let i = 0; i < points.value.length; i++) {
      const { x, y } = project(points.value[i], bounds.value, logicalWidth, logicalHeight);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    if (points.value.length > 1) { // Only stroke if there's a path
        ctx.strokeStyle = 'white';
        // Adjust line width based on current view scale, so it appears consistent
        ctx.lineWidth = 2 / (scale.value * dpr) ; // More refined line width adjustment
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    // Draw current position as a dot (even if it's the only point)
    const lastPoint = points.value[points.value.length - 1];
    const { x: lastX, y: lastY } = project(lastPoint, bounds.value, logicalWidth, logicalHeight);
    ctx.fillStyle = 'white'; // Current position dot color
    ctx.beginPath();
    ctx.arc(lastX, lastY, 10 / (scale.value * dpr), 0, 2 * Math.PI); // Adjust dot size
    ctx.fill();
  }
  // --- End Drawing logic ---

  ctx.restore(); // Restore to the state before pan/zoom/DPR
};


const addGPSPoint = (position: { coords: { latitude: number; longitude: number } } | null) => {
  if (!position) {
    console.warn('Received null position in addGPSPoint');
    return;
  }
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const timestamp = Date.now();

  currentLat.value = lat;
  currentLon.value = lon;

  points.value.push({ lat, lon, timestamp });
  calculateBounds(); // Recalculate bounds with the new point

  // Use nextTick to ensure DOM updates (like canvas resize) are processed before drawing
  nextTick(() => {
    drawPath();
  });
};

const setupCanvas = () => {
  if (canvasEl.value) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEl.value.getBoundingClientRect();

    canvasEl.value.width = rect.width * dpr;
    canvasEl.value.height = rect.height * dpr;
    // CSS already handles display width/height at 100%

    context.value = canvasEl.value.getContext('2d');
    if (!context.value) {
        console.error("Failed to get 2D context");
        return;
    }
    // Initial draw if there are points (e.g., from loaded data)
    calculateBounds();
    drawPath();
  }
};

onMounted(async () => {
  setupCanvas(); // Initial setup

  // Optional: Add resize listener if you want to re-setup canvas on window resize
  window.addEventListener('resize', setupCanvas);

  try {
    const permissionStatus = await Geolocation.checkPermissions();
    if (permissionStatus.location !== 'granted' && permissionStatus.coarseLocation !== 'granted') {
      const requestStatus = await Geolocation.requestPermissions();
      if (requestStatus.location !== 'granted' && requestStatus.coarseLocation !== 'granted') {
        console.error('Location permission denied.');
        // Optionally, display a message to the user
        return;
      }
    }

    watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000, // Max time to wait for a position
        maximumAge: 3000 // How old a cached position can be
      },
      (position, err) => {
        if (err) {
          console.error('GPS Error:', err.message, err.code);
          // Handle specific errors, e.g., err.code === 1 (PERMISSION_DENIED)
          // err.code === 2 (POSITION_UNAVAILABLE)
          // err.code === 3 (TIMEOUT)
        } else if (position) {
          addGPSPoint(position);
        }
      }
    );
  } catch (error: any) {
    console.error('Failed to start GPS tracking:', error.message || error);
  }
});

onUnmounted(() => {
  if (watchId) {
    Geolocation.clearWatch({ id: watchId });
  }
  window.removeEventListener('resize', setupCanvas);
});

// --- Touch and Mouse Event Handlers for Panning ---
const startDrag = (clientX: number, clientY: number) => {
  isDragging.value = true;
  lastDragX.value = clientX;
  lastDragY.value = clientY;
};

const drag = (clientX: number, clientY: number) => {
  if (!isDragging.value) return;

  const dpr = window.devicePixelRatio || 1;
  // Deltas should be in logical pixels, so divide by current scale and DPR
  // No, deltas are direct view offsets, user perceives them in screen pixels.
  // The effect of scale on panning speed is managed by how transforms are applied.

  const deltaX = (clientX - lastDragX.value) / dpr; // Convert screen pixel delta to logical canvas pixel delta
  const deltaY = (clientY - lastDragY.value) / dpr;

  viewOffsetX.value += deltaX;
  viewOffsetY.value += deltaY;

  lastDragX.value = clientX;
  lastDragY.value = clientY;
  drawPath();
};

const endDrag = () => {
  isDragging.value = false;
};

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    e.preventDefault();
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }
  // Basic pinch zoom could be added here by checking e.touches.length === 2
};

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    e.preventDefault();
    drag(e.touches[0].clientX, e.touches[0].clientY);
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  if (e.touches.length === 0) { // All touches lifted
    endDrag();
  }
};

const handleMouseDown = (e: MouseEvent) => {
  if (isDesktop.value) {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDesktop.value) {
    e.preventDefault();
    drag(e.clientX, e.clientY);
  }
};

const handleMouseUp = (e: MouseEvent) => {
  if (isDesktop.value) {
    e.preventDefault();
    endDrag();
  }
};

// --- Wheel Event Handler for Zooming ---
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  if (!canvasEl.value) return;

  const zoomFactor = 0.1;
  const newScale = e.deltaY < 0
    ? scale.value * (1 + zoomFactor) // Zoom in
    : scale.value / (1 + zoomFactor); // Zoom out

  scale.value = Math.max(0.1, Math.min(newScale, 10)); // Clamp scale

  // Zoom towards mouse position (more complex, for simplicity, this example zooms towards center)
  // To implement zoom towards mouse:
  // 1. Get mouse position relative to canvas (logical pixels)
  // const rect = canvasEl.value.getBoundingClientRect();
  // const mouseX = (e.clientX - rect.left);
  // const mouseY = (e.clientY - rect.top);
  // 2. Adjust viewOffsetX/Y based on mouse position and scale change
  // const dpr = window.devicePixelRatio || 1;
  // const logicalMouseX = mouseX / dpr;
  // const logicalMouseY = mouseY / dpr;

  // const scaleChange = newScale / oldScale; // oldScale needs to be stored before updating scale.value
  // viewOffsetX.value = logicalMouseX - (logicalMouseX - viewOffsetX.value) * scaleChange;
  // viewOffsetY.value = logicalMouseY - (logicalMouseY - viewOffsetY.value) * scaleChange;

  drawPath();
};

</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html, #app {
  width: 100%;
  height: 100%;
  background: black;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden; /* Important to prevent scrollbars from canvas content */
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none; /* Prevents default touch actions like scrolling */
}

.coordinates {
  position: absolute;
  top: 15px;
  left: 0px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  backdrop-filter: blur(10px);
  z-index: 10; /* Ensure it's above the canvas */
}
</style>
