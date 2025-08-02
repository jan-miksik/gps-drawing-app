<template>
  <div v-if="shouldShowModal" class="permission-modal">
    <div class="permission-content">

      <!-- Location Permission Section -->
      <div class="permission-section">
        <div class="permission-text">
          This app needs your location to draw your GPS path. Your data stays only on your device. GPS drawing stops when the app is closed.
        </div>

        <div v-if="locationPermission === 'granted'">
          <div class="permission-status granted">✅ Location permission granted</div>
        </div>

        <div v-else-if="locationPermission === 'prompt' || locationPermission === 'prompt-with-rationale'">
          <button @click="handleRequestLocationPermission" class="permission-button">
            Enable Location
          </button>
        </div>

        <div v-else-if="locationPermission === 'denied'">
          <div class="permission-text">
            Location permission was denied. To continue, enable it manually in settings:
            <br><br>
            → Tap "Open Settings" <br>
            → Permissions → Location <br>
            → Choose "While using the app" or "Always"
          </div>
          <button @click="handleOpenSettings" class="permission-button">
            Open Settings
          </button>
        </div>

        <div v-else>
          <div class="permission-text">
            Checking location permission...
          </div>
        </div>
      </div>

      <!-- Notification Permission Section -->
      <div class="permission-section">
        <div class="permission-text">
          To keep GPS drawing running when the app is minimized or your phone is idle, a small notification needs to be shown.
        </div>

        <div v-if="notificationPermission === 'granted' || notificationPermission === 'not-needed'">
          <div class="permission-status granted">✅ Notification permission granted</div>
        </div>

        <div v-else-if="notificationPermission === 'prompt'">
          <button 
            @click="handleRequestNotificationPermission"
            class="permission-button"
            :disabled="isRequesting"
          >
            <span v-if="!isRequesting">Enable Notifications</span>
            <span v-else>Requesting...</span>
          </button>
        </div>

        <div v-else-if="notificationPermission === 'denied'">
          <div class="permission-text">
            Notification permission was denied. Please enable it in your system settings to allow background tracking.
          </div>
          <button @click="handleOpenSettings" class="permission-button">
            Open Settings
          </button>
        </div>

        <div v-else>
          <div class="permission-text">
            Checking notification permission...
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  locationPermission: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | null; 
  notificationPermission: 'granted' | 'denied' | 'prompt' | 'not-needed' | 'prompt-with-rationale' | null;
  isRequesting?: boolean;
  // show: boolean;
}

interface Emits {
  (e: 'request-location-permission'): void;
  (e: 'open-settings'): void;
  (e: 'request-notification-permission'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const shouldShowModal = computed(() => {

  // the permission is not know if the states are in prompt
  if (props.locationPermission === null || props.notificationPermission === null) {
    return false
  }
  // Show modal if any permission is not granted (except 'not-needed' for notifications)
  return props.locationPermission !== 'granted' || (props.notificationPermission !== 'granted' && props.notificationPermission !== 'not-needed');
});

const handleRequestLocationPermission = (): void => {
  emit('request-location-permission');
};

const handleOpenSettings = (): void => {
  emit('open-settings');
};

const handleRequestNotificationPermission = (): void => {
  emit('request-notification-permission');
};
</script>

<style scoped>
.permission-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.permission-content {
  background: #1a1a1a;
  color: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 400px;
  text-align: center;
  line-height: 1.5;
  font-size: 14px;
}

.permission-section {
  margin-bottom: 30px;
}

.permission-section:last-child {
  margin-bottom: 0;
}

.permission-text {
  margin-bottom: 25px;
}

.permission-status {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
}

.permission-status.granted {
  background: rgba(0, 255, 0, 0.1);
  color: #4ade80;
  border: 1px solid #4ade80;
}

.permission-button {
  background: #1a1a1a;
  color: white;
  border: 1px solid white;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.permission-button:hover:not(:disabled) {
  background: #333;
  transform: translateY(-2px);
}

.permission-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style> 