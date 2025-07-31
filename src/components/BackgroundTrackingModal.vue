<template>
  <div v-if="props.show" class="background-modal-overlay">
    <div class="background-modal-content">
      <div class="background-modal-header">
        <h2>Background Tracking</h2>
      </div>
      
      <div class="background-modal-body">
        <div class="explanation-section">
          <div class="explanation-icon">🌙</div>
          <div class="explanation-content">
            <h3>Continue GPS Drawing in Background</h3>
            <p>Enable background location access to continue creating your GPS artwork even when the app is minimized or your phone is locked.</p>
          </div>
        </div>

        <div class="benefits-section">
          <div class="benefit-item">
            <span class="benefit-icon">📱</span>
            <span class="benefit-text">Track your movements while using other apps</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🔒</span>
            <span class="benefit-text">Continue drawing when phone is locked</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">⚡</span>
            <span class="benefit-text">Battery optimized - only updates when you move</span>
          </div>
        </div>

        <div class="settings-note">
          <p>💡 You can also manage this permission later in <strong>Points → Settings</strong></p>
        </div>

        <div class="dont-show-again">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="dontShowAgain"
              class="checkbox-input"
            />
            <span class="checkbox-text">Don't show this message again</span>
          </label>
        </div>
      </div>
      
      <div class="background-modal-footer">
        <div class="button-group">
          <button 
            @click="handleEnableBackground"
            :disabled="props.isRequesting"
            class="enable-button"
          >
            <span v-if="props.isRequesting">⏳ Enabling...</span>
            <span v-else>🌙 Enable Background Tracking</span>
          </button>
          
          <button 
            @click="handleSkip"
            class="skip-button"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  show: boolean;
  isRequesting: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'enable-background'): void;
  (e: 'skip', dontShowAgain: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const dontShowAgain = ref(false);

const handleEnableBackground = (): void => {
  emit('enable-background');
};

const handleSkip = (): void => {
  emit('skip', dontShowAgain.value);
};
</script>

<style scoped>
.background-modal-overlay {
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
  padding: 16px;
}

.background-modal-content {
  background: linear-gradient(135deg, rgba(15, 15, 25, 0.95), rgba(25, 25, 40, 0.95));
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.background-modal-header {
  padding: 24px 24px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.background-modal-header h2 {
  margin: 0;
  color: white;
  font-size: 22px;
  font-weight: 600;
}

.background-modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.explanation-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.explanation-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.explanation-content h3 {
  margin: 0 0 8px 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
}

.explanation-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  line-height: 1.5;
}

.benefits-section {
  margin-bottom: 20px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.benefit-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
}

.settings-note {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-note p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  text-align: center;
}

.dont-show-again {
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
}

.checkbox-text {
  user-select: none;
}

.background-modal-footer {
  padding: 20px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enable-button {
  all: unset;
  width: 100%;
  padding: 14px 20px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.enable-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.enable-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.skip-button {
  all: unset;
  width: 100%;
  padding: 12px 20px;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.skip-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}
</style> 