<template>
  <div id="app" @touchstart.prevent>
    <canvas ref="canvas" class="canvas" />
    <div class="corner">Lat: {{ currentLat }}, Lon: {{ currentLon }}</div>
    <div class="stats">{{ statsText }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';

const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);
const points = ref<{ lat: number; lon: number; timestamp: number }[]>([]);
const isTracking = ref(false);
const cornerCoordinates = ref('');
const bounds = ref<{
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} | null>(null);
let watchId: string | null = null;

// Define current GPS position
const currentLat = ref(0);
const currentLon = ref(0);

// Computed properties for better UI feedback
const statsText = computed(() => {
  if (points.value.length === 0) return 'No points recorded';
  const duration = points.value.length > 1 
    ? Math.round((points.value[points.value.length - 1].timestamp - points.value[0].timestamp) / 1000)
    : 0;
  return `Points: ${points.value.length} | Duration: ${duration}s`;
});

// Calculate bounds of all points for proper scaling
const calculateBounds = () => {
  if (points.value.length === 0) return;
  
  const lats = points.value.map(p => p.lat);
  const lons = points.value.map(p => p.lon);
  
  bounds.value = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons)
  };
};

// Improved projection that scales to fit the canvas
const project = ({ lat, lon }: { lat: number; lon: number }) => {
  const width = canvas.value!.width;
  const height = canvas.value!.height;
  
  if (!bounds.value || points.value.length < 2) {
    // Fallback to simple projection for first point
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  }
  
  // Scale to fit the canvas with padding
  const padding = 50;
  const latRange = bounds.value.maxLat - bounds.value.minLat;
  const lonRange = bounds.value.maxLon - bounds.value.minLon;
  
  // Prevent division by zero
  const scaleX = lonRange > 0 ? (width - 2 * padding) / lonRange : 1;
  const scaleY = latRange > 0 ? (height - 2 * padding) / latRange : 1;
  const scale = Math.min(scaleX, scaleY);
  
  const centerX = (bounds.value.minLon + bounds.value.maxLon) / 2;
  const centerY = (bounds.value.minLat + bounds.value.maxLat) / 2;
  
  const x = width / 2 + (lon - centerX) * scale;
  const y = height / 2 - (lat - centerY) * scale;
  
  return { x, y };
};

// Draw the complete path
const drawPath = () => {
  if (!context.value || points.value.length < 2) return;
  
  const width = canvas.value!.width;
  const height = canvas.value!.height;
  
  // Clear canvas
  context.value.clearRect(0, 0, width, height);
  
  // Draw grid (optional - helps with orientation)
  drawGrid();
  
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
  context.value.lineWidth = 3;
  context.value.lineCap = 'round';
  context.value.lineJoin = 'round';
  context.value.stroke();
  
  // Draw points along the path
  drawPoints();
  
  // Draw current position indicator
  if (points.value.length > 0) {
    drawCurrentPosition();
  }
};

// Draw a subtle grid
const drawGrid = () => {
  if (!context.value) return;
  const width = canvas.value!.width;
  const height = canvas.value!.height;
  context.value.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  context.value.lineWidth = 1;
  // Vertical lines
  for (let x = 0; x <= width; x += 50) {
    context.value.beginPath();
    context.value.moveTo(x, 0);
    context.value.lineTo(x, height);
    context.value.stroke();
  }
  // Horizontal lines
  for (let y = 0; y <= height; y += 50) {
    context.value.beginPath();
    context.value.moveTo(0, y);
    context.value.lineTo(width, y);
    context.value.stroke();
  }
};

// Draw points along the path
const drawPoints = () => {
  if (!context.value) return;
  context.value.fillStyle = 'rgba(255, 255, 255, 0.6)';
  for (let i = 0; i < points.value.length; i += Math.max(1, Math.floor(points.value.length / 20))) {
    const { x, y } = project(points.value[i]);
    context.value.beginPath();
    context.value.arc(x, y, 2, 0, 2 * Math.PI);
    context.value.fill();
  }
};

