import { ref, computed } from 'vue';

export function useInteractions(onPan: (deltaX: number, deltaY: number) => void, onZoom: (deltaY: number) => void) {
  // Interaction state
  const isDragging = ref(false);
  const lastDragX = ref(0);
  const lastDragY = ref(0);

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

  // Touch event handlers
  const handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      e.preventDefault();
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: TouchEvent): void => {
    if (e.touches.length === 1) {
      e.preventDefault();
      drag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: TouchEvent): void => {
    if (e.touches.length === 0) {
      endDrag();
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
    onZoom(e.deltaY);
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