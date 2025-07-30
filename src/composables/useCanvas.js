import { ref, computed } from 'vue';
import { CANVAS_CONFIG } from '../constants/gpsConstants';
import { project, calculateBounds, drawCenterCross } from '../utils/canvasUtils';
export function useCanvas() {
    // Canvas refs
    var canvasEl = ref(null);
    var context = ref(null);
    // Viewport state
    var scale = ref(1);
    var viewOffsetX = ref(0);
    var viewOffsetY = ref(0);
    // Computed properties
    var isCanvasReady = computed(function () { return !!(canvasEl.value && context.value); });
    var setupCanvas = function () {
        if (!canvasEl.value)
            return;
        var dpr = window.devicePixelRatio || 1;
        var rect = canvasEl.value.getBoundingClientRect();
        canvasEl.value.width = rect.width * dpr;
        canvasEl.value.height = rect.height * dpr;
        context.value = canvasEl.value.getContext('2d');
        if (!context.value) {
            console.error("Failed to get 2D context");
            return;
        }
    };
    var drawPath = function (displayPoints, displayBounds) {
        if (!context.value || !canvasEl.value) {
            console.warn('Canvas or context not available for drawing.');
            return;
        }
        var dpr = window.devicePixelRatio || 1;
        var canvas = canvasEl.value;
        var ctx = context.value;
        // Logical dimensions (CSS pixels)
        var logicalWidth = canvas.width / dpr;
        var logicalHeight = canvas.height / dpr;
        // Clear and reset transform
        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        ctx.restore();
        ctx.save();
        // Apply transforms
        ctx.scale(dpr, dpr);
        ctx.translate(logicalWidth / 2, logicalHeight / 2); // Move origin to center of canvas
        ctx.scale(scale.value, scale.value); // Apply zoom centered on canvas origin
        ctx.translate(viewOffsetX.value, viewOffsetY.value); // Then apply panning in logical space
        ctx.translate(-logicalWidth / 2, -logicalHeight / 2); // Move origin back
        // Drawing logic
        if (displayPoints.length === 0) {
            drawCenterCross(ctx, logicalWidth, logicalHeight, scale.value, dpr);
        }
        else if (displayPoints.length >= 1 && displayBounds) {
            drawGPSPath(ctx, displayPoints, displayBounds, logicalWidth, logicalHeight, dpr);
        }
        ctx.restore();
    };
    var drawGPSPath = function (ctx, points, bounds, logicalWidth, logicalHeight, dpr) {
        // Draw path lines
        if (points.length > 1) {
            ctx.beginPath();
            for (var i = 0; i < points.length; i++) {
                var _a = project(points[i], bounds, logicalWidth, logicalHeight), x = _a.x, y = _a.y;
                if (i === 0) {
                    ctx.moveTo(x, y);
                }
                else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.strokeStyle = 'white';
            ctx.lineWidth = CANVAS_CONFIG.value.LINE_WIDTH / (scale.value * dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
        // Draw current position dot
        var lastPoint = points[points.length - 1];
        var _b = project(lastPoint, bounds, logicalWidth, logicalHeight), lastX = _b.x, lastY = _b.y;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(lastX, lastY, CANVAS_CONFIG.value.CURRENT_POSITION_DOT_SIZE / (scale.value * dpr), 0, 2 * Math.PI);
        ctx.fill();
    };
    var zoom = function (deltaY, focalX, focalY) {
        var oldScale = scale.value;
        var newScale = deltaY < 0
            ? scale.value * (1 + CANVAS_CONFIG.value.ZOOM_FACTOR) // Zoom in
            : scale.value / (1 + CANVAS_CONFIG.value.ZOOM_FACTOR); // Zoom out
        var clampedScale = Math.max(CANVAS_CONFIG.value.MIN_SCALE, Math.min(newScale, CANVAS_CONFIG.value.MAX_SCALE));
        // If focal point is provided, adjust view offset to zoom towards that point
        if (focalX !== undefined && focalY !== undefined && canvasEl.value) {
            var rect = canvasEl.value.getBoundingClientRect();
            var canvasWidth = rect.width;
            var canvasHeight = rect.height;
            // Calculate the focal point relative to canvas center
            var centerX = canvasWidth / 2;
            var centerY = canvasHeight / 2;
            var focalOffsetX = focalX - centerX;
            var focalOffsetY = focalY - centerY;
            // Calculate the scale factor
            var scaleFactor = clampedScale / oldScale;
            // Adjust the view offset to keep the focal point in the same screen position
            viewOffsetX.value += focalOffsetX * (1 - scaleFactor);
            viewOffsetY.value += focalOffsetY * (1 - scaleFactor);
        }
        scale.value = clampedScale;
    };
    var pan = function (deltaX, deltaY) {
        var dpr = window.devicePixelRatio || 1;
        // Make panning proportional to zoom level - slower when zoomed in
        var panSpeed = 1 / scale.value;
        viewOffsetX.value += (deltaX * panSpeed) / dpr;
        viewOffsetY.value += (deltaY * panSpeed) / dpr;
    };
    var resetView = function () {
        scale.value = 1;
        viewOffsetX.value = 0;
        viewOffsetY.value = 0;
    };
    return {
        // Refs
        canvasEl: canvasEl,
        context: context,
        // State
        scale: scale,
        viewOffsetX: viewOffsetX,
        viewOffsetY: viewOffsetY,
        isCanvasReady: isCanvasReady,
        // Methods
        setupCanvas: setupCanvas,
        drawPath: drawPath,
        zoom: zoom,
        pan: pan,
        resetView: resetView,
        calculateBounds: calculateBounds
    };
}
