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
    <!-- <div class="coordinates">lat {{ currentLat.toFixed(POINTS_PRECISION) }}, lon: {{ currentLon.toFixed(POINTS_PRECISION) }}</div> -->
    
    <!-- GPS Accuracy Indicator -->
    <div class="accuracy-status" :class="`signal-${gpsSignalQuality}`">
      <div class="accuracy-status-text">
        Accuracy
        <!-- : {{ gpsSignalQuality.toUpperCase() }} -->
        <span v-if="currentAccuracy !== null" class="accuracy-value">
          ±{{ currentAccuracy.toFixed(0) }}m
        </span>
      </div>
    </div>

    <!-- GPS Points List Button -->
    <button @click="showModal = true" class="gps-points-button">
      <span class="gps-points-button-text">Points ({{ points.length }})</span>
    </button>



    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
                <div class="modal-header">
          <div class="header-left">
            <h2>GPS Points ({{ points.length }})</h2>
            <label class="toggle-label">
              <input 
                type="checkbox" 
                :checked="!isAnonymized"
                @change="toggleAnonymization"
                class="toggle-checkbox"
              />
              <span class="toggle-text">Real Position</span>
            </label>
          </div>
          <button @click="closeModal" class="close-button">✕</button>
        </div>
        
        <div class="modal-body">
          <div v-if="points.length === 0" class="no-points">
            No GPS points recorded yet.
          </div>
          
          <div v-else class="points-list">
            <div class="list-header">
              <div class="header-item index">Index</div>
              <div class="header-item lat">{{ isAnonymized ? 'Rel. Lat' : 'Latitude' }}</div>
              <div class="header-item lon">{{ isAnonymized ? 'Rel. Lon' : 'Longitude' }}</div>
              <div class="header-item time">Time</div>
            </div>
            
            <div class="list-body">
              <div 
                v-for="(point, index) in [...displayPoints].reverse()" 
                :key="`${point.lat}-${point.lon}-${point.timestamp}`"
                class="point-row"
                :class="{ 'current-point': index === 0 }"
              >
                <div class="row-item index">{{ points.length - index }}</div>
                <div class="row-item lat">{{ point.lat.toFixed(POINTS_PRECISION) }}</div>
                <div class="row-item lon">{{ point.lon.toFixed(POINTS_PRECISION) }}</div>
                <div class="row-item time">{{ formatTime(point.timestamp, displayPoints.length - 1 - index, displayPoints) }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="footer-left">
            <button @click="exportPoints" class="export-button">
              Export
            </button>
            <div @click="clearAllPoints" class="clear-button-1">
              Clear All
            </div>
          </div>
          <div class="footer-right">
            <button @click="closeModal" class="close-button-footer">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { Geolocation } from '@capacitor/geolocation';

const POINTS_PRECISION = 5;

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

// Modal state
const showModal = ref(false);

// Anonymization state
const isAnonymized = ref(true); // Start anonymized by default
const anonymizationOrigin = ref<{lat: number, lon: number} | null>(null);

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

// GPS accuracy settings and state
const GPS_ACCURACY_THRESHOLD = 20; // meters - reject points with worse accuracy
const GPS_SMOOTHING_WINDOW = 3; // number of points to average for smoothing
const currentAccuracy = ref<number | null>(null);
const gpsSignalQuality = ref<'excellent' | 'good' | 'fair' | 'poor' | 'unknown'>('unknown');

// Padding around the drawing within the canvas
const DRAWING_PADDING = 40; // In logical pixels

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

const FILE_NAME = 'gps_points.json';

// Anonymization functions
const setAnonymizationOrigin = () => {
  if (points.value.length > 0) {
    // Use the first point as the origin for anonymization
    const firstPoint = points.value[0];
    anonymizationOrigin.value = {
      lat: firstPoint.lat,
      lon: firstPoint.lon
    };
  }
};

const anonymizePoint = (point: Point): Point => {
  if (!anonymizationOrigin.value) {
    setAnonymizationOrigin();
  }
  
  if (!anonymizationOrigin.value) {
    return point; // Fallback if no origin set
  }

  // Convert to relative coordinates (preserving distances)
  return {
    lat: point.lat - anonymizationOrigin.value.lat,
    lon: point.lon - anonymizationOrigin.value.lon,
    timestamp: point.timestamp // Keep original timestamp
  };
};

const anonymizePoints = (pointsArray: Point[]): Point[] => {
  if (pointsArray.length === 0) return pointsArray;
  
  if (!anonymizationOrigin.value) {
    setAnonymizationOrigin();
  }
  
  return pointsArray.map(point => anonymizePoint(point));
};

// Computed property for display points (either real or anonymized)
const displayPoints = computed(() => {
  return isAnonymized.value ? anonymizePoints(points.value) : points.value;
});

// Computed property for display bounds
const displayBounds = computed(() => {
  if (!bounds.value) return null;
  
  if (!isAnonymized.value) return bounds.value;
  
  // Calculate bounds for anonymized data
  const anonPoints = anonymizePoints(points.value);
  if (anonPoints.length === 0) return null;
  
  if (anonPoints.length === 1) {
    const p = anonPoints[0];
    const delta = 0.0001;
    return {
      minLat: p.lat - delta,
      maxLat: p.lat + delta,
      minLon: p.lon - delta,
      maxLon: p.lon + delta,
    };
  }

  const lats = anonPoints.map(p => p.lat);
  const lons = anonPoints.map(p => p.lon);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
  };
});

