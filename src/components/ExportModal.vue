<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>Export Options</h2>
        <button @click="$emit('close')" class="close-button">✕</button>
      </div>
      
      <div class="modal-body">
        <div class="export-section">

          <button @click="handleExportImage" class="export-option-button">
            <!-- <span class="button-icon">📐</span> -->
            <div class="button-text-title">Image</div>
            <div class="button-text">GPS Drawing as SVG image</div>
          </button>
        </div>

        <div class="export-section">
            <button @click="handleExportRelativeData" class="export-option-button">
              <!-- <span class="button-icon">🔒</span> -->
              <div class="button-text-title">JSON - relative</div>
              <div class="button-text">Relative Coordinates (Anonymized)</div>
            </button>
          </div>
        <div class="export-section">
          <button @click="handleExportExactData" class="export-option-button">
            <!-- <span class="button-icon">📍</span> -->
            <div class="button-text-title">JSON - exact</div>
            <div class="button-text">Exact Coordinates (Latitude/Longitude)</div>
          </button>
        </div>
      </div>
      
      <div class="modal-footer">
        <BaseButton @click="handleCancel" variant="primary" size="medium">
          Close
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue';

interface Props {
  show: boolean;
  points: any[];
}

interface Emits {
  (e: 'close'): void;
  (e: 'export-image'): void;
  (e: 'export-data', coordinateType: 'relative' | 'exact'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleExportImage = (): void => {
  emit('export-image');
};

const handleExportRelativeData = (): void => {
  emit('export-data', 'relative');
};

const handleExportExactData = (): void => {
  emit('export-data', 'exact');
};

const handleCancel = (): void => {
  console.log('Cancel button clicked - closing modal without export');
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
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
  overflow-y: auto;
}

.export-section {
  margin-bottom: 30px;
}

.export-section h3 {
  color: white;
  margin: 0 0 8px 0;
  font-size: 16px;
}

.section-description {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 15px 0;
  font-size: 14px;
}

.export-option-button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 15px 20px;
  border-radius: 3px;
  font-size: 14px;
  backdrop-filter: blur(10px);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
  text-align: left;
}

.export-option-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.button-icon {
  font-size: 18px;
  flex-shrink: 0;
  filter: grayscale(100%) brightness(0.7) invert(1);
}

.button-text {
  font-weight: 500;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
}

.button-text-title {
  font-weight: 500;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  background-color: rgba(0, 0, 0, 0.8);
}

.close-button-footer {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  backdrop-filter: blur(10px);
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-button-footer:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style> 