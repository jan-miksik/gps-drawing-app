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
    
    <!-- <GPSStatusBar 
      @click="showDevLogs"
      :gps-signal-quality="gpsSignalQuality"
    /> -->
    
    <button 
      @click="showModal = true" 
      class="gps-points-button"
      title="Click: Open GPS Points"
    >
      <span class="gps-points-button-text">Points ({{ points.length }})</span>
    </button>

    <button 
      @click="handleDirectExport" 
      class="export-button-main"
      title="Export drawing as image"
    >
      <span class="export-button-text">Export</span>
    </button>

    <!-- Reset Zoom Button - appears when zoomed -->
    <button 
      v-if="scale !== 1 || viewOffsetX !== 0 || viewOffsetY !== 0"
      @click="handleResetZoom" 
      class="reset-zoom-button"
      title="Reset zoom and center"
    >
      <span class="reset-zoom-icon">⌖</span>
    </button>

    <GPSPointsModal
      :show="showModal"
      :points="points"
      :display-points="displayPoints"
      :is-anonymized="isAnonymized"
      :anonymization-origin="anonymizationOrigin"
      :background-active="isBackgroundGPSActive"
      :current-accuracy="currentAccuracy"
      :settings="settings"
      @close="showModal = false"
      @toggle-anonymization="toggleAnonymization"
      @export="showExportModal = true"
      @clear="handleClearAll"
      @settings-save="handleSettingsSave"
    />

    <ExportModal
      :show="showExportModal"
      :points="points"
      @close="showExportModal = false"
      @export-image="handleExportImage"
      @export-data="handleExportData"
    />

    <DevLogsModal
      :show="isDevLogsVisible"
      :logs="logs"
      :format-log-time="formatLogTime"
      @close="hideDevLogs"
      @clear="clearLogs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import type { Point, AnonymizationOrigin } from './types/gps';
import { useGPS } from './composables/useGPS';
import { useBackgroundGPS } from './composables/useBackgroundGPS';
import { useCanvas } from './composables/useCanvas';
import { useFileOperations } from './composables/useFileOperations';
import { useInteractions } from './composables/useInteractions';
import { useDevLogs } from './composables/useDevLogs';
import { GPS_CONFIG, CANVAS_CONFIG, updateGPSConfig, updateCanvasConfig } from './constants/gpsConstants';
// import GPSStatusBar from './components/GPSStatusBar.vue';
import GPSPointsModal from './components/GPSPointsModal.vue';
import ExportModal from './components/ExportModal.vue';
import DevLogsModal from './components/DevLogsModal.vue';
import { anonymizePoints, createAnonymizationOrigin } from './utils/coordinateUtils';
import { getSignalQuality } from './utils/gpsUtils';

// State
const showModal = ref(false);
const showExportModal = ref(false);
const points = ref<Point[]>([]);
const isAnonymized = ref(true);
const anonymizationOrigin = ref<AnonymizationOrigin | null>(null);

// Settings state - use computed to sync with actual configs
const settings = computed(() => ({
  ACCURACY_THRESHOLD: GPS_CONFIG.value.ACCURACY_THRESHOLD,
  DISTANCE_THRESHOLD: GPS_CONFIG.value.DISTANCE_THRESHOLD,
  MIN_TIME_INTERVAL: GPS_CONFIG.value.MIN_TIME_INTERVAL / 1000, // Convert to seconds for UI
  PINCH_ZOOM_SENSITIVITY: CANVAS_CONFIG.value.PINCH_ZOOM_SENSITIVITY,
  MIN_SCALE: CANVAS_CONFIG.value.MIN_SCALE,
  MAX_SCALE: CANVAS_CONFIG.value.MAX_SCALE,
  LINE_WIDTH: CANVAS_CONFIG.value.LINE_WIDTH,
}));

// Composables
const { currentAccuracy, gpsSignalQuality, startGPSTracking, stopGPSTracking, shouldAddPoint, processNewPoint } = useGPS();
const { isBackgroundGPSActive, initBackgroundGPS, stopBackgroundGPS, removeBackgroundGPSListeners } = useBackgroundGPS();
const { canvasEl, setupCanvas, drawPath, calculateBounds, pan, zoom, resetView, scale, viewOffsetX, viewOffsetY } = useCanvas();
const { loadPointsFromFile, savePointsToFile, exportPoints, exportCanvasAsImage, clearAllData } = useFileOperations();
const { logs, isDevLogsVisible, logInfo, logWarn, logError, clearLogs, hideDevLogs, formatLogTime } = useDevLogs();
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
  },
  () => {
    resetView();
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
    logInfo('GPS point filtered out', { 
      reason: 'distance/time threshold', 
      point: newPoint 
    });
    return;
  }

  // const processedPoint = processNewPoint(points.value, newPoint);
  points.value.push(newPoint);
  logInfo('Foreground GPS point added', newPoint);

  // Set anonymization origin if this is the first point
  if (points.value.length === 1 && isAnonymized.value && !anonymizationOrigin.value) {
    anonymizationOrigin.value = createAnonymizationOrigin(points.value);
  }

  savePointsToFile(points.value);
  redrawCanvas();
};

