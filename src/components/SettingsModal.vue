<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content fullscreen" @click.stop>
      <div class="modal-header">
        <h2>Settings</h2>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>
      
      <div class="modal-body">
        <div class="settings-section">
          <h3>Canvas</h3>
          
          <div class="setting-item">
            <label class="setting-label">Line Width</label>
            <div class="setting-control">
              <input 
                type="number" 
                v-model.number="localSettings.LINE_WIDTH"
                min="1" 
                max="10"
                step="0.5"
                class="setting-input"
              />
              <span class="setting-unit">px</span>
            </div>
            <div class="setting-description">Width of the GPS track line</div>
          </div>

          <div class="setting-item">
            <label class="setting-label">Scale Range</label>
            <div class="setting-control scale-range">
              <div class="scale-input-group">
                <label class="scale-label">Min</label>
                <input 
                  type="number" 
                  v-model.number="localSettings.MIN_SCALE"
                  min="0.01" 
                  max="1"
                  step="0.01"
                  class="setting-input"
                />
              </div>
              <div class="scale-input-group">
                <label class="scale-label">Max</label>
                <input 
                  type="number" 
                  v-model.number="localSettings.MAX_SCALE"
                  min="1" 
                  max="100"
                  step="0.5"
                  class="setting-input"
                />
              </div>
            </div>
            <div class="setting-description">Minimum and maximum zoom levels</div>
          </div>

          <div class="setting-item">
            <label class="setting-label">Pinch Zoom Sensitivity</label>
            <div class="setting-control">
              <input 
                type="number" 
                v-model.number="localSettings.PINCH_ZOOM_SENSITIVITY"
                min="0.1" 
                max="5"
                step="0.1"
                class="setting-input"
              />
            </div>
            <div class="setting-description">Sensitivity for pinch-to-zoom (higher = faster)</div>
          </div>
        </div>

        <div class="settings-section">
          <h3>GPS</h3>
          
          <div class="setting-item">
            <label class="setting-label">Accuracy Threshold</label>
            <div class="setting-control">
              <input 
                type="number" 
                v-model.number="localSettings.ACCURACY_THRESHOLD"
                min="1" 
                max="100"
                class="setting-input"
              />
              <span class="setting-unit">meters</span>
            </div>
            <div class="setting-description">Minimum accuracy to add GPS point (lower = more accurate)</div>
          </div>

          <div class="setting-item">
            <label class="setting-label">Distance Threshold</label>
            <div class="setting-control">
              <input 
                type="number" 
                v-model.number="localSettings.DISTANCE_THRESHOLD"
                min="1" 
                max="100"
                class="setting-input"
              />
              <span class="setting-unit">meters</span>
            </div>
            <div class="setting-description">Minimum distance between GPS points</div>
          </div>

          <div class="setting-item">
            <label class="setting-label">Time Interval</label>
            <div class="setting-control">
              <input 
                type="number" 
                v-model.number="localSettings.MIN_TIME_INTERVAL"
                min="1" 
                max="60"
                class="setting-input"
              />
              <span class="setting-unit">seconds</span>
            </div>
            <div class="setting-description">Minimum time between GPS points</div>
          </div>
        </div>

        <!-- Permissions Section - moved to bottom -->
        <!-- <div class="settings-section">
          <h3>Permissions</h3>
          
          <div class="permission-item">
            <div class="permission-info">
              <label class="permission-label">Location Access</label>
              <div class="permission-status">
                <span class="status-indicator" :class="locationStatusClass">{{ locationStatusIcon }}</span>
                <span class="status-text">{{ locationStatusText }}</span>
              </div>
            </div>
            <div class="permission-description">Required for creating GPS drawing</div>
            <button 
              v-if="needsLocationPermission"
              @click="handleRequestLocation"
              class="permission-action-button"
            >
              Enable Location Access
            </button>
          </div>

          <div v-if="isNativePlatform" class="permission-item">
            <div class="permission-info">
              <label class="permission-label">Background Location Access</label>
              <div class="permission-status">
                <span class="status-indicator" :class="backgroundStatusClass">{{ backgroundStatusIcon }}</span>
                <span class="status-text">{{ backgroundStatusText }}</span>
              </div>
            </div>
            <div class="permission-description">Required for continuous GPS drawing when app is minimized or phone is locked</div>
            <button 
              v-if="needsBackgroundLocationPermission"
              @click="handleRequestBackground"
              class="permission-action-button"
            >
              Enable Background Access
            </button>
          </div>

          <div v-if="showSettingsButton" class="permission-item">
            <div class="permission-info">
              <label class="permission-label">Manual Settings</label>
            </div>
            <div class="permission-description">Open device settings to manage permissions manually</div>
            <button 
              @click="handleOpenSettings"
              class="permission-action-button secondary"
            >
              Open Device Settings
            </button>
          </div>
        </div> -->
      </div>
      
      <div class="modal-footer">
        <button @click="handleReset" class="reset-button" :disabled="!hasChangesFromDefaults">
          Reset to Defaults
        </button>
        <div class="footer-right">
          <button @click="handleSave" class="save-button" :disabled="!hasChanges">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { DEFAULT_GPS_CONFIG, DEFAULT_CANVAS_CONFIG } from '../constants/gpsConstants';

