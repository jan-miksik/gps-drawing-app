<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="header-left">
          <h2>GPS Points ({{ points.length }})</h2>
          <div class="header-controls">
            <label class="toggle-label">
              <input 
                type="checkbox" 
                :checked="!isAnonymized"
                @change="$emit('toggle-anonymization')"
                class="toggle-checkbox"
              />
              <span class="toggle-text">Geopoint</span>
            </label>
            
            <div 
              v-if="backgroundActive" 
              class="background-gps-indicator"
              title="Background GPS tracking is active"
            >
              <div class="background-text">Background drawing</div>
            </div>
          </div>
        </div>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>
      
      <div class="modal-body">
        <div v-if="points.length === 0" class="no-points">
          No GPS points recorded yet.
        </div>
        
        <div v-else class="points-list">
          <div class="list-header">
            <div class="header-item index">Index</div>
            <div v-if="!isAnonymized" class="header-item latitude">Latitude</div>
            <div v-if="!isAnonymized" class="header-item longitude">Longitude</div>
            <div v-if="isAnonymized" class="header-item distance">Distance</div>
            <div class="header-item time">Time</div>
            <div class="header-item accuracy">Accuracy</div>
          </div>
          
          <div class="list-body">
            <div 
              v-for="(point, index) in reversedDisplayPoints" 
              :key="`${point.lat}-${point.lon}-${point.timestamp}`"
              class="point-row"
              :class="{ 'current-point': index === 0 }"
            >
              <div class="row-item index">{{ points.length - index }}</div>
              <div v-if="!isAnonymized" class="row-item latitude">{{ point.lat.toFixed(6) }}</div>
              <div v-if="!isAnonymized" class="row-item longitude">{{ point.lon.toFixed(6) }}</div>
              <div v-if="isAnonymized" class="row-item distance">{{ getPointDistance(point).toFixed(0) }}m</div>
              <div class="row-item time">{{ formatTime(point.timestamp, reversedDisplayPoints.length - 1 - index, reversedDisplayPoints) }}</div>
              <div class="row-item accuracy">{{ getAccuracy(point) }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-left">
          <button @click="$emit('export')" class="export-button">
            Export
          </button>
          <div @click="handleClearAll" class="clear-button-1">
            Clear
          </div>
        </div>
        <div class="footer-right">
          <button @click="$emit('close')" class="close-button-footer">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Point, AnonymizationOrigin } from '../types/gps';
import { getDistanceFromOrigin } from '../utils/coordinateUtils';

interface Props {
  show: boolean;
  points: Point[];
  displayPoints: Point[];
  isAnonymized: boolean;
  anonymizationOrigin: AnonymizationOrigin | null;
  backgroundActive: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'toggle-anonymization'): void;
  (e: 'export'): void;
  (e: 'clear'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const reversedDisplayPoints = computed(() => {
  const reversed = [...props.displayPoints].reverse();
  return reversed;
});

const getPointDistance = (point: Point): number => {
  return getDistanceFromOrigin(point, props.anonymizationOrigin, props.isAnonymized);
};

const getAccuracy = (point: Point): string => {
  if (point.accuracy !== undefined && point.accuracy !== null) {
    return `${Math.round(point.accuracy)}m`;
  }
  return 'N/A';
};

const formatTime = (timestamp: number, index: number, allPoints: Point[]): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isFirstPoint = index === 0;
  const dateChanged = !isFirstPoint && 
    new Date(allPoints[index - 1].timestamp).toDateString() !== date.toDateString();
  
  const timeString = date.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  if (date.toDateString() === today.toDateString()) {
    return `Today ${timeString}`;
  }
  
  if (isFirstPoint || dateChanged) {
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeString}`;
    } else {
      const dateString = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
      return `${dateString} ${timeString}`;
    }
  }
  
  return timeString;
};

const handleClearAll = (): void => {
  if (confirm(`Are you sure you want to delete all ${props.points.length} GPS points? This cannot be undone.`)) {
    emit('clear');
  }
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
  border-radius: 0;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: max(env(safe-area-inset-top), 20px);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.8);
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: rgba(255, 255, 255, 0.7);
}

.toggle-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: normal;
}

.background-gps-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
  padding: 4px 8px;
  font-size: 12px;
  color: rgb(255, 255, 255);
  text-shadow: none;
  backdrop-filter: blur(10px);
}

.background-icon {
  font-size: 10px;
  animation: rotate 2s linear infinite;
}

.background-text {
  font-weight: 500;
  white-space: nowrap;
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
  align-self: flex-start;
}

.close-button:hover {
  color: #ff6b6b;
}

.modal-body {
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.no-points {
  text-align: center;
  color: #888;
  padding: 20px;
}

.points-list {
  border-collapse: collapse;
  min-width: 500px;
  width: max-content;
}

.list-header {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  font-weight: bold;
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 12px;
  display: flex;
  align-items: center;
}

.header-item {
  display: inline-block;
  padding: 0 6px;
  font-size: 11px;
}

.header-item.index {
  width: 40px;
  text-align: center;
}

.header-item.latitude, .header-item.longitude {
  width: 120px;
  text-align: center;
}

.header-item.x-distance, .header-item.y-distance {
  width: 85px;
  text-align: center;
}

.header-item.distance {
  width: 100px;
  text-align: center;
}

.header-item.accuracy {
  width: 75px;
  text-align: center;
}

.header-item.time {
  width: 110px;
  text-align: center;
}

.point-row {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
}

.point-row:last-child {
  border-bottom: none;
}

.point-row.current-point {
  background-color: rgba(255, 255, 255, 0.1);
  border-left: 4px solid white;
  padding-left: 8px;
}

.row-item {
  display: inline-block;
  padding: 0 6px;
  font-size: 11px;
}

.row-item.index {
  width: 40px;
  text-align: center;
}

.row-item.latitude, .row-item.longitude {
  width: 120px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.row-item.x-distance, .row-item.y-distance {
  width: 85px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.row-item.distance {
  width: 100px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.row-item.accuracy {
  width: 75px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.row-item.time {
  width: 110px;
  text-align: center;
  font-size: 11px;
}

.modal-footer {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.8);
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.footer-right {
  display: flex;
  align-items: center;
}

.export-button, .clear-button-1, .close-button-footer {
  all: unset;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
  backdrop-filter: blur(10px);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
  flex-shrink: 0;
}

.export-button:hover, .clear-button-1:hover, .close-button-footer:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style> 