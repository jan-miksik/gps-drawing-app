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
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
var canvas = ref(null);
var context = ref(null);
var points = ref([]);
// const isTracking = ref(true);
var bounds = ref(null);
var watchId = null;
// Zoom and pan state
var scale = ref(1);
var offsetX = ref(0);
var offsetY = ref(0);
var isDragging = ref(false);
var lastX = ref(0);
var lastY = ref(0);
// Current GPS position
var currentLat = ref(0);
var currentLon = ref(0);
// Detect if we're on desktop
var isDesktop = computed(function () {
    return window.innerWidth > 768 && !('ontouchstart' in window);
});
// const statusText = computed(() => {
//   if (points.value.length === 0) return 'Ready to track';
//   const duration = points.value.length > 1 
//     ? Math.round((points.value[points.value.length - 1].timestamp - points.value[0].timestamp) / 1000)
//     : 0;
//   return `Points: ${points.value.length} | Time: ${duration}s | Zoom: ${scale.value.toFixed(1)}x`;
// });
// Function to navigate to desktop version
// const goToDesktop = () => {
//   // Store current data in localStorage for desktop version
//   localStorage.setItem('gps-drawing-data', JSON.stringify({
//     points: points.value,
//     timestamp: Date.now()
//   }));
//   // Navigate to desktop version
//   window.location.href = '/desktop.html';
// };
var calculateBounds = function () {
    if (points.value.length === 0)
        return;
    var lats = points.value.map(function (p) { return p.lat; });
    var lons = points.value.map(function (p) { return p.lon; });
    bounds.value = {
        minLat: Math.min.apply(Math, lats),
        maxLat: Math.max.apply(Math, lats),
        minLon: Math.min.apply(Math, lons),
        maxLon: Math.max.apply(Math, lons)
    };
};
var project = function (_a) {
    var lat = _a.lat, lon = _a.lon;
    var width = canvas.value.width;
    var height = canvas.value.height;
    if (!bounds.value || points.value.length < 2) {
        // Center the first point
        return { x: width / 2, y: height / 2 };
    }
    var padding = 80;
    var latRange = bounds.value.maxLat - bounds.value.minLat;
    var lonRange = bounds.value.maxLon - bounds.value.minLon;
    var scaleX = lonRange > 0 ? (width - 2 * padding) / lonRange : 1;
    var scaleY = latRange > 0 ? (height - 2 * padding) / latRange : 1;
    var baseScale = Math.min(scaleX, scaleY);
    var centerX = (bounds.value.minLon + bounds.value.maxLon) / 2;
    var centerY = (bounds.value.minLat + bounds.value.maxLat) / 2;
    var x = width / 2 + (lon - centerX) * baseScale;
    var y = height / 2 - (lat - centerY) * baseScale;
    // Apply zoom and pan transforms
    x = (x + offsetX.value) * scale.value;
    y = (y + offsetY.value) * scale.value;
    return { x: x, y: y };
};
// const resetView = () => {
//   scale.value = 1;
//   offsetX.value = 0;
//   offsetY.value = 0;
//   drawPath();
// };
var drawPath = function () {
    if (!context.value)
        return;
    var width = canvas.value.width;
    var height = canvas.value.height;
    // Clear canvas
    context.value.clearRect(0, 0, width, height);
    // Save context state
    context.value.save();
    // Apply zoom and pan transforms
    context.value.translate(offsetX.value * scale.value, offsetY.value * scale.value);
    context.value.scale(scale.value, scale.value);
    if (points.value.length < 2) {
        context.value.restore();
        return;
    }
    // Draw the path
    context.value.beginPath();
    for (var i = 0; i < points.value.length; i++) {
        var _a = project(points.value[i]), x = _a.x, y = _a.y;
        if (i === 0) {
            context.value.moveTo(x, y);
        }
        else {
            context.value.lineTo(x, y);
        }
    }
    // Path styling
    context.value.strokeStyle = 'white';
    context.value.lineWidth = 4 / scale.value; // Adjust line width for zoom
    context.value.lineCap = 'round';
    context.value.lineJoin = 'round';
    context.value.stroke();
    // Draw current position
    if (points.value.length > 0) {
        var _b = project(points.value[points.value.length - 1]), x = _b.x, y = _b.y;
        context.value.fillStyle = 'white';
        context.value.beginPath();
        context.value.arc(x, y, 8 / scale.value, 0, 2 * Math.PI); // Adjust circle size for zoom
        context.value.fill();
    }
    // Restore context state
    context.value.restore();
};
var addGPSPoint = function (position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var timestamp = Date.now();
    currentLat.value = lat;
    currentLon.value = lon;
    points.value.push({ lat: lat, lon: lon, timestamp: timestamp });
    if (points.value.length >= 2) {
        calculateBounds();
    }
    drawPath();
};
// const clearPath = () => {
//   points.value = [];
//   bounds.value = null;
//   scale.value = 1;
//   offsetX.value = 0;
//   offsetY.value = 0;
//   if (context.value && canvas.value) {
//     context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
//   }
// };
onMounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    var dpr, rect, permission, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (canvas.value) {
                    dpr = window.devicePixelRatio || 1;
                    rect = canvas.value.getBoundingClientRect();
                    canvas.value.width = rect.width * dpr;
                    canvas.value.height = rect.height * dpr;
                    canvas.value.style.width = rect.width + 'px';
                    canvas.value.style.height = rect.height + 'px';
                    context.value = canvas.value.getContext('2d');
                    if (context.value) {
                        context.value.scale(dpr, dpr);
                    }
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, Geolocation.checkPermissions()];
            case 2:
                permission = _a.sent();
                if (!(permission.location !== 'granted')) return [3 /*break*/, 4];
                return [4 /*yield*/, Geolocation.requestPermissions()];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, Geolocation.watchPosition({
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 3000
                }, function (position, err) {
                    if (err) {
                        console.error('GPS Error:', err);
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
                console.error('Failed to start tracking:', error_1);
                return [3 /*break*/, 7];
            case 7:
                // Load data from desktop version if available
                loadDataFromDesktop();
                return [2 /*return*/];
        }
    });
}); });
// Function to load data from desktop version
var loadDataFromDesktop = function () {
    try {
        var savedData = localStorage.getItem('gps-drawing-data');
        if (savedData) {
            var data = JSON.parse(savedData);
            if (data.points && data.points.length > 0) {
                points.value = data.points;
                if (points.value.length >= 2) {
                    calculateBounds();
                }
                drawPath();
                // Clear the saved data after loading
                localStorage.removeItem('gps-drawing-data');
            }
        }
    }
    catch (error) {
        console.error('Error loading data from desktop:', error);
    }
};
onUnmounted(function () {
    if (watchId) {
        Geolocation.clearWatch({ id: watchId });
    }
});
// Touch and mouse event handlers
var handleTouchStart = function (e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        isDragging.value = true;
        lastX.value = e.touches[0].clientX;
        lastY.value = e.touches[0].clientY;
    }
};
var handleTouchMove = function (e) {
    e.preventDefault();
    if (isDragging.value && e.touches.length === 1) {
        var deltaX = e.touches[0].clientX - lastX.value;
        var deltaY = e.touches[0].clientY - lastY.value;
        offsetX.value += deltaX;
        offsetY.value += deltaY;
        lastX.value = e.touches[0].clientX;
        lastY.value = e.touches[0].clientY;
        drawPath();
    }
};
var handleTouchEnd = function () {
    isDragging.value = false;
};
var handleMouseDown = function (e) {
    if (isDesktop.value) {
        isDragging.value = true;
        lastX.value = e.clientX;
        lastY.value = e.clientY;
    }
};
var handleMouseMove = function (e) {
    if (isDragging.value && isDesktop.value) {
        var deltaX = e.clientX - lastX.value;
        var deltaY = e.clientY - lastY.value;
        offsetX.value += deltaX;
        offsetY.value += deltaY;
        lastX.value = e.clientX;
        lastY.value = e.clientY;
        drawPath();
    }
};
var handleMouseUp = function () {
    isDragging.value = false;
};
var handleWheel = function (e) {
    e.preventDefault();
    var zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    var newScale = Math.max(0.1, Math.min(10, scale.value * zoomFactor));
    // Zoom towards mouse position
    var rect = canvas.value.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    var scaleChange = newScale / scale.value;
    offsetX.value = mouseX - (mouseX - offsetX.value) * scaleChange;
    offsetY.value = mouseY - (mouseY - offsetY.value) * scaleChange;
    scale.value = newScale;
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas)(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ onTouchstart: (__VLS_ctx.handleTouchStart) }, { onTouchmove: (__VLS_ctx.handleTouchMove) }), { onTouchend: (__VLS_ctx.handleTouchEnd) }), { onMousedown: (__VLS_ctx.handleMouseDown) }), { onMousemove: (__VLS_ctx.handleMouseMove) }), { onMouseup: (__VLS_ctx.handleMouseUp) }), { onWheel: (__VLS_ctx.handleWheel) }), { ref: "canvas" }), { class: "canvas" }));
/** @type {typeof __VLS_ctx.canvas} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "coordinates" }));
(__VLS_ctx.currentLat);
(__VLS_ctx.currentLon);
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['coordinates']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            canvas: canvas,
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
