import { ref, computed } from 'vue';
export function useInteractions(onPan, onZoom) {
    // Interaction state
    var isDragging = ref(false);
    var lastDragX = ref(0);
    var lastDragY = ref(0);
    // Desktop detection
    var isDesktop = computed(function () {
        if (typeof window === 'undefined')
            return false;
        return window.innerWidth > 768 && !('ontouchstart' in window);
    });
    // Internal methods
    var startDrag = function (clientX, clientY) {
        isDragging.value = true;
        lastDragX.value = clientX;
        lastDragY.value = clientY;
    };
    var drag = function (clientX, clientY) {
        if (!isDragging.value)
            return;
        var deltaX = clientX - lastDragX.value;
        var deltaY = clientY - lastDragY.value;
        onPan(deltaX, deltaY);
        lastDragX.value = clientX;
        lastDragY.value = clientY;
    };
    var endDrag = function () {
        isDragging.value = false;
    };
    // Touch event handlers
    var handleTouchStart = function (e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    };
    var handleTouchMove = function (e) {
        if (e.touches.length === 1) {
            e.preventDefault();
            drag(e.touches[0].clientX, e.touches[0].clientY);
        }
    };
    var handleTouchEnd = function (e) {
        if (e.touches.length === 0) {
            endDrag();
        }
    };
    // Mouse event handlers
    var handleMouseDown = function (e) {
        if (isDesktop.value) {
            e.preventDefault();
            startDrag(e.clientX, e.clientY);
        }
    };
    var handleMouseMove = function (e) {
        if (isDesktop.value) {
            e.preventDefault();
            drag(e.clientX, e.clientY);
        }
    };
    var handleMouseUp = function (e) {
        if (isDesktop.value) {
            e.preventDefault();
            endDrag();
        }
    };
    // Wheel event handler
    var handleWheel = function (e) {
        e.preventDefault();
        onZoom(e.deltaY);
    };
    return {
        // State
        isDragging: isDragging,
        isDesktop: isDesktop,
        // Event handlers
        handleTouchStart: handleTouchStart,
        handleTouchMove: handleTouchMove,
        handleTouchEnd: handleTouchEnd,
        handleMouseDown: handleMouseDown,
        handleMouseMove: handleMouseMove,
        handleMouseUp: handleMouseUp,
        handleWheel: handleWheel
    };
}
