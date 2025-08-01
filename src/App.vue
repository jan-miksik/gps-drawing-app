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
    
    <LocationPermissionModal
      :location-permission="locationPermission"
      :is-requesting-permission="isRequestingPermission"
      @open-settings="handleOpenAppSettings"
    />
    
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
      @close="hideDevLogs"
      @clear="clearLogs"
    />

    <SettingsModal
      :show="showSettingsModal"
      :settings="settings"
      :location-permission="locationPermission"
      :background-location-permission="backgroundLocationPermission"
      :is-native-platform="true"
      @close="showSettingsModal = false"
      @save="handleSettingsSave"
      @request-location="handleSettingsRequestLocation"
      @request-background="handleSettingsRequestBackground"
      @open-settings="handleSettingsOpenSettings"
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
import { usePermissions } from './composables/usePermissions';
import { useExportOperations } from './composables/useExportOperations';
import { useSettingsManagement } from './composables/useSettingsManagement';
import { GPS_CONFIG, CANVAS_CONFIG } from './constants/gpsConstants';

import GPSPointsModal from './components/GPSPointsModal.vue';
import ExportModal from './components/ExportModal.vue';
import DevLogsModal from './components/DevLogsModal.vue';
import LocationPermissionModal from './components/LocationPermissionModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import { anonymizePoints, createAnonymizationOrigin } from './utils/coordinateUtils';



// State
const showModal = ref(false);
const showExportModal = ref(false);
const showSettingsModal = ref(false);
const isRequestingPermission = ref(false);
const dontShowBackgroundModal = ref(false);
const points = ref<Point[]>([]);

// Tap debouncing for settings button
let lastTapTime = 0;

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
const { currentAccuracy, startGPSTracking, stopGPSTracking, shouldAddPoint } = useGPS();

// Permission computed properties
const hasLocationPermission = computed(() => locationPermission.value === 'granted');
const hasBackgroundLocationPermission = computed(() => 
  backgroundLocationPermission.value === 'granted' || backgroundLocationPermission.value === 'not-needed'
);
const { initBackgroundGPS, stopBackgroundGPS, removeBackgroundGPSListeners } = useBackgroundGPS();
const { canvasEl, setupCanvas, drawPath, calculateBounds, pan, zoom, resetView, scale, viewOffsetX, viewOffsetY } = useCanvas();
const { loadPointsFromFile, savePointsToFile, clearAllData } = useFileOperations();
const { logs, isDevLogsVisible, logInfo, logWarn, logError, clearLogs, hideDevLogs, formatLogTime } = useDevLogs();

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
  backgroundLocationPermission,

  canTrackGPS,
  canTrackBackgroundGPS,
  checkPermissions,
  requestLocationPermission,
  requestBackgroundLocationPermission,
  openAppSettings,
  initPermissions
} = usePermissions();
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
};