// Draw current position with a pulsing effect
const drawCurrentPosition = () => {
  if (!context.value || points.value.length === 0) return;
  const { x, y } = project(points.value[points.value.length - 1]);
  const time = Date.now() * 0.005;
  const pulseSize = 3 + Math.sin(time) * 2;
  // Outer pulse
  context.value.fillStyle = 'rgba(255, 255, 255, 0.3)';
  context.value.beginPath();
  context.value.arc(x, y, pulseSize + 8, 0, 2 * Math.PI);
  context.value.fill();
  // Inner dot
  context.value.fillStyle = 'white';
  context.value.beginPath();
  context.value.arc(x, y, 4, 0, 2 * Math.PI);
  context.value.fill();
};

const addGPSPoint = (position: { coords: { latitude: number; longitude: number } }) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const timestamp = Date.now();
  
  currentLat.value = lat;
  currentLon.value = lon;
  
  points.value.push({ lat, lon, timestamp });
  
  // Recalculate bounds when we have enough points
  if (points.value.length >= 2) {
    calculateBounds();
  }
  
  drawPath();

  const edge = points.value[points.value.length - 1];
  cornerCoordinates.value = `Lat: ${edge.lat.toFixed(6)}, Lon: ${edge.lon.toFixed(6)}`;
};

// Alternative: More complex movement patterns
const toggleTracking = async () => {
  isTracking.value = !isTracking.value;

  if (isTracking.value) {
    const isSimulated = import.meta.env.MODE === 'development';

    if (isSimulated) {
      let lat = 50.0755;
      let lon = 14.4378;
      let time = 0;
      
      watchId = window.setInterval(() => {
        time += 0.1;
        
        // Create a more complex path using parametric equations
        // This creates a figure-8 pattern with some randomness
        const baseLat = 50.0755 + Math.sin(time) * 0.001;
        const baseLon = 14.4378 + Math.sin(time * 0.5) * 0.001;
        
        // Add wandering around the base path
        const wanderLat = Math.sin(time * 2.3) * 0.0002;
        const wanderLon = Math.cos(time * 1.7) * 0.0002;
        
        // Add GPS noise
        const noiseLat = (Math.random() - 0.5) * 0.00001;
        const noiseLon = (Math.random() - 0.5) * 0.00001;
        
        lat = baseLat + wanderLat + noiseLat;
        lon = baseLon + wanderLon + noiseLon;
        
        const position = {
          coords: { 
            latitude: lat, 
            longitude: lon, 
            accuracy: 5 + Math.random() * 10
          },
        };
        addGPSPoint(position);
      }, 100).toString();
    } else {
      watchId = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (position, err) => {
          if (err) {
            console.error('GPS Error:', err);
          } else if (position) {
            addGPSPoint(position);
          }
        }
      );
    }
  } else {
    if (import.meta.env.MODE === 'development') {
      clearInterval(Number(watchId));
    } else {
      if (watchId) await Geolocation.clearWatch({ id: watchId });
    }
    watchId = null;
  }
};

onMounted(() => {
  if (canvas.value) {
    context.value = canvas.value.getContext('2d');
    
    // Initial grid
    if (context.value) {
      drawGrid();
    }
  }
});

onUnmounted(() => {
  if (watchId) toggleTracking();
});
</script>

<style>
body, html, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: black;
  overflow: hidden;
  color: white;
  font-family: monospace;
}
.canvas {
  width: 100%;
  height: 100%;
  touch-action: none;
}
.corner {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 14px;
  background: rgba(0,0,0,0.7);
  padding: 8px 12px;
  border-radius: 6px;
  backdrop-filter: blur(10px);
}
.stats {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 14px;
  background: rgba(0,0,0,0.7);
  padding: 8px 12px;
  border-radius: 6px;
  backdrop-filter: blur(10px);
}
.button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: black;
  padding: 12px 24px;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}
.button:hover {
  background: #f0f0f0;
  transform: translateX(-50%) scale(1.05);
}
.clear-button {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 24px;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
}
.clear-button:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
