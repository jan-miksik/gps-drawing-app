<template>
  <div v-if="show" class="permission-modal-overlay">
    <div class="permission-modal-content">
      <div class="permission-modal-header">
        <h2>Location Permission Required</h2>
      </div>
      
      <div class="permission-modal-body">
        <div class="permission-section">
          <div class="permission-icon">📍</div>
          <div class="permission-text">
            <h3>Location Access</h3>
            <p>This app needs location access to record your GPS drawing path. Without this permission, you cannot create drawings.</p>
          </div>
        </div>

        <div v-if="needsBackgroundLocation" class="permission-section">
          <div class="permission-icon">🔄</div>
          <div class="permission-text">
            <h3>Background Location</h3>
            <p>For background drawing, the app also needs permission to access location while the app is in the background.</p>
          </div>
        </div>

        <div class="permission-status">
          <div class="status-item">
            <span class="status-label">Location:</span>
            <span :class="['status-value', locationStatusClass]">
              {{ locationStatusText }}
            </span>
          </div>
          <div v-if="needsBackgroundLocation" class="status-item">
            <span class="status-label">Background:</span>
            <span :class="['status-value', backgroundStatusClass]">
              {{ backgroundStatusText }}
            </span>
          </div>
        </div>
      </div>
      
      <div class="permission-modal-footer">
        <div class="button-group">
          <button 
            v-if="needsLocationPermission"
            @click="handleRequestLocation"
            :disabled="isRequesting"
            class="permission-button primary"
          >
            {{ isRequesting ? 'Requesting...' : 'Enable Location' }}
          </button>
          
          <button 
            v-if="needsBackgroundLocationPermission"
            @click="handleRequestBackground"
            :disabled="isRequesting"
            class="permission-button secondary"
          >
            {{ isRequesting ? 'Requesting...' : 'Enable Background' }}
          </button>
          
          <button 
            v-if="showSettingsButton"
            @click="handleOpenSettings"
            class="permission-button settings"
          >
            Open Settings
          </button>
          
          <button 
            @click="$emit('close')"
            class="permission-button cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  show: boolean;
  locationPermission: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  backgroundLocationPermission: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  isRequesting: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'request-location'): void;
  (e: 'request-background'): void;
  (e: 'open-settings'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Computed properties
const needsLocationPermission = computed(() => props.locationPermission !== 'granted');
const needsBackgroundLocationPermission = computed(() => 
  props.locationPermission === 'granted' && props.backgroundLocationPermission !== 'granted'
);
const needsBackgroundLocation = computed(() => props.backgroundLocationPermission !== 'granted');

const showSettingsButton = computed(() => 
  props.locationPermission === 'denied' || props.backgroundLocationPermission === 'denied'
);

const locationStatusClass = computed(() => {
  switch (props.locationPermission) {
    case 'granted': return 'status-granted';
    case 'denied': return 'status-denied';
    default: return 'status-pending';
  }
});

const backgroundStatusClass = computed(() => {
  switch (props.backgroundLocationPermission) {
    case 'granted': return 'status-granted';
    case 'denied': return 'status-denied';
    default: return 'status-pending';
  }
});

const locationStatusText = computed(() => {
  switch (props.locationPermission) {
    case 'granted': return '✓ Granted';
    case 'denied': return '✗ Denied';
    case 'prompt': return '⏳ Pending';
    case 'prompt-with-rationale': return '⏳ Pending';
    default: return 'Unknown';
  }
});

const backgroundStatusText = computed(() => {
  switch (props.backgroundLocationPermission) {
    case 'granted': return '✓ Granted';
    case 'denied': return '✗ Denied';
    case 'prompt': return '⏳ Pending';
    case 'prompt-with-rationale': return '⏳ Pending';
    default: return 'Unknown';
  }
});

// Event handlers
const handleRequestLocation = (): void => {
  console.log('Requesting location permission...');
  emit('request-location');
};

const handleRequestBackground = (): void => {
  console.log('Requesting background location permission...');
  emit('request-background');
};

const handleOpenSettings = (): void => {
  emit('open-settings');
};
</script>

<style scoped>
.permission-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
}

.permission-modal-content {
  background: rgba(0, 0, 0, 0.95);
  border-radius: 16px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.permission-modal-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.permission-modal-header h2 {
  margin: 0;
  color: white;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
}

.permission-modal-body {
  padding: 20px 24px;
  flex: 1;
  overflow-y: auto;
}

.permission-section {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.permission-icon {
  font-size: 32px;
  flex-shrink: 0;
  margin-top: 4px;
}

.permission-text h3 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.permission-text p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
}

.permission-status {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.status-item:last-child {
  margin-bottom: 0;
}

.status-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.status-granted {
  color: #4ade80;
}

.status-denied {
  color: #f87171;
}

.status-pending {
  color: #fbbf24;
}

.permission-modal-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-button {
  all: unset;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.permission-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.permission-button.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.permission-button.primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.permission-button.secondary {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-color: #3b82f6;
}

.permission-button.secondary:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.3);
}

.permission-button.settings {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.permission-button.settings:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.permission-button.cancel {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.2);
}

.permission-button.cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style> 