const toggleAnonymization = () => {
  isAnonymized.value = !isAnonymized.value;
  
  // Set origin when first enabling anonymization
  if (isAnonymized.value && !anonymizationOrigin.value) {
    setAnonymizationOrigin();
  }
  
  // Redraw the path with new data
  nextTick(() => {
    drawPath();
  });
};

// GPS accuracy helper functions
// const getSignalQuality = (accuracy: number): 'excellent' | 'good' | 'fair' | 'poor' => {
//   if (accuracy <= 5) return 'excellent';
//   if (accuracy <= 10) return 'good';
//   if (accuracy <= 20) return 'fair';
//   return 'poor';
// };

const smoothGPSPoints = (newPoint: Point): Point => {
  if (points.value.length < GPS_SMOOTHING_WINDOW) {
    return newPoint;
  }
  
  // Get the last N points including the new one
  const recentPoints = [...points.value.slice(-GPS_SMOOTHING_WINDOW + 1), newPoint];
  
  // Calculate moving average
  const avgLat = recentPoints.reduce((sum, p) => sum + p.lat, 0) / recentPoints.length;
  const avgLon = recentPoints.reduce((sum, p) => sum + p.lon, 0) / recentPoints.length;
  
  return {
    lat: Math.round(avgLat * Math.pow(10, POINTS_PRECISION)) / Math.pow(10, POINTS_PRECISION),
    lon: Math.round(avgLon * Math.pow(10, POINTS_PRECISION)) / Math.pow(10, POINTS_PRECISION),
    timestamp: newPoint.timestamp
  };
};