interface Settings {
  ACCURACY_THRESHOLD: number;
  DISTANCE_THRESHOLD: number;
  MIN_TIME_INTERVAL: number;
  PINCH_ZOOM_SENSITIVITY: number;
  MIN_SCALE: number;
  MAX_SCALE: number;
  LINE_WIDTH: number;
}

interface Props {
  show: boolean;
  settings: Settings;
  locationPermission: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | null;
  isNativePlatform?: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', settings: Settings): void;
  (e: 'request-location'): void;
  (e: 'request-background'): void;
  (e: 'open-settings'): void;
}

const props = withDefaults(defineProps<Props>(), {
  isNativePlatform: true
});

const emit = defineEmits<Emits>();

// Default values imported from constants
const defaultSettings: Settings = {
  ACCURACY_THRESHOLD: DEFAULT_GPS_CONFIG.ACCURACY_THRESHOLD,
  DISTANCE_THRESHOLD: DEFAULT_GPS_CONFIG.DISTANCE_THRESHOLD,
  MIN_TIME_INTERVAL: DEFAULT_GPS_CONFIG.MIN_TIME_INTERVAL / 1000, // Convert from ms to seconds for UI
  PINCH_ZOOM_SENSITIVITY: DEFAULT_CANVAS_CONFIG.PINCH_ZOOM_SENSITIVITY,
  MIN_SCALE: DEFAULT_CANVAS_CONFIG.MIN_SCALE,
  MAX_SCALE: DEFAULT_CANVAS_CONFIG.MAX_SCALE,
  LINE_WIDTH: DEFAULT_CANVAS_CONFIG.LINE_WIDTH,
};

// Local copy of settings for editing
const localSettings = ref<Settings>({ ...props.settings });

// Update local settings when props change
watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings };
}, { deep: true });

// Check if settings have changed from original
const hasChanges = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify(props.settings);
});

// Check if any value differs from defaults
const hasChangesFromDefaults = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify(defaultSettings);
});

// Permission computed properties
// const hasLocationPermission = computed(() => props.locationPermission === 'granted');

// const needsLocationPermission = computed(() => !hasLocationPermission.value);
// const needsBackgroundLocationPermission = computed(() => 
//   hasLocationPermission.value && 
//   props.isNativePlatform && 
//   props.backgroundLocationPermission !== 'granted'
// );

// const showSettingsButton = computed(() => 
//   props.locationPermission === 'denied' || props.backgroundLocationPermission === 'denied'
// );

// // Permission status computed properties
// const locationStatusClass = computed(() => {
//   switch (props.locationPermission) {
//     case 'granted': return 'status-granted';
//     case 'denied': return 'status-denied';
//     default: return 'status-pending';
//   }
// });

