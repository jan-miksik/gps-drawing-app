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
    
    <GPSStatusBar 
      :gps-signal-quality="gpsSignalQuality"
      :current-accuracy="currentAccuracy"
    />
    
    <button @click="showModal = true" class="gps-points-button">
      <span class="gps-points-button-text">Points ({{ points.length }})</span>
    </button>

    <GPSPointsModal
      :show="showModal"
      :points="points"
      :display-points="displayPoints"
      :is-anonymized="isAnonymized"
      :anonymization-origin="anonymizationOrigin"
      @close="showModal = false"
      @toggle-anonymization="toggleAnonymization"
      @export="handleExport"
      @clear="handleClearAll"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import type { Point, AnonymizationOrigin } from './types/gps';
import { useGPS } from './composables/useGPS';
import { useCanvas } from './composables/useCanvas';
import { useFileOperations } from './composables/useFileOperations';
import { useInteractions } from './composables/useInteractions';
import GPSStatusBar from './components/GPSStatusBar.vue';
import GPSPointsModal from './components/GPSPointsModal.vue';
import { anonymizePoints, createAnonymizationOrigin } from './utils/coordinateUtils';

// State
const showModal = ref(false);
const points = ref<Point[]>([]);
const isAnonymized = ref(true);
const anonymizationOrigin = ref<AnonymizationOrigin | null>(null);

// Composables
const { currentAccuracy, gpsSignalQuality, startGPSTracking, stopGPSTracking, shouldAddPoint, processNewPoint } = useGPS();
const { canvasEl, setupCanvas, drawPath, calculateBounds, pan, zoom } = useCanvas();
const { loadPointsFromFile, savePointsToFile, exportPoints, clearAllData } = useFileOperations();
const { 
  handleTouchStart, 
  handleTouchMove, 
  handleTouchEnd, 
  handleMouseDown, 
  handleMouseMove, 
  handleMouseUp, 
  handleWheel 
} = useInteractions(
  (deltaX: number, deltaY: number) => {
    pan(deltaX, deltaY);
    redrawCanvas();
  },
  (deltaY: number) => {
    zoom(deltaY);
    redrawCanvas();
  }
);

// Computed properties
const displayPoints = computed(() => {
  return isAnonymized.value && anonymizationOrigin.value 
    ? anonymizePoints(points.value, anonymizationOrigin.value)
    : points.value;
});

const displayBounds = computed(() => {
  return calculateBounds(displayPoints.value);
});

// Methods
const addGPSPoint = (newPoint: Point): void => {
  if (!shouldAddPoint(points.value, newPoint)) {
    return;
  }

  const processedPoint = processNewPoint(points.value, newPoint);
  points.value.push(processedPoint);

  // Set anonymization origin if this is the first point
  if (points.value.length === 1 && isAnonymized.value && !anonymizationOrigin.value) {
    anonymizationOrigin.value = createAnonymizationOrigin(points.value);
  }

  savePointsToFile(points.value);
  redrawCanvas();
};

const redrawCanvas = (): void => {
  nextTick(() => {
    drawPath(displayPoints.value, displayBounds.value);
  });
};

const toggleAnonymization = (): void => {
  isAnonymized.value = !isAnonymized.value;
  
  // Set origin when first enabling anonymization
  if (isAnonymized.value && !anonymizationOrigin.value) {
    anonymizationOrigin.value = createAnonymizationOrigin(points.value);
  }
  
  redrawCanvas();
};

const handleExport = async (): Promise<void> => {
  await exportPoints(points.value, isAnonymized.value, anonymizationOrigin.value);
};

const handleClearAll = async (): Promise<void> => {
  points.value = [];
  anonymizationOrigin.value = null;
  await clearAllData();
  redrawCanvas();
  showModal.value = false;
};

// Lifecycle
onMounted(async () => {
  setupCanvas();
  
  // Load existing points
  const loadedPoints = await loadPointsFromFile();
  if (loadedPoints.length > 0) {
    points.value = loadedPoints;
    if (isAnonymized.value && !anonymizationOrigin.value) {
      anonymizationOrigin.value = createAnonymizationOrigin(points.value);
    }
  }
  
  // Setup canvas resize listener
  window.addEventListener('resize', setupCanvas);
  
  // Start GPS tracking
  startGPSTracking(addGPSPoint);
  
  // Initial draw
  redrawCanvas();
});

onUnmounted(() => {
  stopGPSTracking();
  window.removeEventListener('resize', setupCanvas);
});
</script>

<style src="./styles/app.css"></style>
