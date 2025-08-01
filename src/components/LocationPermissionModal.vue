<template>
  <div v-if="locationPermission === 'denied'" class="permission-button-container">
    <div class="permission-explanation">
      To draw with GPS, please enable location access.
      <br><br>
      How: <br>Tap button bellow - "Open Settings" <br>→ Permissions <br>→ Location <br>→ Choose "While using the app" or "Always"
      <br><br>
      Note: The exact texts can vary on your device. You may need to close and open the app to see the changes.
      <br><br>
      <button 
        @click="handleOpenSettings"
        :disabled="isRequestingPermission"
        class="permission-button-center"
        :class="{ 'requesting': isRequestingPermission }"
      >
        <span v-if="isRequestingPermission">Requesting...</span>
        <span v-else>Open Settings</span>
      </button>
      <br><br>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  locationPermission: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  isRequestingPermission: boolean;
}

interface Emits {
  (e: 'open-settings'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleOpenSettings = (): void => {
  emit('open-settings');
};
</script>

<style scoped>
.permission-button-container {
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

.permission-explanation {
  background: #1a1a1a;
  color: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 400px;
  text-align: left;
  line-height: 1.5;
  font-size: 12px;
}

.permission-button-center {
  background: #1a1a1a;
  color: white;
  border: 1px solid white;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.permission-button-center:hover:not(:disabled) {
  background: #1a1a1a;
  transform: translateY(-2px);
}

.permission-button-center:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.permission-button-center.requesting {
  background: #666;
}
</style> 