// Background GPS accuracy handler (updates display for every GPS reading)
const updateCurrentAccuracy = (accuracy: number): void => {
  currentAccuracy.value = accuracy;
  gpsSignalQuality.value = getSignalQuality(accuracy);
};

// Background GPS point handler
const addBackgroundGPSPoint = async (newPoint: Point): Promise<void> => {
  logInfo('Background GPS point received', newPoint);
  
  if (!shouldAddPoint(points.value, newPoint)) {
    return;
  }

  const processedPoint = processNewPoint(newPoint);
  logInfo('Background GPS point processedPoint', processedPoint);
  points.value.push(processedPoint);

  // Set anonymization origin if this is the first point
  if (points.value.length === 1 && isAnonymized.value && !anonymizationOrigin.value) {
    anonymizationOrigin.value = createAnonymizationOrigin(points.value);
  }

  // Save to file (this will handle both foreground and background points)
  await savePointsToFile([processedPoint], true); // true = append mode
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

const handleDirectExport = async (): Promise<void> => {
  try {
    if (!canvasEl.value) {
      logError('Canvas element not available for image export');
      return;
    }
    
    await exportCanvasAsImage(canvasEl.value, points.value, isAnonymized.value, anonymizationOrigin.value);
    logInfo('Drawing exported as SVG successfully');
  } catch (error) {
    logError('Failed to export drawing as SVG', error);
  }
};

const handleExportImage = async (): Promise<void> => {
  try {
    if (!canvasEl.value) {
      logError('Canvas element not available for image export');
      return;
    }
    
    await exportCanvasAsImage(canvasEl.value, points.value, isAnonymized.value, anonymizationOrigin.value);
    showExportModal.value = false;
    logInfo('Drawing exported as SVG successfully');
  } catch (error) {
    logError('Failed to export drawing as SVG', error);
  }
};

const handleExportData = async (coordinateType: 'relative' | 'exact'): Promise<void> => {
  try {
    await exportPoints(points.value, coordinateType, anonymizationOrigin.value);
    showExportModal.value = false;
    logInfo('GPS points exported successfully', { 
      count: points.value.length, 
      coordinateType 
    });
  } catch (error) {
    logError('Failed to export GPS points', error);
  }
};

const handleClearAll = async (): Promise<void> => {
  const pointCount = points.value.length;
  points.value = [];
  anonymizationOrigin.value = null;
  await clearAllData();
  redrawCanvas();
  showModal.value = false;
  logInfo('All GPS points cleared', { clearedCount: pointCount });
};

const handleSettingsSave = (newSettings: any): void => {
  // Update GPS config
  updateGPSConfig({
    ACCURACY_THRESHOLD: newSettings.ACCURACY_THRESHOLD,
    DISTANCE_THRESHOLD: newSettings.DISTANCE_THRESHOLD,
    MIN_TIME_INTERVAL: newSettings.MIN_TIME_INTERVAL * 1000, // Convert back to milliseconds
  });
  
  // Update Canvas config
  updateCanvasConfig({
    PINCH_ZOOM_SENSITIVITY: newSettings.PINCH_ZOOM_SENSITIVITY,
    MIN_SCALE: newSettings.MIN_SCALE,
    MAX_SCALE: newSettings.MAX_SCALE,
    LINE_WIDTH: newSettings.LINE_WIDTH,
  });
  
  logInfo('Settings updated', newSettings);
};

const handleResetZoom = (): void => {
  resetView();
  redrawCanvas();
  logInfo('Zoom and view reset to default');
};

// Lifecycle
onMounted(async () => {
  logInfo('App starting up');
  
  setupCanvas();
  
  // Load existing points
  const loadedPoints = await loadPointsFromFile();
  if (loadedPoints.length > 0) {
    points.value = loadedPoints;
    logInfo('Loaded existing GPS points', { count: loadedPoints.length });
    if (isAnonymized.value && !anonymizationOrigin.value) {
      anonymizationOrigin.value = createAnonymizationOrigin(points.value);
    }
  } else {
    logInfo('No existing GPS points found');
  }
  
  // Setup canvas resize listener
  window.addEventListener('resize', setupCanvas);
  logInfo('Canvas setup completed');
  
  // Use background GPS for all tracking (handles both foreground and background)
  try {
    await initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy);
    logInfo('Background GPS initialized successfully');
  } catch (error) {
    logError('Failed to initialize background GPS', error);
    // Fallback to regular GPS if background GPS fails
    logWarn('Falling back to regular GPS tracking');
    try {
      await startGPSTracking(addGPSPoint);
      logInfo('Foreground GPS tracking started');
    } catch (fallbackError) {
      logError('Failed to start foreground GPS', fallbackError);
    }
  }
  
  // Initial draw
  redrawCanvas();
  logInfo('App initialization completed');
});

onUnmounted(async () => {
  // Stop GPS tracking
  stopGPSTracking();
  
  // Stop and cleanup background GPS tracking
  try {
    await stopBackgroundGPS();
    await removeBackgroundGPSListeners();
    console.log('Background GPS stopped and cleaned up');
  } catch (error) {
    console.error('Error stopping background GPS:', error);
  }
  
  window.removeEventListener('resize', setupCanvas);
});
</script>

<style src="./styles/app.css"></style>
