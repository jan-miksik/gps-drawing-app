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
var isTracking = ref(false);
var cornerCoordinates = ref('');
var bounds = ref(null);
var watchId = null;
// Define current GPS position
var currentLat = ref(0);
var currentLon = ref(0);
// Computed properties for better UI feedback
var statsText = computed(function () {
    if (points.value.length === 0)
        return 'No points recorded';
    var duration = points.value.length > 1
        ? Math.round((points.value[points.value.length - 1].timestamp - points.value[0].timestamp) / 1000)
        : 0;
    return "Points: ".concat(points.value.length, " | Duration: ").concat(duration, "s");
});
// Calculate bounds of all points for proper scaling
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
// Improved projection that scales to fit the canvas
var project = function (_a) {
    var lat = _a.lat, lon = _a.lon;
    var width = canvas.value.width;
    var height = canvas.value.height;
    if (!bounds.value || points.value.length < 2) {
        // Fallback to simple projection for first point
        var x_1 = ((lon + 180) / 360) * width;
        var y_1 = ((90 - lat) / 180) * height;
        return { x: x_1, y: y_1 };
    }
    // Scale to fit the canvas with padding
    var padding = 50;
    var latRange = bounds.value.maxLat - bounds.value.minLat;
    var lonRange = bounds.value.maxLon - bounds.value.minLon;
    // Prevent division by zero
    var scaleX = lonRange > 0 ? (width - 2 * padding) / lonRange : 1;
    var scaleY = latRange > 0 ? (height - 2 * padding) / latRange : 1;
    var scale = Math.min(scaleX, scaleY);
    var centerX = (bounds.value.minLon + bounds.value.maxLon) / 2;
    var centerY = (bounds.value.minLat + bounds.value.maxLat) / 2;
    var x = width / 2 + (lon - centerX) * scale;
    var y = height / 2 - (lat - centerY) * scale;
    return { x: x, y: y };
};
// Draw the complete path
var drawPath = function () {
    if (!context.value || points.value.length < 2)
        return;
    var width = canvas.value.width;
    var height = canvas.value.height;
    // Clear canvas
    context.value.clearRect(0, 0, width, height);
    // Draw grid (optional - helps with orientation)
    drawGrid();
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
    context.value.lineWidth = 3;
    context.value.lineCap = 'round';
    context.value.lineJoin = 'round';
    context.value.stroke();
    // Draw points along the path
    drawPoints();
    // Draw current position indicator
    if (points.value.length > 0) {
        drawCurrentPosition();
    }
};
// Draw a subtle grid
var drawGrid = function () {
    if (!context.value)
        return;
    var width = canvas.value.width;
    var height = canvas.value.height;
    context.value.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    context.value.lineWidth = 1;
    // Vertical lines
    for (var x = 0; x <= width; x += 50) {
        context.value.beginPath();
        context.value.moveTo(x, 0);
        context.value.lineTo(x, height);
        context.value.stroke();
    }
    // Horizontal lines
    for (var y = 0; y <= height; y += 50) {
        context.value.beginPath();
        context.value.moveTo(0, y);
        context.value.lineTo(width, y);
        context.value.stroke();
    }
};
// Draw points along the path
var drawPoints = function () {
    if (!context.value)
        return;
    context.value.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (var i = 0; i < points.value.length; i += Math.max(1, Math.floor(points.value.length / 20))) {
        var _a = project(points.value[i]), x = _a.x, y = _a.y;
        context.value.beginPath();
        context.value.arc(x, y, 2, 0, 2 * Math.PI);
        context.value.fill();
    }
};
// Draw current position with a pulsing effect
var drawCurrentPosition = function () {
    if (!context.value || points.value.length === 0)
        return;
    var _a = project(points.value[points.value.length - 1]), x = _a.x, y = _a.y;
    var time = Date.now() * 0.005;
    var pulseSize = 3 + Math.sin(time) * 2;
    // Outer pulse
    context.value.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.value.beginPath();
    context.value.arc(x, y, pulseSize + 8, 0, 2 * Math.PI);
    context.value.fill();
    // Inner dot
    context.value.fillStyle = 'white';
    context.value.beginPath();
    context.value.arc(x, y, 4, 0, 2 * Math.PI);
    context.value.fill();
};
var addGPSPoint = function (position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var timestamp = Date.now();
    currentLat.value = lat;
    currentLon.value = lon;
    points.value.push({ lat: lat, lon: lon, timestamp: timestamp });
    // Recalculate bounds when we have enough points
    if (points.value.length >= 2) {
        calculateBounds();
    }
    drawPath();
    var edge = points.value[points.value.length - 1];
    cornerCoordinates.value = "Lat: ".concat(edge.lat.toFixed(6), ", Lon: ").concat(edge.lon.toFixed(6));
};
// Alternative: More complex movement patterns
var toggleTracking = function () { return __awaiter(void 0, void 0, void 0, function () {
    var isSimulated, lat_1, lon_1, time_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isTracking.value = !isTracking.value;
                if (!isTracking.value) return [3 /*break*/, 4];
                isSimulated = import.meta.env.MODE === 'development';
                if (!isSimulated) return [3 /*break*/, 1];
                lat_1 = 50.0755;
                lon_1 = 14.4378;
                time_1 = 0;
                watchId = window.setInterval(function () {
                    time_1 += 0.1;
                    // Create a more complex path using parametric equations
                    // This creates a figure-8 pattern with some randomness
                    var baseLat = 50.0755 + Math.sin(time_1) * 0.001;
                    var baseLon = 14.4378 + Math.sin(time_1 * 0.5) * 0.001;
                    // Add wandering around the base path
                    var wanderLat = Math.sin(time_1 * 2.3) * 0.0002;
                    var wanderLon = Math.cos(time_1 * 1.7) * 0.0002;
                    // Add GPS noise
                    var noiseLat = (Math.random() - 0.5) * 0.00001;
                    var noiseLon = (Math.random() - 0.5) * 0.00001;
                    lat_1 = baseLat + wanderLat + noiseLat;
                    lon_1 = baseLon + wanderLon + noiseLon;
                    var position = {
                        coords: {
                            latitude: lat_1,
                            longitude: lon_1,
                            accuracy: 5 + Math.random() * 10
                        },
                    };
                    addGPSPoint(position);
                }, 100).toString();
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, Geolocation.watchPosition({ enableHighAccuracy: true }, function (position, err) {
                    if (err) {
                        console.error('GPS Error:', err);
                    }
                    else if (position) {
                        addGPSPoint(position);
                    }
                })];
            case 2:
                watchId = _a.sent();
                _a.label = 3;
            case 3: return [3 /*break*/, 8];
            case 4:
                if (!(import.meta.env.MODE === 'development')) return [3 /*break*/, 5];
                clearInterval(Number(watchId));
                return [3 /*break*/, 7];
            case 5:
                if (!watchId) return [3 /*break*/, 7];
                return [4 /*yield*/, Geolocation.clearWatch({ id: watchId })];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7:
                watchId = null;
                _a.label = 8;
            case 8: return [2 /*return*/];
        }
    });
}); };
onMounted(function () {
    if (canvas.value) {
        context.value = canvas.value.getContext('2d');
        // Initial grid
        if (context.value) {
            drawGrid();
        }
    }
});
onUnmounted(function () {
    if (watchId)
        toggleTracking();
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
var __VLS_ctx = {};
var __VLS_components;
var __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ onTouchstart: function () { } }, { id: "app" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas)(__assign({ ref: "canvas" }, { class: "canvas" }));
/** @type {typeof __VLS_ctx.canvas} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "corner" }));
(__VLS_ctx.currentLat);
(__VLS_ctx.currentLon);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "stats" }));
(__VLS_ctx.statsText);
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['corner']} */ ;
/** @type {__VLS_StyleScopedClasses['stats']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            canvas: canvas,
            currentLat: currentLat,
            currentLon: currentLon,
            statsText: statsText,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