const addBackgroundGPSPoint = async (newPoint: Point): Promise<void> => {
  logInfo('Background GPS point received', newPoint);
  
  if (!shouldAddPoint(points.value, newPoint)) {
    return;
  }

  const processedPoint = newPoint; // No processing needed for background points
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

// Settings management
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

  

  const handleRequestLocationPermission = async (): Promise<void> => {
    console.log('🔄 handleRequestLocationPermission called');
    console.log('Current state - isRequesting:', isRequestingPermission.value, 'permission:', locationPermission.value);
    
    // Prevent multiple simultaneous requests
    if (isRequestingPermission.value) {
      console.log('⏸️ Permission request already in progress, skipping...');
      return;
    }
    
    // If permission is already granted, no need to request
    if (locationPermission.value === 'granted') {
      console.log('✅ Permission already granted, no need to request');
      return;
    }
    
    isRequestingPermission.value = true;
    console.log('🔄 Set isRequestingPermission to true, starting request...');
    
    try {
      console.log('📱 Calling requestLocationPermission...');
      const granted = await requestLocationPermission();
      console.log('📱 Location permission result:', granted);
      console.log('📱 New permission state:', locationPermission.value);
      
      if (granted) {
        logInfo('✅ Location permission granted successfully');
        
        // Force re-check permissions to ensure state is up to date
        console.log('🔄 Re-checking permissions after grant...');
        await checkPermissions();
        console.log('✅ Permissions re-checked, final state:', locationPermission.value);
        
        // If permission was granted, try to start GPS tracking
        if (canTrackGPS.value) {
          try {
            if (canTrackBackgroundGPS.value) {
              await initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy);
              logInfo('🛰️ Background GPS tracking started');
            } else {
              await startGPSTracking(addGPSPoint);
              logInfo('📍 Foreground GPS tracking started');
            }
          } catch (gpsError) {
            console.error('❌ Failed to start GPS tracking after permission grant:', gpsError);
            logError('Failed to start GPS tracking after permission grant', gpsError);
          }
        }
      } else {
        logWarn('❌ Location permission denied by user');
        console.log('❌ Permission denied, final state:', locationPermission.value);
        
        // If permission was denied, offer to open settings
        if (locationPermission.value === 'denied') {
          console.log('💡 Permission permanently denied, should show settings option');
        }
      }
    } catch (error) {
      console.error('❌ Error in handleRequestLocationPermission:', error);
      logError('Error requesting location permission:', error);
      
      // Re-check permissions to get accurate state
      try {
        await checkPermissions();
      } catch (checkError) {
        console.error('❌ Error checking permissions after request error:', checkError);
      }
    } finally {
      isRequestingPermission.value = false;
      console.log('✅ Set isRequestingPermission to false, request completed');
    }
  };

  const handleRequestBackgroundPermission = async (): Promise<void> => {
    console.log('handleRequestBackgroundPermission called');
    isRequestingPermission.value = true;
    try {
      console.log('Calling requestBackgroundLocationPermission...');
      const granted = await requestBackgroundLocationPermission();
      console.log('Background permission result:', granted);
      if (granted) {
        logInfo('Background location permission granted');
        // Re-check permissions after granting
        await checkPermissions();
      } else {
        logWarn('Background location permission denied');
      }
    } catch (error) {
      console.error('Error in handleRequestBackgroundPermission:', error);
      logError('Error requesting background location permission:', error);
    } finally {
      isRequestingPermission.value = false;
    }
  };



  const handleOpenAppSettings = async (): Promise<void> => {
  const now = Date.now();
  if (now - lastTapTime < 1000) return; // ignore if less than 1s since last tap
  lastTapTime = now;
  
  try {
    await openAppSettings();
  } catch (error) {
    console.error('Error opening app settings:', error);
    logError('Error opening app settings:', error);
  }
};

// Settings modal handlers
const handleSettingsRequestLocation = async (): Promise<void> => {
  await handleRequestLocationPermission();
};

const handleSettingsRequestBackground = async (): Promise<void> => {
  await handleRequestBackgroundPermission();
};

const handleSettingsOpenSettings = async (): Promise<void> => {
  await handleOpenAppSettings();
};



// Lifecycle
onMounted(async () => {
  logInfo('App starting up');
  
  // Load background modal preference
  const savedPreference = localStorage.getItem('dontShowBackgroundModal');
  if (savedPreference === 'true') {
    dontShowBackgroundModal.value = true;
  }

  // Initialize permissions first
  await initPermissions();
  
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
  
      // Auto-request location permission if not granted (with UI breathing room)
    if (!hasLocationPermission.value) {
      logInfo('Location permission not granted, requesting automatically');
      nextTick(() => {
        setTimeout(async () => {
          try {
            await handleRequestLocationPermission();
          } catch (error) {
            logError('Failed to request location permission automatically', error);
          }
        }, 100);
      });
    }
  
  // Initialize GPS tracking only if permissions are granted
  if (canTrackGPS.value) {
    try {
      if (canTrackBackgroundGPS.value) {
        // Use background GPS for long-term tracking
        await initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy);
        logInfo('Background GPS tracking started for long-term drawing');
      } else {
        // Fallback to foreground GPS
        await startGPSTracking(addGPSPoint);
        logInfo('Foreground GPS tracking started (background permission needed for long-term tracking)');
      }
    } catch (error) {
      logError('Failed to start GPS tracking', error);
    }
  } else {
    logWarn('GPS tracking not started - location permission required');
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
