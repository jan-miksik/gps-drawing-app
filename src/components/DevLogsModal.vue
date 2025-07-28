<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Developer Logs ({{ logs.length }})</h2>
        <div class="header-controls">
          <button @click="$emit('clear')" class="clear-button">Clear</button>
          <button @click="$emit('close')" class="close-button">✕</button>
        </div>
      </div>
      
      <div class="modal-body">
        <div v-if="logs.length === 0" class="no-logs">
          No logs available.
        </div>
        
        <div v-else class="logs-list">
          <div 
            v-for="log in reversedLogs" 
            :key="log.id"
            class="log-entry"
            :class="`log-${log.level}`"
          >
            <div class="log-header">
              <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
              <span class="log-level">{{ log.level.toUpperCase() }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
            <div v-if="log.data" class="log-data">
              <pre>{{ formatLogData(log.data) }}</pre>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <div class="footer-info">
          Auto-updates | Max 100 entries
        </div>
        <button @click="$emit('close')" class="close-button-footer">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface LogEntry {
  id: number;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

interface Props {
  show: boolean;
  logs: LogEntry[];
  formatLogTime: (timestamp: number) => string;
}

interface Emits {
  (e: 'close'): void;
  (e: 'clear'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const reversedLogs = computed(() => {
  return [...props.logs].reverse();
});

const formatLogData = (data: any): string => {
  if (data === null || data === undefined) {
    return String(data);
  }
  
  if (typeof data === 'object') {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  }
  
  return String(data);
};
</script>

<style scoped>
.modal-overlay {
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
}

.modal-content {
  background: rgba(20, 20, 20, 0.95);
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
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.8);
}

.modal-header h2 {
  margin: 0;
  color: #00ff00;
  font-size: 18px;
  font-family: 'Courier New', monospace;
}

.header-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.clear-button, .close-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.clear-button:hover, .close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-button {
  padding: 6px 8px;
  font-size: 16px;
}

.modal-body {
  flex-grow: 1;
  overflow-y: auto;
  padding: 10px;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  -webkit-overflow-scrolling: touch;
}

.no-logs {
  text-align: center;
  color: #888;
  padding: 20px;
  font-family: sans-serif;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-entry {
  background: rgba(0, 0, 0, 0.6);
  border-left: 3px solid;
  padding: 8px 12px;
  border-radius: 0 4px 4px 0;
  word-wrap: break-word;
}

.log-entry.log-info {
  border-left-color: #00ff00;
}

.log-entry.log-warn {
  border-left-color: #ffaa00;
}

.log-entry.log-error {
  border-left-color: #ff4444;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.log-time {
  color: #888;
  font-size: 10px;
}

.log-level {
  font-size: 9px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.log-info .log-level {
  color: #00ff00;
}

.log-warn .log-level {
  color: #ffaa00;
}

.log-error .log-level {
  color: #ff4444;
}

.log-message {
  color: white;
  line-height: 1.4;
  margin-bottom: 4px;
}

.log-data {
  background: rgba(0, 0, 0, 0.4);
  padding: 6px;
  border-radius: 3px;
  margin-top: 4px;
}

.log-data pre {
  margin: 0;
  color: #ccc;
  font-size: 10px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.8);
}

.footer-info {
  color: #888;
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.close-button-footer {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s ease;
}

.close-button-footer:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style> 