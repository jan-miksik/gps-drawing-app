<template>
  <div id="app">
    <canvas
      ref="canvas" 
      class="canvas" 
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @wheel="handleWheel"
    />
    <div class="coordinates">Lat: {{ currentLat }}, Lon: {{ currentLon }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';

const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const points = ref<{ lat: number; lon: number; timestamp: number }[]>([]);
// const isTracking = ref(true);
const bounds = ref<{
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} | null>(null);
let watchId: string | null = null;

// Zoom and pan state
const scale = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const lastX = ref(0);
const lastY = ref(0);

// Current GPS position
const currentLat = ref(0);
const currentLon = ref(0);

// Detect if we're on desktop
const isDesktop = computed(() => {
  return window.innerWidth > 768 && !('ontouchstart' in window);
});

// const statusText = computed(() => {
//   if (points.value.length === 0) return 'Ready to track';
//   const duration = points.value.length > 1 
//     ? Math.round((points.value[points.value.length - 1].timestamp - points.value[0].timestamp) / 1000)
//     : 0;
//   return `Points: ${points.value.length} | Time: ${duration}s | Zoom: ${scale.value.toFixed(1)}x`;
// });

// Function to navigate to desktop version
// const goToDesktop = () => {
//   // Store current data in localStorage for desktop version
//   localStorage.setItem('gps-drawing-data', JSON.stringify({
//     points: points.value,
//     timestamp: Date.now()
//   }));
  
//   // Navigate to desktop version
//   window.location.href = '/desktop.html';
// };

const calculateBounds = () => {
  if (points.value.length === 0) return;
  
  const lats = points.value.map((p: { lat: number; lon: number; timestamp: number }) => p.lat);
  const lons = points.value.map((p: { lat: number; lon: number; timestamp: number }) => p.lon);
  
  bounds.value = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons)
  };
};

const project = ({ lat, lon }: { lat: number; lon: number }) => {
  const width = canvas.value!.width;
  const height = canvas.value!.height;
  
  if (!bounds.value || points.value.length < 2) {
    // Center the first point
    return { x: width / 2, y: height / 2 };
  }
  
  const padding = 80;
  const latRange = bounds.value.maxLat - bounds.value.minLat;
  const lonRange = bounds.value.maxLon - bounds.value.minLon;
  
  const scaleX = lonRange > 0 ? (width - 2 * padding) / lonRange : 1;
  const scaleY = latRange > 0 ? (height - 2 * padding) / latRange : 1;
  const baseScale = Math.min(scaleX, scaleY);
  
  const centerX = (bounds.value.minLon + bounds.value.maxLon) / 2;
  const centerY = (bounds.value.minLat + bounds.value.maxLat) / 2;
  
  let x = width / 2 + (lon - centerX) * baseScale;
  let y = height / 2 - (lat - centerY) * baseScale;
  
  // Apply zoom and pan transforms
  x = (x + offsetX.value) * scale.value;
  y = (y + offsetY.value) * scale.value;
  
  return { x, y };
};

// const resetView = () => {
//   scale.value = 1;
//   offsetX.value = 0;
//   offsetY.value = 0;
//   drawPath();
// };

const drawPath = () => {
  if (!context.value) return;

  console.log('Calling drawPath', points.value.length); 
  
  const width = canvas.value!.width;
  const height = canvas.value!.height;
  
  // Clear canvas
  context.value.clearRect(0, 0, width, height);
  
  // Save context state
  context.value.save();
  
  // Apply zoom and pan transforms
  context.value.translate(offsetX.value * scale.value, offsetY.value * scale.value);
  context.value.scale(scale.value, scale.value);
  
  if (points.value.length < 2) {
    context.value.restore();
    return;
  }
  
  // Draw the path
  context.value.beginPath();
  for (let i = 0; i < points.value.length; i++) {
    const { x, y } = project(points.value[i]);
    if (i === 0) {
      context.value.moveTo(x, y);
    } else {
      context.value.lineTo(x, y);
    }
  }
  
  // Path styling
  context.value.strokeStyle = 'white';
  context.value.lineWidth = 4 / scale.value; // Adjust line width for zoom
  context.value.lineCap = 'round';
  context.value.lineJoin = 'round';
  context.value.stroke();
  
  // Draw current position
  if (points.value.length > 0) {
    const { x, y } = project(points.value[points.value.length - 1]);
    context.value.fillStyle = 'white';
    context.value.beginPath();
    context.value.arc(x, y, 8 / scale.value, 0, 2 * Math.PI); // Adjust circle size for zoom
    context.value.fill();
  }
  
  // Restore context state
  context.value.restore();
};

