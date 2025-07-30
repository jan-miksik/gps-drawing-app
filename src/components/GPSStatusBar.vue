<template>
  <div class="accuracy-status" :class="`signal-${gpsSignalQuality}`">
    <div class="accuracy-status-text">
      GPS
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GPSSignalQuality } from '../types/gps';

interface Props {
  gpsSignalQuality: GPSSignalQuality;
}

defineProps<Props>();
</script>

<style scoped>
.accuracy-status {
  position: absolute;
  bottom: calc(50px + env(safe-area-inset-bottom));
  left: 20px;
  font-size: 14px;
  z-index: 10;
  transition: color 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.accuracy-status.signal-excellent {
  color: rgba(255, 255, 255, 1.0); /* Bright white - best accuracy */
}

.accuracy-status.signal-good {
  color: rgba(255, 255, 255, 0.85); /* Slightly dimmed white */
}

.accuracy-status.signal-fair {
  color: rgba(255, 255, 255, 0.85); /* More transparent white */
}

.accuracy-status.signal-poor {
  color: rgba(255, 255, 255, 0.85); /* Very dim/gray */
}

.accuracy-status.signal-unknown {
  color: rgba(255, 255, 255, 0.85); /* Darkest - unknown state */
}

.accuracy-status-text {
  font-weight: 600;
}

.accuracy-value {
  font-weight: normal;
  opacity: 0.9;
}
</style> 