const savePointsToFile = async () => {
  try {
    await Filesystem.writeFile({
      path: FILE_NAME,
      data: JSON.stringify(points.value),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    // console.log('Points saved to file');
  } catch (e) {
    console.error('Failed to save GPS points to file', e);
  }
};

const loadPointsFromFile = async () => {
  try {
    const result = await Filesystem.readFile({
      path: FILE_NAME,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    // Fix TypeScript error by ensuring result.data is treated as string
    const dataString = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
    points.value = JSON.parse(dataString);
    calculateBounds();
    drawPath();
    // console.log('Points loaded from file');
  } catch (e) {
    console.warn('No saved file found. Starting fresh.', e);
  }
};

// Modal functions
const closeModal = () => {
  showModal.value = false;
};

const formatTime = (timestamp: number, index: number, allPoints: Point[]): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if this is the first point or if the date changed from previous point
  const isFirstPoint = index === 0;
  const dateChanged = !isFirstPoint && 
    new Date(allPoints[index - 1].timestamp).toDateString() !== date.toDateString();
  
  const timeString = date.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Always show "Today" for today's dates
  if (date.toDateString() === today.toDateString()) {
    return `Today ${timeString}`;
  }
  
  // Show date if it's the first point or date changed (for non-today dates)
  if (isFirstPoint || dateChanged) {
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeString}`;
    } else {
      const dateString = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
      return `${dateString} ${timeString}`;
    }
  }
  
  return timeString;
};

const exportPoints = async () => {
  try {
    if (points.value.length === 0) {
      alert('No GPS points to export');
      return;
    }

    const currentTime = new Date();
    const timestamp = currentTime.toISOString().replace(/[:.]/g, '-').split('T')[0];
    
    const dataToExport = {
      exportDate: currentTime.toISOString(),
      totalPoints: points.value.length,
      isAnonymized: isAnonymized.value,
      ...(isAnonymized.value && anonymizationOrigin.value && {
        anonymizationOrigin: anonymizationOrigin.value,
        note: "Coordinates are anonymized - showing relative distances from first point"
      }),
      points: displayPoints.value.map((point, index) => ({
        index: index + 1,
        latitude: point.lat,
        longitude: point.lon,
        timestamp: point.timestamp,
        time: new Date(point.timestamp).toISOString()
      }))
    };

    const exportData = JSON.stringify(dataToExport, null, 2);
    const suffix = isAnonymized.value ? '_anonymized' : '';
    const fileName = `gps_export${suffix}_${timestamp}.json`;

    // Try external storage first, fallback to data directory
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: exportData,
        directory: Directory.ExternalStorage,
        encoding: Encoding.UTF8,
      });
      
      const exportType = isAnonymized.value ? 'anonymized' : 'real GPS';
      alert(`✅ Exported ${points.value.length} ${exportType} points to Downloads/${fileName}`);
    } catch (externalError) {
      console.warn('External storage failed, trying Documents:', externalError);
      
      // Fallback to Documents directory
      await Filesystem.writeFile({
        path: fileName,
        data: exportData,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      
      const exportType = isAnonymized.value ? 'anonymized' : 'real GPS';
      alert(`✅ Exported ${points.value.length} ${exportType} points to Documents/${fileName}`);
    }
    
  } catch (error: any) {
    console.error('Export failed:', error);
    
    // More detailed error messages
    if (error.message?.includes('permission')) {
      alert('❌ Export failed: Storage permission denied. Please check app permissions.');
    } else if (error.message?.includes('space')) {
      alert('❌ Export failed: Not enough storage space.');
    } else {
      alert(`❌ Export failed: ${error.message || 'Unknown error'}. Check console for details.`);
    }
  }
};

const clearAllPoints = async () => {
  if (confirm(`Are you sure you want to delete all ${points.value.length} GPS points? This cannot be undone.`)) {
    points.value = [];
    bounds.value = null;
    anonymizationOrigin.value = null;
    currentLat.value = 0;
    currentLon.value = 0;
    
    // Clear the saved file
    try {
      await Filesystem.deleteFile({
        path: FILE_NAME,
        directory: Directory.Data,
      });
    } catch (e) {
      console.warn('No file to delete or delete failed:', e);
    }
    
    // Redraw canvas
    drawPath();
    closeModal();
  }
};

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

  const currentDisplayPoints = displayPoints.value;
  const currentBounds = displayBounds.value;

  if (currentDisplayPoints.length === 0 || !currentBounds) {
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
  if (currentDisplayPoints.length >= 1 && currentBounds) { // Need at least one point to draw a dot
    ctx.beginPath();
    for (let i = 0; i < currentDisplayPoints.length; i++) {
      const { x, y } = project(currentDisplayPoints[i], currentBounds, logicalWidth, logicalHeight);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    if (currentDisplayPoints.length > 1) { // Only stroke if there's a path
        ctx.strokeStyle = 'white';
        // Adjust line width based on current view scale, so it appears consistent
        ctx.lineWidth = 2 / (scale.value * dpr) ; // More refined line width adjustment
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }

    // Draw current position as a dot (even if it's the only point)
    const lastPoint = currentDisplayPoints[currentDisplayPoints.length - 1];
    const { x: lastX, y: lastY } = project(lastPoint, currentBounds, logicalWidth, logicalHeight);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 10 / (scale.value * dpr), 0, 2 * Math.PI); // Adjust dot size
    ctx.fill();
  }
  // --- End Drawing logic ---

  ctx.restore(); // Restore to the state before pan/zoom/DPR
};

const addGPSPoint = (position: { coords: { latitude: number; longitude: number; accuracy?: number; speed?: number | null; heading?: number | null } } | null) => {
  if (!position) {
    console.warn('Received null position in addGPSPoint');
    return;
  }
  
  const accuracy = position.coords.accuracy || 999;
  currentAccuracy.value = accuracy;
  // gpsSignalQuality.value = getSignalQuality(accuracy);
  
  // Log GPS metadata for debugging
  console.log('GPS Position:', {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    accuracy: accuracy,
    speed: position.coords.speed || 'unknown',
    heading: position.coords.heading || 'unknown',
    quality: gpsSignalQuality.value
  });
  
  // Filter out low-accuracy points
  if (accuracy > GPS_ACCURACY_THRESHOLD) {
    console.warn(`Skipping low-accuracy GPS point: ${accuracy.toFixed(1)}m (threshold: ${GPS_ACCURACY_THRESHOLD}m)`);
    return;
  }
  
  // Round coordinates to specified precision to save storage space
  const lat = Math.round(position.coords.latitude * Math.pow(10, POINTS_PRECISION)) / Math.pow(10, POINTS_PRECISION);
  const lon = Math.round(position.coords.longitude * Math.pow(10, POINTS_PRECISION)) / Math.pow(10, POINTS_PRECISION);
  const timestamp = Date.now();

  currentLat.value = lat;
  currentLon.value = lon;

  // Create new point and apply smoothing
  const newPoint: Point = { lat, lon, timestamp };
  const smoothedPoint = smoothGPSPoints(newPoint);
  
  points.value.push(smoothedPoint);
  calculateBounds(); // Recalculate bounds with the new point

  // Set anonymization origin if this is the first point and anonymization is enabled
  if (points.value.length === 1 && isAnonymized.value && !anonymizationOrigin.value) {
    setAnonymizationOrigin();
  }

  savePointsToFile(); // ✅ Save locally

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

  await loadPointsFromFile(); // ✅ Load existing points

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
        timeout: 15000, // Increased timeout to allow more time for precise fix
        maximumAge: 1000 // Use fresher data (reduced from 3000ms)
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

.accuracy-status {
  position: absolute;
  bottom: calc(50px + env(safe-area-inset-bottom));
  left: 20px;
  font-size: 14px;
  z-index: 10;
  transition: color 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.accuracy-status.signal-excellent {
  color: #4CAF50;
}

.accuracy-status.signal-good {
  color: #8BC34A;
}

.accuracy-status.signal-fair {
  color: #FFC107;
}

.accuracy-status.signal-poor {
  color: #F44336;
}

.accuracy-status.signal-unknown {
  color: #9E9E9E;
}

.accuracy-status-text {
  font-weight: 600;
}

.accuracy-value {
  font-weight: normal;
  opacity: 0.9;
}

.gps-points-button {
  position: absolute;
  bottom: calc(45px + env(safe-area-inset-bottom));
  right: 20px;
  background-color: transparent;
  color: white;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: 14px;
  z-index: 10;
  cursor: pointer;
  transition: border-color 0.3s ease;
  margin-bottom: env(safe-area-inset-bottom);
}

.gps-points-button:hover {
  border-bottom-color: rgba(255, 255, 255, 0.6);
}

.gps-points-button-text {
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: rgb(131, 131, 131);
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}



.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(0, 0, 0, 0.9);
  border-radius: 0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: max(env(safe-area-inset-top), 20px);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.8);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: rgba(255, 255, 255, 0.7);
}

.toggle-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: normal;
}

.modal-header h2 {
  margin: 0;
  color: white;
  font-size: 20px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  line-height: 1;
  transition: color 0.3s ease;
  align-self: flex-start;
}

.close-button:hover {
  color: #ff6b6b;
}

.modal-body {
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.no-points {
  text-align: center;
  color: #888;
  padding: 20px;
}

.points-list {
  border-collapse: collapse;
  width: 100%;
}

.list-header {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-weight: bold;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  display: flex;
  align-items: center;
}

.header-item {
  display: inline-block;
  padding: 0 6px;
  font-size: 11px;
}

.header-item.index {
  width: 40px;
  text-align: center;
}

.header-item.lat, .header-item.lon {
  width: 85px;
  text-align: center;
}

.header-item.time {
  width: 110px;
  text-align: center;
}

.list-body {
  /* No specific styles needed, table will handle layout */
}

.point-row {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
}

.point-row:last-child {
  border-bottom: none;
}

.point-row.current-point {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 4px solid white;
  padding-left: 8px;
}

.row-item {
  display: inline-block;
  padding: 0 6px;
  font-size: 11px;
}

.row-item.index {
  width: 40px;
  text-align: center;
}

.row-item.lat, .row-item.lon {
  width: 85px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.row-item.time {
  width: 110px;
  text-align: center;
  font-size: 11px;
}

.modal-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.8);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.footer-right {
  display: flex;
  align-items: center;
}

.export-button, .clear-button-1, .close-button-footer  {
  all: unset;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
  backdrop-filter: blur(10px);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
  flex-shrink: 0;
}

.export-button:hover, .clear-button-1:hover, .close-button-footer:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

</style>
