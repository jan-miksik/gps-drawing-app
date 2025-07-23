var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
var canvasEl = ref(null); // Renamed for clarity
var context = ref(null);
var points = ref([]);
var bounds = ref(null);
var watchId = null;
// Zoom and pan state
var scale = ref(1);
var viewOffsetX = ref(0); // Renamed to avoid confusion with point offsets
var viewOffsetY = ref(0);
var isDragging = ref(false);
var lastDragX = ref(0); // Renamed for clarity
var lastDragY = ref(0);
// Current GPS position
var currentLat = ref(0);
var currentLon = ref(0);
// Padding around the drawing within the canvas
var DRAWING_PADDING = 40; // In logical pixels
// const STORAGE_KEY = 'gps_path_points';
// const loadPointsFromStorage = () => {
//   try {
//     const saved = localStorage.getItem(STORAGE_KEY);
//     if (saved) {
//       const parsed = JSON.parse(saved) as Point[];
//       points.value = parsed;
//       calculateBounds();
//       nextTick(() => drawPath());
//     }
//   } catch (e) {
//     console.error('Failed to load points from storage', e);
//   }
// };
// const savePointsToStorage = () => {
//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(points.value));
//   } catch (e) {
//     console.error('Failed to save points to storage', e);
//   }
// };
// Detect if we're on desktop
var isDesktop = computed(function () {
    if (typeof window === 'undefined')
        return false;
    return window.innerWidth > 768 && !('ontouchstart' in window);
});
var calculateBounds = function () {
    if (points.value.length === 0) {
        bounds.value = null;
        return;
    }
    if (points.value.length === 1) {
        // For a single point, create a small default bound around it
        var p = points.value[0];
        var delta = 0.0001; // Small delta for single point bounds
        bounds.value = {
            minLat: p.lat - delta,
            maxLat: p.lat + delta,
            minLon: p.lon - delta,
            maxLon: p.lon + delta,
        };
        return;
    }
    var lats = points.value.map(function (p) { return p.lat; });
    var lons = points.value.map(function (p) { return p.lon; });
    bounds.value = {
        minLat: Math.min.apply(Math, lats),
        maxLat: Math.max.apply(Math, lats),
        minLon: Math.min.apply(Math, lons),
        maxLon: Math.max.apply(Math, lons),
    };
};
var project = function (point, currentBounds, canvasLogicalWidth, canvasLogicalHeight) {
    // If only one point exists (or bounds indicate no range), center it.
    if (currentBounds.minLat === currentBounds.maxLat || currentBounds.minLon === currentBounds.maxLon) {
        return {
            x: (canvasLogicalWidth - 2 * DRAWING_PADDING) / 2 + DRAWING_PADDING,
            y: (canvasLogicalHeight - 2 * DRAWING_PADDING) / 2 + DRAWING_PADDING,
        };
    }
    var latRange = currentBounds.maxLat - currentBounds.minLat;
    var lonRange = currentBounds.maxLon - currentBounds.minLon;
    var drawableWidth = canvasLogicalWidth - 2 * DRAWING_PADDING;
    var drawableHeight = canvasLogicalHeight - 2 * DRAWING_PADDING;
    // Handle potential division by zero if range is extremely small (though bounds check helps)
    var scaleX = lonRange > 1e-9 ? drawableWidth / lonRange : 1;
    var scaleY = latRange > 1e-9 ? drawableHeight / latRange : 1;
    // Use the smaller scale to fit the entire drawing within the drawable area and maintain aspect ratio
    var baseScale = Math.min(scaleX, scaleY);
    // Calculate the center of the bounds in lat/lon
    var centerXLatLon = (currentBounds.minLat + currentBounds.maxLat) / 2;
    var centerYLatLon = (currentBounds.minLon + currentBounds.maxLon) / 2;
    // Calculate the center of the drawable area on canvas
    var canvasCenterX = drawableWidth / 2 + DRAWING_PADDING;
    var canvasCenterY = drawableHeight / 2 + DRAWING_PADDING;
    // Project the point:
    // 1. Get offset from the center of the bounds (in lat/lon units, scaled by baseScale)
    // 2. Add to canvas center
    // Y is inverted because canvas Y increases downwards, latitude increases upwards
    var x = canvasCenterX + (point.lon - centerYLatLon) * baseScale;
    var y = canvasCenterY - (point.lat - centerXLatLon) * baseScale;
    return { x: x, y: y };
};
var drawPath = function () {
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
    // 0. Reset transform to identity and clear
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Apply DPR scale, reset others
    ctx.clearRect(0, 0, logicalWidth, logicalHeight); // Clear based on logical size
    ctx.restore();
    if (points.value.length === 0 || !bounds.value) {
        // console.log('No points or bounds to draw.');
        return;
    }
    ctx.save();
    // 1. Apply Device Pixel Ratio scaling (base transform)
    ctx.scale(dpr, dpr);
    // 2. Apply view pan (user dragging) - these are offsets in logical pixels
    ctx.translate(viewOffsetX.value, viewOffsetY.value);
    // 3. Apply view zoom (user wheel/pinch) - centered zoom
    // To zoom from the center of the viewport:
    // Translate so the current center of the view is at the origin (0,0)
    ctx.translate(logicalWidth / 2, logicalHeight / 2);
    ctx.scale(scale.value, scale.value); // Apply zoom
    // Translate back
    ctx.translate(-logicalWidth / 2, -logicalHeight / 2);
    // --- Drawing logic ---
    if (points.value.length >= 1 && bounds.value) { // Need at least one point to draw a dot
        ctx.beginPath();
        for (var i = 0; i < points.value.length; i++) {
            var _a = project(points.value[i], bounds.value, logicalWidth, logicalHeight), x = _a.x, y = _a.y;
            if (i === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
        }
        if (points.value.length > 1) { // Only stroke if there's a path
            ctx.strokeStyle = 'white';
            // Adjust line width based on current view scale, so it appears consistent
            ctx.lineWidth = 2 / (scale.value * dpr); // More refined line width adjustment
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
        // Draw current position as a dot (even if it's the only point)
        var lastPoint = points.value[points.value.length - 1];
        var _b = project(lastPoint, bounds.value, logicalWidth, logicalHeight), lastX = _b.x, lastY = _b.y;
        ctx.fillStyle = 'white'; // Current position dot color
        ctx.beginPath();
        ctx.arc(lastX, lastY, 10 / (scale.value * dpr), 0, 2 * Math.PI); // Adjust dot size
        ctx.fill();
    }
    // --- End Drawing logic ---
    ctx.restore(); // Restore to the state before pan/zoom/DPR
};
var addGPSPoint = function (position) {
    if (!position) {
        console.warn('Received null position in addGPSPoint');
        return;
    }
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var timestamp = Date.now();
    currentLat.value = lat;
    currentLon.value = lon;
    points.value.push({ lat: lat, lon: lon, timestamp: timestamp });
    calculateBounds(); // Recalculate bounds with the new point
    // savePointsToStorage(); // 🆕 Save updated path
    // Use nextTick to ensure DOM updates (like canvas resize) are processed before drawing
    nextTick(function () {
        drawPath();
    });
};
var setupCanvas = function () {
    if (canvasEl.value) {
        var dpr = window.devicePixelRatio || 1;
        var rect = canvasEl.value.getBoundingClientRect();
        canvasEl.value.width = rect.width * dpr;
        canvasEl.value.height = rect.height * dpr;
        // CSS already handles display width/height at 100%
        context.value = canvasEl.value.getContext('2d');
        if (!context.value) {
            console.error("Failed to get 2D context");
            return;
        }
        // Initial draw if there are points (e.g., from loaded data)
        calculateBounds();
        drawPath();
    }
};
onMounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    var permissionStatus, requestStatus, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                setupCanvas(); // Initial setup
                // loadPointsFromStorage();
                // Optional: Add resize listener if you want to re-setup canvas on window resize
                window.addEventListener('resize', setupCanvas);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, Geolocation.checkPermissions()];
            case 2:
                permissionStatus = _a.sent();
                if (!(permissionStatus.location !== 'granted' && permissionStatus.coarseLocation !== 'granted')) return [3 /*break*/, 4];
                return [4 /*yield*/, Geolocation.requestPermissions()];
            case 3:
                requestStatus = _a.sent();
                if (requestStatus.location !== 'granted' && requestStatus.coarseLocation !== 'granted') {
                    console.error('Location permission denied.');
                    // Optionally, display a message to the user
                    return [2 /*return*/];
                }
                _a.label = 4;
            case 4: return [4 /*yield*/, Geolocation.watchPosition({
                    enableHighAccuracy: true,
                    timeout: 10000, // Max time to wait for a position
                    maximumAge: 3000 // How old a cached position can be
                }, function (position, err) {
                    if (err) {
                        console.error('GPS Error:', err.message, err.code);
                        // Handle specific errors, e.g., err.code === 1 (PERMISSION_DENIED)
                        // err.code === 2 (POSITION_UNAVAILABLE)
                        // err.code === 3 (TIMEOUT)
                    }
                    else if (position) {
                        addGPSPoint(position);
                    }
                })];
            case 5:
                watchId = _a.sent();
                return [3 /*break*/, 7];
            case 6:
                error_1 = _a.sent();
                console.error('Failed to start GPS tracking:', error_1.message || error_1);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
onUnmounted(function () {
    if (watchId) {
        Geolocation.clearWatch({ id: watchId });
    }
    window.removeEventListener('resize', setupCanvas);
});
// --- Touch and Mouse Event Handlers for Panning ---
var startDrag = function (clientX, clientY) {
    isDragging.value = true;
    lastDragX.value = clientX;
    lastDragY.value = clientY;
};
var drag = function (clientX, clientY) {
    if (!isDragging.value)
        return;
    var dpr = window.devicePixelRatio || 1;
    // Deltas should be in logical pixels, so divide by current scale and DPR
    // No, deltas are direct view offsets, user perceives them in screen pixels.
    // The effect of scale on panning speed is managed by how transforms are applied.
    var deltaX = (clientX - lastDragX.value) / dpr; // Convert screen pixel delta to logical canvas pixel delta
    var deltaY = (clientY - lastDragY.value) / dpr;
    viewOffsetX.value += deltaX;
    viewOffsetY.value += deltaY;
    lastDragX.value = clientX;
    lastDragY.value = clientY;
    drawPath();
};
var endDrag = function () {
    isDragging.value = false;
};
var handleTouchStart = function (e) {
    if (e.touches.length === 1) {
        e.preventDefault();
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
    // Basic pinch zoom could be added here by checking e.touches.length === 2
};
var handleTouchMove = function (e) {
    if (e.touches.length === 1) {
        e.preventDefault();
        drag(e.touches[0].clientX, e.touches[0].clientY);
    }
};
var handleTouchEnd = function (e) {
    if (e.touches.length === 0) { // All touches lifted
        endDrag();
    }
};
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
// --- Wheel Event Handler for Zooming ---
var handleWheel = function (e) {
    e.preventDefault();
    if (!canvasEl.value)
        return;
    var zoomFactor = 0.1;
    var newScale = e.deltaY < 0
        ? scale.value * (1 + zoomFactor) // Zoom in
        : scale.value / (1 + zoomFactor); // Zoom out
    scale.value = Math.max(0.1, Math.min(newScale, 10)); // Clamp scale
    // Zoom towards mouse position (more complex, for simplicity, this example zooms towards center)
    // To implement zoom towards mouse:
    // 1. Get mouse position relative to canvas (logical pixels)
    // const rect = canvasEl.value.getBoundingClientRect();
    // const mouseX = (e.clientX - rect.left);
    // const mouseY = (e.clientY - rect.top);
    // 2. Adjust viewOffsetX/Y based on mouse position and scale change
    // const dpr = window.devicePixelRatio || 1;
    // const logicalMouseX = mouseX / dpr;
    // const logicalMouseY = mouseY / dpr;
    // const scaleChange = newScale / oldScale; // oldScale needs to be stored before updating scale.value
    // viewOffsetX.value = logicalMouseX - (logicalMouseX - viewOffsetX.value) * scaleChange;
    // viewOffsetY.value = logicalMouseY - (logicalMouseY - viewOffsetY.value) * scaleChange;
    drawPath();
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "app",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas)(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ onTouchstart: (__VLS_ctx.handleTouchStart) }, { onTouchmove: (__VLS_ctx.handleTouchMove) }), { onTouchend: (__VLS_ctx.handleTouchEnd) }), { onMousedown: (__VLS_ctx.handleMouseDown) }), { onMousemove: (__VLS_ctx.handleMouseMove) }), { onMouseup: (__VLS_ctx.handleMouseUp) }), { onWheel: (__VLS_ctx.handleWheel) }), { ref: "canvasEl" }), { class: "canvas" }));
/** @type {typeof __VLS_ctx.canvasEl} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "coordinates" }));
(__VLS_ctx.currentLat.toFixed(6));
(__VLS_ctx.currentLon.toFixed(6));
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['coordinates']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            canvasEl: canvasEl,
            currentLat: currentLat,
            currentLon: currentLon,
            handleTouchStart: handleTouchStart,
            handleTouchMove: handleTouchMove,
            handleTouchEnd: handleTouchEnd,
            handleMouseDown: handleMouseDown,
            handleMouseMove: handleMouseMove,
            handleMouseUp: handleMouseUp,
            handleWheel: handleWheel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
