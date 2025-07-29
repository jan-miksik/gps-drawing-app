import { ref, computed } from 'vue';
import { CANVAS_CONFIG } from '../constants/gpsConstants';
export function useInteractions(onPan, onZoom, onReset) {
    // Interaction state
    var isDragging = ref(false);
    var lastDragX = ref(0);
    var lastDragY = ref(0);
    // Pinch-to-zoom state
    var initialPinchDistance = ref(0);
    var initialScale = ref(1);
    // Double-tap state
    var lastTapTime = ref(0);
    var tapCount = ref(0);
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
    // Calculate distance between two touch points
    var getTouchDistance = function (touch1, touch2) {
        var dx = touch1.clientX - touch2.clientX;
        var dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };
    // Calculate center point between two touch points
    var getTouchCenter = function (touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    };
    // Touch event handlers
    var handleTouchStart = function (e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            // Check for double-tap
            var now = Date.now();
            if (now - lastTapTime.value < 300) { // 300ms threshold
                tapCount.value++;
                if (tapCount.value === 2 && onReset) {
                    onReset();
                    tapCount.value = 0;
                    return;
                }
            }
            else {
                tapCount.value = 1;
            }
            lastTapTime.value = now;
            // Single touch - start panning
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
        else if (e.touches.length === 2) {
            // Two touches - start pinch-to-zoom
            initialPinchDistance.value = getTouchDistance(e.touches[0], e.touches[1]);
            initialScale.value = 1; // This will be set by the canvas scale
            isDragging.value = false; // Stop panning
            tapCount.value = 0; // Reset tap count
        }
    };
    var handleTouchMove = function (e) {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging.value) {
            // Single touch - continue panning
            drag(e.touches[0].clientX, e.touches[0].clientY);
        }
        else if (e.touches.length === 2) {
            // Two touches - handle pinch-to-zoom
            var currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
            var scaleChange = currentDistance / initialPinchDistance.value;
            // Get the center point between the two fingers
            var touchCenter = getTouchCenter(e.touches[0], e.touches[1]);
            // Convert scale change to zoom delta
            var zoomDelta = (scaleChange - 1) * CANVAS_CONFIG.PINCH_ZOOM_SENSITIVITY;
            onZoom(-zoomDelta, touchCenter.x, touchCenter.y); // Pass focal point
            initialPinchDistance.value = currentDistance;
        }
    };
    var handleTouchEnd = function (e) {
        if (e.touches.length === 0) {
            // No touches left - end all interactions
            endDrag();
            initialPinchDistance.value = 0;
        }
        else if (e.touches.length === 1) {
            // One touch left - switch to panning
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
            initialPinchDistance.value = 0;
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
        // Get mouse position relative to canvas for focal point
        var rect = e.currentTarget.getBoundingClientRect();
        var focalX = e.clientX - rect.left;
        var focalY = e.clientY - rect.top;
        onZoom(e.deltaY, focalX, focalY);
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
