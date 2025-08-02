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
    <!-- Dev Logs Button - top left corner -->
    <button 
      @click="isDevLogsVisible = true" 
      class="dev-logs-button"
      title="Open Dev Logs"
    >
      <span class="dev-logs-icon">📋</span>
    </button>
    
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
      <span class="reset-zoom-icon">⏮</span>
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
      :show="showModal"
      :points="points"
      :display-points="displayPoints"
      :is-anonymized="isAnonymized"
      :anonymization-origin="anonymizationOrigin"
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
      :location-permission="locationPermission"
      :notification-permission="notificationPermission"
      @close="hideDevLogs"
      @clear="clearLogs"
    />

    <SettingsModal
      :show="showSettingsModal"
      :settings="settings"
      :location-permission="locationPermission"
      :is-native-platform="true"
      @close="showSettingsModal = false"
      @save="handleSettingsSave"
      @open-settings="handleOpenAppSettings"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Capacitor } from '@capacitor/core';
import type { Point, AnonymizationOrigin } from './types/gps';
import { useGPS } from './composables/useGPS';
import { useBackgroundGPS } from './composables/useBackgroundGPS';
import { useCanvas } from './composables/useCanvas';
import { useFileOperations } from './composables/useFileOperations';
import { useInteractions } from './composables/useInteractions';
import { useDevLogs } from './composables/useDevLogs';
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

// State
const showModal = ref(false);
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
  PINCH_ZOOM_SENSITIVITY: CANVAS_CONFIG.value.PINCH_ZOOM_SENSITIVITY,
  MIN_SCALE: CANVAS_CONFIG.value.MIN_SCALE,
  MAX_SCALE: CANVAS_CONFIG.value.MAX_SCALE,
  LINE_WIDTH: CANVAS_CONFIG.value.LINE_WIDTH,
}));

// Composables
const { currentAccuracy, shouldAddPoint } = useGPS();

// Permission computed properties
const { initBackgroundGPS } = useBackgroundGPS();
const { canvasEl, setupCanvas, drawPath, calculateBounds, pan, zoom, resetView, scale, viewOffsetX, viewOffsetY } = useCanvas();
const { loadPointsFromFile, savePointsToFile, clearAllData } = useFileOperations();
const { logs, isDevLogsVisible, logInfo, logError, clearLogs, hideDevLogs, formatLogTime } = useDevLogs();

// Export operations
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
  
  // Permission handlers
  handleOpenAppSettings
} = usePermissions();

// Notification permission handling
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

// Background GPS accuracy handler (updates display for every GPS reading)
const updateCurrentAccuracy = (accuracy: number): void => {
  currentAccuracy.value = accuracy;
};

const addBackgroundGPSPoint = async (newPoint: Point): Promise<void> => {
  logInfo('Background GPS point received', newPoint);
  
  if (!shouldAddPoint(points.value, newPoint)) {
    return;
  }

  // const processedPoint = newPoint; // turned off for now
  logInfo('Background GPS point to add', newPoint);
  points.value.push(newPoint);

  // Set anonymization origin if this is the first point
  if (points.value.length === 1 && isAnonymized.value && !anonymizationOrigin.value) {
    anonymizationOrigin.value = createAnonymizationOrigin(points.value);
  }

  // Save to file (this will handle both foreground and background points)
  await savePointsToFile([newPoint], true); // true = append mode
  redrawCanvas();
};

const redrawCanvas = (): void => {
  nextTick(() => {
    drawPath(displayPoints.value, displayBounds.value);
  });
};

const { handleSettingsSave } = useSettingsManagement(settings, redrawCanvas);

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
  await clearAllData();
  redrawCanvas();
  showModal.value = false;
  logInfo('All GPS points cleared', { clearedCount: pointCount });
};

const handleResetZoom = (): void => {
  resetView();
  redrawCanvas();
  logInfo('Zoom and view reset to default');
};

// Lifecycle
onMounted(async () => {
  logInfo('App starting up');
  
  // const [hasNotificationPermissionResult, hasLocationPermissionResult] = await Promise.all([, checkHasLocationPermission()]);
  // hasNotificationPermissionValue.value = hasNotificationPermissionResult;
  // hasLocationPermissionValue.value = hasLocationPermissionResult;
  const hasNotificationPermissionResult = await checkNotificationPermission()
  const hasLocationPermissionResult = await checkHasLocationPermission()

  logInfo('hasNotificationPermissionResult', hasNotificationPermissionResult);
  logInfo('hasLocationPermission', hasLocationPermissionResult);
  
  setupCanvas();
  
  // Load existing points
  const loadedPoints = await loadPointsFromFile();
  if (loadedPoints.length > 0) {
    points.value = loadedPoints;
    if (isAnonymized.value && !anonymizationOrigin.value) {
      anonymizationOrigin.value = createAnonymizationOrigin(points.value);
    }
  }

  // Setup canvas resize listener only on desktop
  if (!Capacitor.isNativePlatform()) {
    window.addEventListener('resize', setupCanvas);
  }
  // Initial draw
  redrawCanvas();
  logInfo('App initialization completed');
});

watch([locationPermission, notificationPermission], async ([locationPermission, notificationPermission]) => {
  logInfo('watch log');
  if (locationPermission === 'prompt' || notificationPermission === 'prompt') return

  if (locationPermission === 'granted') {
    try {
      logInfo('In init BG tracking');
      // Use background GPS for long-term tracking
      await initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy);
      logInfo('Background GPS tracking started for long-term drawing');
    } catch (error) {
      logError('Failed to start GPS tracking', error);
    }
  }
}, {
  immediate: true,
})

onUnmounted(() => {
  // Remove window resize listener (only if it was added on desktop)
  if (!Capacitor.isNativePlatform()) {
    window.removeEventListener('resize', setupCanvas);
  }
  // Note: Capacitor handles GPS cleanup automatically when app terminates
});
</script>

<style src="./styles/app.css"></style>
