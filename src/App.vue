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
    
  
    <!-- Buttons -->
    <BaseButton 
      v-if="IS_DEV_MODE" 
      @click="isDevLogsVisible = true" 
      variant="circular"
      position="top-left"
      title="Open Dev Logs"
    >
      <span class="dev-logs-icon">📋</span>
    </BaseButton>
    
    <BaseButton 
      @click="showGPSPointsModal = true" 
      variant="primary"
      position="bottom-right"
      title="Click: Open GPS Points"
    >
      <span class="gps-points-button-text">Points ({{ points.length }})</span>
    </BaseButton>

    <BaseButton 
      @click="handleDirectExport" 
      variant="primary"
      position="bottom-left"
      title="Export drawing as image"
    >
      <span class="export-button-text">Export</span>
    </BaseButton>

    <!-- Reset Zoom Button - appears when zoomed or pan the map-->
    <button 
      v-show="scale !== CANVAS_CONFIG.DEFAULT_SCALE || viewOffsetX !== 0 || viewOffsetY !== 0"
      @click="handleResetZoom" 
      class="reset-zoom-button"
      title="Reset zoom and center"
    >
      <span class="reset-zoom-icon"> <img src="/reset-zoom.svg" alt="Reset zoom" class="reset-zoom-icon-image" /></span>
    </button>


    <!-- Modals -->
    <PermissionModal
      :location-permission="locationPermission"
      :notification-permission="notificationPermission"
      :is-requesting="isRequestingNotificationPermission"
      @request-location-permission="requestLocationPermission"
      @open-settings="handleOpenAppSettings"
      @request-notification-permission="requestNotificationPermission"
    />

    <GPSPointsModal
      :show="showGPSPointsModal"
      :points="points"
      :display-points="displayPoints"
      :is-anonymized="isAnonymized"
      :anonymization-origin="anonymizationOrigin"
      :current-accuracy="currentAccuracy"
      :settings="settings"
      @close="showGPSPointsModal = false"
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
      :location-permission="locationPermission"
      :notification-permission="notificationPermission"
      @close="hideDevLogs"
      @clear="clearLogs"
      @add-test-points="addTestPoints"
    />

    <SettingsModal
      :show="showSettingsModal"
      :settings="settings"
      :location-permission="locationPermission"
      :is-native-platform="true"
      @close="handleSettingsModalClose"
      @save="handleSettingsSave"
      @reset="resetToDefaults"
      @open-settings="handleOpenAppSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import type { Point, AnonymizationOrigin } from './types/gps';
import { useGPS } from './composables/useGPS';
import { useBackgroundGPS } from './composables/useBackgroundGPS';
import { useCanvas } from './composables/useCanvas';
import { useFileOperations } from './composables/useFileOperations';
import { useInteractions } from './composables/useInteractions';
import { useDevLogs, IS_DEV_MODE } from './composables/useDevLogs';
import { usePermissions } from './composables/usePermissions';
import { useNotificationPermission } from './composables/useNotificationPermission';
import { useExportOperations } from './composables/useExportOperations';
import { useSettingsManagement } from './composables/useSettingsManagement';
import { GPS_CONFIG, CANVAS_CONFIG } from './constants/gpsConstants';
import GPSPointsModal from './components/GPSPointsModal.vue';
import ExportModal from './components/ExportModal.vue';
import DevLogsModal from './components/DevLogsModal.vue';
import PermissionModal from './components/PermissionModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import { anonymizePoints, createAnonymizationOrigin } from './utils/coordinateUtils';
import { clearSmoothingBuffer } from './utils/gpsUtils';
import BaseButton from './components/BaseButton.vue';

// State
const showGPSPointsModal = ref(false);
const showExportModal = ref(false);
const showSettingsModal = ref(false);
const points = ref<Point[]>([]);

// Settings state (already declared above)
const isAnonymized = ref(true);
const anonymizationOrigin = ref<AnonymizationOrigin | null>(null);

// Settings state - use computed to sync with actual configs
const settings = computed(() => ({
  ACCURACY_THRESHOLD: GPS_CONFIG.value.ACCURACY_THRESHOLD,
  DISTANCE_THRESHOLD: GPS_CONFIG.value.DISTANCE_THRESHOLD,
  MIN_TIME_INTERVAL: GPS_CONFIG.value.MIN_TIME_INTERVAL / 1000, // Convert to seconds for UI
  SMOOTHING_WINDOW: GPS_CONFIG.value.SMOOTHING_WINDOW,
  PINCH_ZOOM_SENSITIVITY: CANVAS_CONFIG.value.PINCH_ZOOM_SENSITIVITY,
  MIN_SCALE: CANVAS_CONFIG.value.MIN_SCALE,
  MAX_SCALE: CANVAS_CONFIG.value.MAX_SCALE,
  LINE_WIDTH: CANVAS_CONFIG.value.LINE_WIDTH,
}));

