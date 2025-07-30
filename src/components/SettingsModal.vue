<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content fullscreen" @click.stop>
      <div class="modal-header">
        <h2>Settings</h2>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>
      
      <div class="modal-body">
        <div class="settings-section">
          <h3>GPS Settings</h3>
          
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
            <div class="setting-description">Reject GPS points with worse accuracy</div>
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
            <div class="setting-description">Minimum distance to add new point</div>
          </div>

          <div class="setting-item">
            <label class="setting-label">Min Time Interval</label>
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

        <div class="settings-section">
          <h3>Canvas Settings</h3>
          
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
            <div class="setting-description">Sensitivity for pinch-to-zoom (lower = slower)</div>
          </div>

          <div class="setting-item">
            <label class="setting-label">Min Scale</label>
            <div class="setting-control">
              <input 
                type="number" 
                v-model.number="localSettings.MIN_SCALE"
                min="0.01" 
                max="1"
                step="0.01"
                class="setting-input"
              />
            </div>
            <div class="setting-description">Minimum zoom level</div>
          </div>

          <div class="setting-item">
            <label class="setting-label">Max Scale</label>
            <div class="setting-control">
              <input 
                type="number" 
                v-model.number="localSettings.MAX_SCALE"
                min="1" 
                max="50"
                step="0.5"
                class="setting-input"
              />
            </div>
            <div class="setting-description">Maximum zoom level</div>
          </div>

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
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="handleReset" class="reset-button" :disabled="!hasChanges">
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
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', settings: Settings): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Default values
const defaultSettings: Settings = {
  ACCURACY_THRESHOLD: 20,
  DISTANCE_THRESHOLD: 10,
  MIN_TIME_INTERVAL: 5,
  PINCH_ZOOM_SENSITIVITY: 1,
  MIN_SCALE: 0.1,
  MAX_SCALE: 10,
  LINE_WIDTH: 2,
};

// Local copy of settings for editing
const localSettings = ref<Settings>({ ...props.settings });

// Update local settings when props change
watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings };
}, { deep: true });

// Check if settings have changed
const hasChanges = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify(props.settings);
});

const handleReset = (): void => {
  localSettings.value = { ...defaultSettings };
  // Also emit the reset to parent so it can update the actual configs
  emit('save', defaultSettings);
};



const handleSave = (): void => {
  emit('save', { ...localSettings.value });
  alert('Settings saved successfully!');
  emit('close');
};
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
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  width: 90%;
  max-width: 500px;
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
  margin-bottom: 30px;
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