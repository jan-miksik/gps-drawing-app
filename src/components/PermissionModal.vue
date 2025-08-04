<template>
  <div v-if="shouldShowModal" class="permission-modal">
    <div class="permission-content">

      <!-- Location Permission Section -->
      <div class="permission-section">
        <div class="permission-text">
          GPS Pen uses your location to draw your path. Your data stays on your phone. Drawing and access to your locations by GPS Pen stops when you close this app.        
        </div>

        <div v-if="locationPermission === 'granted'">
          <div class="permission-status granted">✓ Location permission granted</div>
        </div>

        <div v-else-if="locationPermission === 'prompt' || locationPermission === 'prompt-with-rationale'">
          <BaseButton @click="handleRequestLocationPermission" variant="primary" size="large" class="permission-button">
            Enable Location
          </BaseButton>
        </div>

        <div v-else-if="locationPermission === 'denied'">
          <div class="permission-text">
            Location permission was denied. To continue, enable it manually in settings:
            <br><br>
            → Tap "Open Settings" <br>
            → Permissions → Location <br>
            → Choose "While using the app" or "Always"
          </div>
          <BaseButton @click="handleOpenSettings" variant="primary" size="large" class="permission-button">
            Open Settings
          </BaseButton>
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
          To keep GPS drawing running when the app is minimized or your phone is idle, a notification reminding this have to be shown.
        </div>

        <div v-if="notificationPermission === 'granted' || notificationPermission === 'not-needed'">
          <div class="permission-status granted">✓ Notification permission granted</div>
        </div>

        <div v-else-if="notificationPermission === 'prompt' || notificationPermission === 'prompt-with-rationale'">
          <BaseButton 
            @click="handleRequestNotificationPermission"
            variant="primary"
            class="permission-button"
            size="large"
            :disabled="isRequesting"
          >
            <span v-if="!isRequesting">Enable Notifications</span>
            <span v-else>Requesting...</span>
          </BaseButton>
        </div>

        <div v-else-if="notificationPermission === 'denied'">
          <div class="permission-text">
            Notification permission was denied. Please enable it in your system settings to allow background tracking.
          </div>
          <BaseButton @click="handleOpenSettings" variant="primary" size="large" class="permission-button">
            Open Settings
          </BaseButton>
        </div>

        <div v-else>
          <div class="permission-text">
            Notification permission is in unknown state. Please enable it in your system settings to allow background tracking.
          </div>
          <BaseButton @click="handleOpenSettings" variant="primary" size="large" class="permission-button">
            Open Settings
          </BaseButton>
        </div>

        <BaseButton v-if="permissionsGranted" @click="isKeepShowingModal = false" variant="primary" size="large" class="permission-button done-button">
          Done
        </BaseButton>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';
import { ref } from 'vue';

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
const isKeepShowingModal = ref(false);

const permissionsGranted = computed(() => {
  return props.locationPermission === 'granted' && (props.notificationPermission === 'granted' || props.notificationPermission === 'not-needed')
});

const shouldShowModal = computed(() => {

  if (isKeepShowingModal.value) {
    return true;
  }

  // the permission is not know if the states are in prompt
  if (props.locationPermission === null || props.notificationPermission === null) {
    return false
  }
  // Show modal if any permission is not granted (except 'not-needed' for notifications)
  return !permissionsGranted.value;
});

const handleRequestLocationPermission = (): void => {
  emit('request-location-permission');
  isKeepShowingModal.value = true;
};

const handleOpenSettings = (): void => {
  emit('open-settings');
  isKeepShowingModal.value = true;
};

const handleRequestNotificationPermission = (): void => {
  emit('request-notification-permission');
  isKeepShowingModal.value = true;
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
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* max-width: 400px; */
  text-align: center;
  line-height: 1.5;
  font-size: 14px;
}

.permission-section {
  margin-bottom: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid white;
}

.permission-button {
  cursor: pointer;
  min-width: 200px;
}

.permission-button:hover:not(:disabled) {
  background: white;
  color: black;
  transform: translateY(-2px);
}

.permission-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.done-button {
  margin-top: 20px;
}
</style> 