const { currentAccuracy, shouldAddPoint, processNewPoint } = useGPS();
const { initBackgroundGPS } = useBackgroundGPS();
const { canvasEl, setupCanvas, drawPath, calculateBounds, pan, zoom, resetView, scale, viewOffsetX, viewOffsetY } = useCanvas();
const { loadPointsFromFile, savePointsToFile, clearAllData } = useFileOperations();
const { logs, isDevLogsVisible, logInfo, logError, clearLogs, hideDevLogs, formatLogTime } = useDevLogs();
const { handleDirectExport, handleExportImage, handleExportData } = useExportOperations(
  canvasEl,
  points,
  isAnonymized,
  anonymizationOrigin,
  showExportModal
);
const {
  locationPermission,
  checkHasLocationPermission,
  requestLocationPermission,
  handleOpenAppSettings
} = usePermissions();
const {
  notificationPermission,
  checkNotificationPermission,
  requestNotificationPermission,
  isRequestingNotificationPermission
} = useNotificationPermission();
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
  (deltaY: number, focalX?: number, focalY?: number) => {
    zoom(deltaY, focalX, focalY);
    redrawCanvas();
  },
  () => {
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

// Background GPS accuracy handler (updates display for every GPS reading)
const updateCurrentAccuracy = (accuracy: number): void => {
  currentAccuracy.value = accuracy;
};

// Works for both foreground and background GPS points
const addGPSPoint = async (newPoint: Point): Promise<void> => {  
  if (!shouldAddPoint(points.value, newPoint)) {
    return;
  }

  const processedPoint = processNewPoint(newPoint);
  logInfo('Background GPS point to add', processedPoint);
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

const { handleSettingsSave, loadPersistedSettings, resetToDefaults } = useSettingsManagement(settings, redrawCanvas);

const toggleAnonymization = (): void => {
  isAnonymized.value = !isAnonymized.value;
  
  // Set origin when first enabling anonymization
  if (isAnonymized.value && !anonymizationOrigin.value) {
    anonymizationOrigin.value = createAnonymizationOrigin(points.value);
  }
  
  redrawCanvas();
};



const handleClearAll = async (): Promise<void> => {
  const pointCount = points.value.length;
  points.value = [];
  anonymizationOrigin.value = null;
  clearSmoothingBuffer(); // Clear smoothing buffer for new drawing
  await clearAllData();
  redrawCanvas();
  showGPSPointsModal.value = false;
  logInfo('All GPS points cleared', { clearedCount: pointCount });
};

const handleResetZoom = (): void => {
  resetView();
  redrawCanvas();
  logInfo('Zoom and view reset to default');
};

const handleSettingsModalClose = async (): Promise<void> => {
  showSettingsModal.value = false;
};

// Lifecycle
onMounted(async () => {
  logInfo('App starting up');
  
  await Promise.all([
    checkNotificationPermission(),
    checkHasLocationPermission()
  ]);
  
  setupCanvas();
  
  // Load persisted settings
  await loadPersistedSettings();
  
  // Load existing points
  const loadedPoints = await loadPointsFromFile();
  if (loadedPoints.length > 0) {
    points.value = loadedPoints;
    if (isAnonymized.value && !anonymizationOrigin.value) {
      anonymizationOrigin.value = createAnonymizationOrigin(points.value);
    }
  }

  // Initial draw
  redrawCanvas();
  logInfo('App initialization completed');
});

watch([locationPermission, notificationPermission], async ([locationPermission, notificationPermission]) => {
  if (locationPermission === 'prompt' || notificationPermission === 'prompt') return

  if (locationPermission === 'granted') {
    try {
      await initBackgroundGPS(addGPSPoint, updateCurrentAccuracy);
      logInfo('Background GPS tracking started for long-term drawing');
    } catch (error) {
      logError('Failed to start GPS tracking', error);
    }
  }
}, {
  immediate: true,
})

// Test function to add sample GPS points for testing scrolling
const addTestPoints = (): void => {
  const baseLat = 40.7128; // New York coordinates
  const baseLon = -74.0060;
  const baseTime = Date.now() - (50 * 60 * 1000); // 50 minutes ago
  
  const testPoints: Point[] = [];
  
  for (let i = 0; i < 50; i++) {
    const point: Point = {
      lat: baseLat + (i * 0.0001), // Small increment to create a path
      lon: baseLon + (i * 0.0001),
      timestamp: baseTime + (i * 60000), // 1 minute intervals
      accuracy: Math.random() * 10 + 5 // Random accuracy between 5-15m
    };
    testPoints.push(point);
  }
  
  // Add test points to existing points
  points.value = [...points.value, ...testPoints];
  
  // Set anonymization origin if needed
  if (isAnonymized.value && !anonymizationOrigin.value) {
    anonymizationOrigin.value = createAnonymizationOrigin(points.value);
  }
  
  // Save to file
  savePointsToFile(testPoints, true);
  redrawCanvas();
  
  logInfo('Added test points', { count: testPoints.length, totalPoints: points.value.length });
};


</script>

<style>

.canvas {
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none; /* Prevents default touch actions like scrolling */
}

.reset-zoom-button {
  position: absolute;
  bottom: 150px;
  right: 30px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 12px;
  z-index: 10;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-zoom-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.reset-zoom-icon-image {
  padding-top: 3px;
  width: 22px;
  height: 22px;
}

.reset-zoom-icon {
  font-size: 23px;
  line-height: 1;
  font-weight: bold;
  font-family: 'Arial', sans-serif;
}

.dev-logs-button {
  position: absolute;
  top: max(env(safe-area-inset-top), 20px);
  left: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 16px;
  z-index: 10;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dev-logs-button:hover {
  background-color: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.dev-logs-icon {
  font-size: 18px;
  line-height: 1;
  font-weight: bold;
  filter:grayscale(1);
}

</style>