const addGPSPoint = (position: { coords: { latitude: number; longitude: number } }) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const timestamp = Date.now();

  currentLat.value = lat;
  currentLon.value = lon;

  points.value.push({ lat, lon, timestamp });

  if (points.value.length >= 2) {
    calculateBounds();
  }

  drawPath();
};

// const clearPath = () => {
//   points.value = [];
//   bounds.value = null;
//   scale.value = 1;
//   offsetX.value = 0;
//   offsetY.value = 0;
//   if (context.value && canvas.value) {
//     context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
//   }
// };


onMounted(async () => {
  if (canvas.value) {
    // Set canvas size to match device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.value.getBoundingClientRect();
    
    canvas.value.width = rect.width * dpr;
    canvas.value.height = rect.height * dpr;
    canvas.value.style.width = rect.width + 'px';
    canvas.value.style.height = rect.height + 'px';
    
    context.value = canvas.value.getContext('2d');
    if (context.value) {
      context.value.scale(dpr, dpr);
    }
  }
  
  // Start GPS tracking
  try {
    const permission = await Geolocation.checkPermissions();
    if (permission.location !== 'granted') {
      await Geolocation.requestPermissions();
    }
    
    watchId = await Geolocation.watchPosition(
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      },
      (position: any, err: any) => {
        if (err) {
          console.error('GPS Error:', err);
        } else if (position) {
          addGPSPoint(position);
        }
      }
    );
  } catch (error) {
    console.error('Failed to start tracking:', error);
  }
  
  // Load data from desktop version if available
  loadDataFromDesktop();
});

// Function to load data from desktop version
const loadDataFromDesktop = () => {
  try {
    const savedData = localStorage.getItem('gps-drawing-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.points && data.points.length > 0) {
        points.value = data.points;
        if (points.value.length >= 2) {
          calculateBounds();
        }
        drawPath();
        
        // Clear the saved data after loading
        localStorage.removeItem('gps-drawing-data');
      }
    }
  } catch (error) {
    console.error('Error loading data from desktop:', error);
  }
};

onUnmounted(() => {
  if (watchId) {
    Geolocation.clearWatch({ id: watchId });
  }
});

// Touch and mouse event handlers
const handleTouchStart = (e: TouchEvent) => {
  e.preventDefault();
  if (e.touches.length === 1) {
    isDragging.value = true;
    lastX.value = e.touches[0].clientX;
    lastY.value = e.touches[0].clientY;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  e.preventDefault();
  if (isDragging.value && e.touches.length === 1) {
    const deltaX = e.touches[0].clientX - lastX.value;
    const deltaY = e.touches[0].clientY - lastY.value;
    
    offsetX.value += deltaX;
    offsetY.value += deltaY;
    
    lastX.value = e.touches[0].clientX;
    lastY.value = e.touches[0].clientY;
    
    drawPath();
  }
};

const handleTouchEnd = () => {
  isDragging.value = false;
};

const handleMouseDown = (e: MouseEvent) => {
  if (isDesktop.value) {
    isDragging.value = true;
    lastX.value = e.clientX;
    lastY.value = e.clientY;
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value && isDesktop.value) {
    const deltaX = e.clientX - lastX.value;
    const deltaY = e.clientY - lastY.value;
    
    offsetX.value += deltaX;
    offsetY.value += deltaY;
    
    lastX.value = e.clientX;
    lastY.value = e.clientY;
    
    drawPath();
  }
};

const handleMouseUp = () => {
  isDragging.value = false;
};

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  
  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
  const newScale = Math.max(0.1, Math.min(10, scale.value * zoomFactor));
  
  // Zoom towards mouse position
  const rect = canvas.value!.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  const scaleChange = newScale / scale.value;
  offsetX.value = mouseX - (mouseX - offsetX.value) * scaleChange;
  offsetY.value = mouseY - (mouseY - offsetY.value) * scaleChange;
  
  scale.value = newScale;
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
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}

.canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
}

.status {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.track-button {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: black;
  border: none;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 12px;
  cursor: pointer;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.track-button:active {
  transform: translateX(-50%) scale(0.95);
}

.clear-button {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
}

.clear-button:active {
  background: rgba(255, 255, 255, 0.3);
}

.reset-button {
  position: absolute;
  bottom: 180px; /* Position above the clear button */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
}

.reset-button:active {
  background: rgba(255, 255, 255, 0.3);
}

.reset-button:active {
  background: rgba(255, 255, 255, 0.3);
}

.desktop-link {
  position: absolute;
  bottom: 140px; /* Adjust position to be above the clear button */
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  cursor: pointer;
  display: none; /* Hide by default, show only on desktop */
}

.desktop-link:active {
  background: rgba(255, 255, 255, 0.3);
}

/* Show desktop link only on desktop */
@media (min-width: 769px) {
  .desktop-link {
    display: block;
  }
}

.coordinates {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  backdrop-filter: blur(10px);
}
</style>