// const backgroundStatusClass = computed(() => {
//   switch (props.backgroundLocationPermission) {
//     case 'granted': return 'status-granted';
//     case 'denied': return 'status-denied';
//     case 'not-needed': return 'status-granted';
//     default: return 'status-pending';
//   }
// });

// const locationStatusIcon = computed(() => {
//   switch (props.locationPermission) {
//     case 'granted': return '✓';
//     case 'denied': return '✗';
//     default: return '?';
//   }
// });

// const backgroundStatusIcon = computed(() => {
//   switch (props.backgroundLocationPermission) {
//     case 'granted': return '✓';
//     case 'denied': return '✗';
//     case 'not-needed': return '✓';
//     default: return '?';
//   }
// });

// const locationStatusText = computed(() => {
//   switch (props.locationPermission) {
//     case 'granted': return 'Granted';
//     case 'denied': return 'Denied';
//     default: return 'Not set';
//   }
// });

// const backgroundStatusText = computed(() => {
//   switch (props.backgroundLocationPermission) {
//     case 'granted': return 'Granted';
//     case 'denied': return 'Denied';
//     case 'not-needed': return 'Not needed';
//     default: return 'Not set';
//   }
// });

const handleReset = (): void => {
  localSettings.value = { ...defaultSettings };
  // Also emit the reset to parent so it can update the actual configs
  emit('save', defaultSettings);
  alert('Settings reset to defaults successfully!');
};

const handleSave = (): void => {
  emit('save', { ...localSettings.value });
  alert('Settings saved successfully!');
  emit('close');
};

// const handleRequestLocation = (): void => {
//   emit('request-location');
// };

// const handleRequestBackground = (): void => {
//   emit('request-background');
// };

// const handleOpenSettings = (): void => {
//   emit('open-settings');
// };
</script>

<style scoped>
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
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-content.fullscreen {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  border-radius: 0;
  border: none;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  padding-top: calc(20px + env(safe-area-inset-top));
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.8);
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
}

.close-button:hover {
  color: #ff6b6b;
}

.modal-body {
  flex-grow: 1;
  padding: 20px;
  padding-top: 30px;
  padding-bottom: 30px;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 80px;
  text-align: left;
}

.settings-section h3 {
  color: white;
  font-size: 16px;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  text-align: left;
}

/* Permission Items */
.permission-item {
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.permission-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.permission-label {
  color: white;
  font-size: 14px;
  font-weight: 600;
}

.permission-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  font-size: 16px;
  font-weight: bold;
}

.status-indicator.status-granted {
  color: #4ade80;
}

.status-indicator.status-denied {
  color: #f87171;
}

.status-indicator.status-pending {
  color: #fbbf24;
}

.status-text {
  font-size: 12px;
  color: #ccc;
}

.permission-description {
  color: #999;
  font-size: 12px;
  margin-bottom: 12px;
  line-height: 1.4;
}

.permission-action-button {
  all: unset;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.permission-action-button:hover {
  background: #2563eb;
}

.permission-action-button.secondary {
  background: #666;
}

.permission-action-button.secondary:hover {
  background: #555;
}

/* Setting Items */
.setting-item {
  margin-bottom: 35px;
}

.setting-label {
  display: block;
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.setting-input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  width: 80px;
  text-align: center;
}

.setting-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.setting-unit {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  min-width: 20px;
}

.setting-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  line-height: 1.4;
}

.scale-range {
  display: flex;
  gap: 15px;
  align-items: center;
}

.scale-input-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.scale-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 11px;
  font-weight: 500;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.8);
}

.footer-right {
  display: flex;
  gap: 10px;
}

.reset-button, .cancel-button, .save-button {
  all: unset;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.reset-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.reset-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.reset-button:disabled {
  background-color: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
}

.cancel-button {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.save-button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.save-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.save-button:disabled {
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
}
</style> 