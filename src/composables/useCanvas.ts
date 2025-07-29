import { ref, computed } from 'vue';
import type { Point, Bounds } from '../types/gps';
import { CANVAS_CONFIG } from '../constants/gpsConstants';
import { project, calculateBounds, drawCenterCross } from '../utils/canvasUtils';

export function useCanvas() {
  // Canvas refs
  const canvasEl = ref<HTMLCanvasElement | null>(null);
  const context = ref<CanvasRenderingContext2D | null>(null);
  
  // Viewport state
  const scale = ref(1);
  const viewOffsetX = ref(0);
  const viewOffsetY = ref(0);
  
  // Computed properties
  const isCanvasReady = computed(() => !!(canvasEl.value && context.value));

  const setupCanvas = (): void => {
    if (!canvasEl.value) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvasEl.value.getBoundingClientRect();

    canvasEl.value.width = rect.width * dpr;
    canvasEl.value.height = rect.height * dpr;
    
    context.value = canvasEl.value.getContext('2d');
    if (!context.value) {
      console.error("Failed to get 2D context");
      return;
    }
  };

  const drawPath = (displayPoints: Point[], displayBounds: Bounds | null): void => {
    if (!context.value || !canvasEl.value) {
      console.warn('Canvas or context not available for drawing.');
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const canvas = canvasEl.value;
    const ctx = context.value;

    // Logical dimensions (CSS pixels)
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;

    // Clear and reset transform
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);
    ctx.restore();

    ctx.save();

    // Apply transforms
    ctx.scale(dpr, dpr);
    ctx.translate(logicalWidth / 2, logicalHeight / 2);      // Move origin to center of canvas
    ctx.scale(scale.value, scale.value);                    // Apply zoom centered on canvas origin
    ctx.translate(viewOffsetX.value, viewOffsetY.value);    // Then apply panning in logical space
    ctx.translate(-logicalWidth / 2, -logicalHeight / 2);   // Move origin back

    // Drawing logic
    if (displayPoints.length === 0) {
      drawCenterCross(ctx, logicalWidth, logicalHeight, scale.value, dpr);
    } else if (displayPoints.length >= 1 && displayBounds) {
      drawGPSPath(ctx, displayPoints, displayBounds, logicalWidth, logicalHeight, dpr);
    }

    ctx.restore();
  };

  const drawGPSPath = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    bounds: Bounds,
    logicalWidth: number,
    logicalHeight: number,
    dpr: number
  ): void => {
    // Draw path lines
    if (points.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const { x, y } = project(points[i], bounds, logicalWidth, logicalHeight);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = CANVAS_CONFIG.LINE_WIDTH / (scale.value * dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    // Draw current position dot
    const lastPoint = points[points.length - 1];
    const { x: lastX, y: lastY } = project(lastPoint, bounds, logicalWidth, logicalHeight);
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(lastX, lastY, CANVAS_CONFIG.CURRENT_POSITION_DOT_SIZE / (scale.value * dpr), 0, 2 * Math.PI);
    ctx.fill();
  };

  const zoom = (deltaY: number, focalX?: number, focalY?: number): void => {
    const oldScale = scale.value;
    const newScale = deltaY < 0
      ? scale.value * (1 + CANVAS_CONFIG.ZOOM_FACTOR) // Zoom in
      : scale.value / (1 + CANVAS_CONFIG.ZOOM_FACTOR); // Zoom out

    const clampedScale = Math.max(CANVAS_CONFIG.MIN_SCALE, Math.min(newScale, CANVAS_CONFIG.MAX_SCALE));
    
    // If focal point is provided, adjust view offset to zoom towards that point
    if (focalX !== undefined && focalY !== undefined && canvasEl.value) {
      const rect = canvasEl.value.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;
      
      // Calculate the focal point relative to canvas center
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const focalOffsetX = focalX - centerX;
      const focalOffsetY = focalY - centerY;
      
      // Calculate the scale factor
      const scaleFactor = clampedScale / oldScale;
      
      // Adjust the view offset to keep the focal point in the same screen position
      viewOffsetX.value += focalOffsetX * (1 - scaleFactor);
      viewOffsetY.value += focalOffsetY * (1 - scaleFactor);
    }
    
    scale.value = clampedScale;
  };

  const pan = (deltaX: number, deltaY: number): void => {
    const dpr = window.devicePixelRatio || 1;
    // Make panning proportional to zoom level - slower when zoomed in
    const panSpeed = 1 / scale.value;
    viewOffsetX.value += (deltaX * panSpeed) / dpr;
    viewOffsetY.value += (deltaY * panSpeed) / dpr;
  };

  const resetView = (): void => {
    scale.value = 1;
    viewOffsetX.value = 0;
    viewOffsetY.value = 0;
  };

  return {
    // Refs
    canvasEl,
    context,
    
    // State
    scale,
    viewOffsetX,
    viewOffsetY,
    isCanvasReady,
    
    // Methods
    setupCanvas,
    drawPath,
    zoom,
    pan,
    resetView,
    calculateBounds
  };
} 