<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    :title="title"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'circular'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  title?: string
  position?: '' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  title: '',
  position: ''
})

const buttonClasses = computed(() => {
  const classes = ['base-button']
  
  // Add variant class
  classes.push(`base-button--${props.variant}`)
  
  // Add size class
  classes.push(`base-button--${props.size}`)
  
  // Add position class if specified
  if (props.position) {
    classes.push(`base-button--${props.position}`)
  }
  
  // Add disabled class
  if (props.disabled) {
    classes.push('base-button--disabled')
  }
  
  return classes
})
</script>

<style scoped>
.base-button {
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Primary variant (based on gps-points-button) */
.base-button--primary {
  background-image: radial-gradient(#535353 0.7px, transparent 0.7px);
  background-size: 3px 3px;
  border-radius: 5px;
  font-size: 14px;
  padding: 8px 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.base-button--primary:hover:not(.base-button--disabled) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.6);
}



/* Circular variant (based on reset-zoom-button and dev-logs-button) */
.base-button--circular {
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.base-button--circular:hover:not(.base-button--disabled) {
  background-color: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

/* Size variants */
.base-button--small {
  font-size: 12px;
  padding: 4px 8px;
}

.base-button--small.base-button--circular {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.base-button--medium {
  font-size: 14px;
  padding: 8px 12px;
}

.base-button--medium.base-button--circular {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.base-button--large {
  font-size: 16px;
  padding: 12px 16px;
}

.base-button--large.base-button--circular {
  width: 48px;
  height: 48px;
  font-size: 18px;
}

/* Position variants */
.base-button--top-left {
  position: absolute;
  top: max(env(safe-area-inset-top), 20px);
  left: 20px;
}

.base-button--top-right {
  position: absolute;
  top: max(env(safe-area-inset-top), 20px);
  right: 20px;
}

.base-button--bottom-left {
  position: absolute;
  bottom: calc(30px + env(safe-area-inset-bottom));
  left: 20px;
  /* margin-bottom: env(safe-area-inset-bottom); */
}

.base-button--bottom-right {
  position: absolute;
  bottom: calc(30px + env(safe-area-inset-bottom));
  right: 20px;
  /* margin-bottom: env(safe-area-inset-bottom); */
}

/* Disabled state */
.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.base-button--disabled:hover {
  transform: none;
  border-color: rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.7);
}
</style> 