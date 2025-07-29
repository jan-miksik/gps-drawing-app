import { ref, computed } from 'vue';
import { CANVAS_CONFIG } from '../constants/gpsConstants';

export function useInteractions(
  onPan: (deltaX: number, deltaY: number) => void, 
  onZoom: (deltaY: number, focalX?: number, focalY?: number) => void,
  onReset?: () => void
) {
  // Interaction state
  const isDragging = ref(false);
  const lastDragX = ref(0);
  const lastDragY = ref(0);
  
  // Pinch-to-zoom state
  const initialPinchDistance = ref(0);
  const initialScale = ref(1);
  
  // Double-tap state
  const lastTapTime = ref(0);
  const tapCount = ref(0);

  // Desktop detection
  const isDesktop = computed(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth > 768 && !('ontouchstart' in window);
  });

  // Internal methods
  const startDrag = (clientX: number, clientY: number): void => {
    isDragging.value = true;
    lastDragX.value = clientX;
    lastDragY.value = clientY;
  };

  const drag = (clientX: number, clientY: number): void => {
    if (!isDragging.value) return;

    const deltaX = clientX - lastDragX.value;
    const deltaY = clientY - lastDragY.value;

    onPan(deltaX, deltaY);

    lastDragX.value = clientX;
    lastDragY.value = clientY;
  };

  const endDrag = (): void => {
    isDragging.value = false;
  };

  // Calculate distance between two touch points
  const getTouchDistance = (touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touch points
  const getTouchCenter = (touch1: Touch, touch2: Touch): { x: number, y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Check for double-tap
      const now = Date.now();
      if (now - lastTapTime.value < 300) { // 300ms threshold
        tapCount.value++;
        if (tapCount.value === 2 && onReset) {
          onReset();
          tapCount.value = 0;
          return;
        }
      } else {
        tapCount.value = 1;
      }
      lastTapTime.value = now;
      
      // Single touch - start panning
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      // Two touches - start pinch-to-zoom
      initialPinchDistance.value = getTouchDistance(e.touches[0], e.touches[1]);
      initialScale.value = 1; // This will be set by the canvas scale
      isDragging.value = false; // Stop panning
      tapCount.value = 0; // Reset tap count
    }
  };

  const handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging.value) {
      // Single touch - continue panning
      drag(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      // Two touches - handle pinch-to-zoom
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleChange = currentDistance / initialPinchDistance.value;
      
      // Get the center point between the two fingers
      const touchCenter = getTouchCenter(e.touches[0], e.touches[1]);
      
      // Convert scale change to zoom delta
      const zoomDelta = (scaleChange - 1) * CANVAS_CONFIG.PINCH_ZOOM_SENSITIVITY;
      onZoom(-zoomDelta, touchCenter.x, touchCenter.y); // Pass focal point
      
      initialPinchDistance.value = currentDistance;
    }
  };

  const handleTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0) {
      // No touches left - end all interactions
      endDrag();
      initialPinchDistance.value = 0;
    } else if (e.touches.length === 1) {
      // One touch left - switch to panning
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
      initialPinchDistance.value = 0;
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e: MouseEvent): void => {
    if (isDesktop.value) {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    }
  };

  const handleMouseMove = (e: MouseEvent): void => {
    if (isDesktop.value) {
      e.preventDefault();
      drag(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = (e: MouseEvent): void => {
    if (isDesktop.value) {
      e.preventDefault();
      endDrag();
    }
  };

  // Wheel event handler
  const handleWheel = (e: WheelEvent): void => {
    e.preventDefault();
    // Get mouse position relative to canvas for focal point
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const focalX = e.clientX - rect.left;
    const focalY = e.clientY - rect.top;
    onZoom(e.deltaY, focalX, focalY);
  };

  return {
    // State
    isDragging,
    isDesktop,
    
    // Event handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel
  };
} 