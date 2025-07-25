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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
var POINTS_PRECISION = 5;
var canvasEl = ref(null); // Renamed for clarity
var context = ref(null);
var points = ref([]);
var bounds = ref(null);
var watchId = null;
// Modal state
var showModal = ref(false);
// Anonymization state
var isAnonymized = ref(true); // Start anonymized by default
var anonymizationOrigin = ref(null);
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
// GPS accuracy settings and state
var GPS_ACCURACY_THRESHOLD = 20; // meters - reject points with worse accuracy
var GPS_SMOOTHING_WINDOW = 3; // number of points to average for smoothing
var currentAccuracy = ref(null);
var gpsSignalQuality = ref('unknown');
// Padding around the drawing within the canvas
var DRAWING_PADDING = 40; // In logical pixels
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
var FILE_NAME = 'gps_points.json';
// Anonymization functions
var setAnonymizationOrigin = function () {
    if (points.value.length > 0) {
        // Use the first point as the origin for anonymization
        var firstPoint = points.value[0];
        anonymizationOrigin.value = {
            lat: firstPoint.lat,
            lon: firstPoint.lon
        };
    }
};
var anonymizePoint = function (point) {
    if (!anonymizationOrigin.value) {
        setAnonymizationOrigin();
    }
    if (!anonymizationOrigin.value) {
        return point; // Fallback if no origin set
    }
    // Convert to relative coordinates (preserving distances)
    return {
        lat: point.lat - anonymizationOrigin.value.lat,
        lon: point.lon - anonymizationOrigin.value.lon,
        timestamp: point.timestamp // Keep original timestamp
    };
};
var anonymizePoints = function (pointsArray) {
    if (pointsArray.length === 0)
        return pointsArray;
    if (!anonymizationOrigin.value) {
        setAnonymizationOrigin();
    }
    return pointsArray.map(function (point) { return anonymizePoint(point); });
};
// Computed property for display points (either real or anonymized)
var displayPoints = computed(function () {
    return isAnonymized.value ? anonymizePoints(points.value) : points.value;
});
// Computed property for display bounds
var displayBounds = computed(function () {
    if (!bounds.value)
        return null;
    if (!isAnonymized.value)
        return bounds.value;
    // Calculate bounds for anonymized data
    var anonPoints = anonymizePoints(points.value);
    if (anonPoints.length === 0)
        return null;
    if (anonPoints.length === 1) {
        var p = anonPoints[0];
        var delta = 0.0001;
        return {
            minLat: p.lat - delta,
            maxLat: p.lat + delta,
            minLon: p.lon - delta,
            maxLon: p.lon + delta,
        };
    }
    var lats = anonPoints.map(function (p) { return p.lat; });
    var lons = anonPoints.map(function (p) { return p.lon; });
    return {
        minLat: Math.min.apply(Math, lats),
        maxLat: Math.max.apply(Math, lats),
        minLon: Math.min.apply(Math, lons),
        maxLon: Math.max.apply(Math, lons),
    };
});
var toggleAnonymization = function () {
    isAnonymized.value = !isAnonymized.value;
    // Set origin when first enabling anonymization
    if (isAnonymized.value && !anonymizationOrigin.value) {
        setAnonymizationOrigin();
    }
    // Redraw the path with new data
    nextTick(function () {
        drawPath();
    });
};
// GPS accuracy helper functions
// const getSignalQuality = (accuracy: number): 'excellent' | 'good' | 'fair' | 'poor' => {
//   if (accuracy <= 5) return 'excellent';
//   if (accuracy <= 10) return 'good';
//   if (accuracy <= 20) return 'fair';
//   return 'poor';
// };
var smoothGPSPoints = function (newPoint) {
    if (points.value.length < GPS_SMOOTHING_WINDOW) {
        return newPoint;
    }
    // Get the last N points including the new one
    var recentPoints = __spreadArray(__spreadArray([], points.value.slice(-GPS_SMOOTHING_WINDOW + 1), true), [newPoint], false);
    // Calculate moving average
    var avgLat = recentPoints.reduce(function (sum, p) { return sum + p.lat; }, 0) / recentPoints.length;
    var avgLon = recentPoints.reduce(function (sum, p) { return sum + p.lon; }, 0) / recentPoints.length;
    return {
        lat: Math.round(avgLat * Math.pow(10, POINTS_PRECISION)) / Math.pow(10, POINTS_PRECISION),
        lon: Math.round(avgLon * Math.pow(10, POINTS_PRECISION)) / Math.pow(10, POINTS_PRECISION),
        timestamp: newPoint.timestamp
    };
};
var savePointsToFile = function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Filesystem.writeFile({
                        path: FILE_NAME,
                        data: JSON.stringify(points.value),
                        directory: Directory.Data,
                        encoding: Encoding.UTF8,
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_1 = _a.sent();
                console.error('Failed to save GPS points to file', e_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var loadPointsFromFile = function () { return __awaiter(void 0, void 0, void 0, function () {
    var result, dataString, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, Filesystem.readFile({
                        path: FILE_NAME,
                        directory: Directory.Data,
                        encoding: Encoding.UTF8,
                    })];
            case 1:
                result = _a.sent();
                dataString = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
                points.value = JSON.parse(dataString);
                calculateBounds();
                drawPath();
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                console.warn('No saved file found. Starting fresh.', e_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Modal functions
var closeModal = function () {
    showModal.value = false;
};
var formatTime = function (timestamp, index, allPoints) {
    var date = new Date(timestamp);
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // Check if this is the first point or if the date changed from previous point
    var isFirstPoint = index === 0;
    var dateChanged = !isFirstPoint &&
        new Date(allPoints[index - 1].timestamp).toDateString() !== date.toDateString();
    var timeString = date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    // Always show "Today" for today's dates
    if (date.toDateString() === today.toDateString()) {
        return "Today ".concat(timeString);
    }
    // Show date if it's the first point or date changed (for non-today dates)
    if (isFirstPoint || dateChanged) {
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday ".concat(timeString);
        }
        else {
            var dateString = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
            return "".concat(dateString, " ").concat(timeString);
        }
    }
    return timeString;
};
var exportPoints = function () { return __awaiter(void 0, void 0, void 0, function () {
    var currentTime, timestamp, dataToExport, exportData, suffix, fileName, exportType, externalError_1, exportType, error_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 6, , 7]);
                if (points.value.length === 0) {
                    alert('No GPS points to export');
                    return [2 /*return*/];
                }
                currentTime = new Date();
                timestamp = currentTime.toISOString().replace(/[:.]/g, '-').split('T')[0];
                dataToExport = __assign(__assign({ exportDate: currentTime.toISOString(), totalPoints: points.value.length, isAnonymized: isAnonymized.value }, (isAnonymized.value && anonymizationOrigin.value && {
                    anonymizationOrigin: anonymizationOrigin.value,
                    note: "Coordinates are anonymized - showing relative distances from first point"
                })), { points: displayPoints.value.map(function (point, index) { return ({
                        index: index + 1,
                        latitude: point.lat,
                        longitude: point.lon,
                        timestamp: point.timestamp,
                        time: new Date(point.timestamp).toISOString()
                    }); }) });
                exportData = JSON.stringify(dataToExport, null, 2);
                suffix = isAnonymized.value ? '_anonymized' : '';
                fileName = "gps_export".concat(suffix, "_").concat(timestamp, ".json");
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 5]);
                return [4 /*yield*/, Filesystem.writeFile({
                        path: fileName,
                        data: exportData,
                        directory: Directory.ExternalStorage,
                        encoding: Encoding.UTF8,
                    })];
            case 2:
                _c.sent();
                exportType = isAnonymized.value ? 'anonymized' : 'real GPS';
                alert("\u2705 Exported ".concat(points.value.length, " ").concat(exportType, " points to Downloads/").concat(fileName));
                return [3 /*break*/, 5];
            case 3:
                externalError_1 = _c.sent();
                console.warn('External storage failed, trying Documents:', externalError_1);
                // Fallback to Documents directory
                return [4 /*yield*/, Filesystem.writeFile({
                        path: fileName,
                        data: exportData,
                        directory: Directory.Documents,
                        encoding: Encoding.UTF8,
                    })];
            case 4:
                // Fallback to Documents directory
                _c.sent();
                exportType = isAnonymized.value ? 'anonymized' : 'real GPS';
                alert("\u2705 Exported ".concat(points.value.length, " ").concat(exportType, " points to Documents/").concat(fileName));
                return [3 /*break*/, 5];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_1 = _c.sent();
                console.error('Export failed:', error_1);
                // More detailed error messages
                if ((_a = error_1.message) === null || _a === void 0 ? void 0 : _a.includes('permission')) {
                    alert('❌ Export failed: Storage permission denied. Please check app permissions.');
                }
                else if ((_b = error_1.message) === null || _b === void 0 ? void 0 : _b.includes('space')) {
                    alert('❌ Export failed: Not enough storage space.');
                }
                else {
                    alert("\u274C Export failed: ".concat(error_1.message || 'Unknown error', ". Check console for details."));
                }
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
var clearAllPoints = function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!confirm("Are you sure you want to delete all ".concat(points.value.length, " GPS points? This cannot be undone."))) return [3 /*break*/, 5];
                points.value = [];
                bounds.value = null;
                anonymizationOrigin.value = null;
                currentLat.value = 0;
                currentLon.value = 0;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, Filesystem.deleteFile({
                        path: FILE_NAME,
                        directory: Directory.Data,
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_3 = _a.sent();
                console.warn('No file to delete or delete failed:', e_3);
                return [3 /*break*/, 4];
            case 4:
                // Redraw canvas
                drawPath();
                closeModal();
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); };
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
    var currentDisplayPoints = displayPoints.value;
    var currentBounds = displayBounds.value;
    if (currentDisplayPoints.length === 0 || !currentBounds) {
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
    if (currentDisplayPoints.length >= 1 && currentBounds) { // Need at least one point to draw a dot
        ctx.beginPath();
        for (var i = 0; i < currentDisplayPoints.length; i++) {
            var _a = project(currentDisplayPoints[i], currentBounds, logicalWidth, logicalHeight), x = _a.x, y = _a.y;
            if (i === 0) {
                ctx.moveTo(x, y);
            }
            else {
                ctx.lineTo(x, y);
            }
        }
        if (currentDisplayPoints.length > 1) { // Only stroke if there's a path
            ctx.strokeStyle = 'white';
            // Adjust line width based on current view scale, so it appears consistent
            ctx.lineWidth = 2 / (scale.value * dpr); // More refined line width adjustment
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
        // Draw current position as a dot (even if it's the only point)
        var lastPoint = currentDisplayPoints[currentDisplayPoints.length - 1];
        var _b = project(lastPoint, currentBounds, logicalWidth, logicalHeight), lastX = _b.x, lastY = _b.y;
        ctx.fillStyle = 'white';
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
    var accuracy = position.coords.accuracy || 999;
    currentAccuracy.value = accuracy;
    // gpsSignalQuality.value = getSignalQuality(accuracy);
    // Log GPS metadata for debugging
    console.log('GPS Position:', {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: accuracy,
        speed: position.coords.speed || 'unknown',
        heading: position.coords.heading || 'unknown',
        quality: gpsSignalQuality.value
    });
    // Filter out low-accuracy points
    if (accuracy > GPS_ACCURACY_THRESHOLD) {
        console.warn("Skipping low-accuracy GPS point: ".concat(accuracy.toFixed(1), "m (threshold: ").concat(GPS_ACCURACY_THRESHOLD, "m)"));
        return;
    }
    // Round coordinates to specified precision to save storage space
    var lat = Math.round(position.coords.latitude * Math.pow(10, POINTS_PRECISION)) / Math.pow(10, POINTS_PRECISION);
    var lon = Math.round(position.coords.longitude * Math.pow(10, POINTS_PRECISION)) / Math.pow(10, POINTS_PRECISION);
    var timestamp = Date.now();
    currentLat.value = lat;
    currentLon.value = lon;
    // Create new point and apply smoothing
    var newPoint = { lat: lat, lon: lon, timestamp: timestamp };
    var smoothedPoint = smoothGPSPoints(newPoint);
    points.value.push(smoothedPoint);
    calculateBounds(); // Recalculate bounds with the new point
    // Set anonymization origin if this is the first point and anonymization is enabled
    if (points.value.length === 1 && isAnonymized.value && !anonymizationOrigin.value) {
        setAnonymizationOrigin();
    }
    savePointsToFile(); // ✅ Save locally
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
    var permissionStatus, requestStatus, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                setupCanvas(); // Initial setup
                return [4 /*yield*/, loadPointsFromFile()];
            case 1:
                _a.sent(); // ✅ Load existing points
                // Optional: Add resize listener if you want to re-setup canvas on window resize
                window.addEventListener('resize', setupCanvas);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 7, , 8]);
                return [4 /*yield*/, Geolocation.checkPermissions()];
            case 3:
                permissionStatus = _a.sent();
                if (!(permissionStatus.location !== 'granted' && permissionStatus.coarseLocation !== 'granted')) return [3 /*break*/, 5];
                return [4 /*yield*/, Geolocation.requestPermissions()];
            case 4:
                requestStatus = _a.sent();
                if (requestStatus.location !== 'granted' && requestStatus.coarseLocation !== 'granted') {
                    console.error('Location permission denied.');
                    // Optionally, display a message to the user
                    return [2 /*return*/];
                }
                _a.label = 5;
            case 5: return [4 /*yield*/, Geolocation.watchPosition({
                    enableHighAccuracy: true,
                    timeout: 15000, // Increased timeout to allow more time for precise fix
                    maximumAge: 1000 // Use fresher data (reduced from 3000ms)
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
            case 6:
                watchId = _a.sent();
                return [3 /*break*/, 8];
            case 7:
                error_2 = _a.sent();
                console.error('Failed to start GPS tracking:', error_2.message || error_2);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "accuracy-status" }, { class: ("signal-".concat(__VLS_ctx.gpsSignalQuality)) }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "accuracy-status-text" }));
if (__VLS_ctx.currentAccuracy !== null) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "accuracy-value" }));
    (__VLS_ctx.currentAccuracy.toFixed(0));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showModal = true;
    } }, { class: "gps-points-button" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "gps-points-button-text" }));
(__VLS_ctx.points.length);
if (__VLS_ctx.showModal) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ onClick: (__VLS_ctx.closeModal) }, { class: "modal-overlay" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ onClick: function () { } }, { class: "modal-content" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "modal-header" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-left" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    (__VLS_ctx.points.length);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)(__assign({ class: "toggle-label" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.input)(__assign(__assign({ onChange: (__VLS_ctx.toggleAnonymization) }, { type: "checkbox", checked: (!__VLS_ctx.isAnonymized) }), { class: "toggle-checkbox" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "toggle-text" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: (__VLS_ctx.closeModal) }, { class: "close-button" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "modal-body" }));
    if (__VLS_ctx.points.length === 0) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "no-points" }));
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "points-list" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "list-header" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item index" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item lat" }));
        (__VLS_ctx.isAnonymized ? 'Rel. Lat' : 'Latitude');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item lon" }));
        (__VLS_ctx.isAnonymized ? 'Rel. Lon' : 'Longitude');
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "header-item time" }));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "list-body" }));
        for (var _i = 0, _a = __VLS_getVForSourceType((__spreadArray([], __VLS_ctx.displayPoints, true).reverse())); _i < _a.length; _i++) {
            var _b = _a[_i], point = _b[0], index = _b[1];
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign(__assign({ key: ("".concat(point.lat, "-").concat(point.lon, "-").concat(point.timestamp)) }, { class: "point-row" }), { class: ({ 'current-point': index === 0 }) }));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item index" }));
            (__VLS_ctx.points.length - index);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item lat" }));
            (point.lat.toFixed(__VLS_ctx.POINTS_PRECISION));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item lon" }));
            (point.lon.toFixed(__VLS_ctx.POINTS_PRECISION));
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "row-item time" }));
            (__VLS_ctx.formatTime(point.timestamp, __VLS_ctx.displayPoints.length - 1 - index, __VLS_ctx.displayPoints));
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "modal-footer" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "footer-left" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: (__VLS_ctx.exportPoints) }, { class: "export-button" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ onClick: (__VLS_ctx.clearAllPoints) }, { class: "clear-button-1" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "footer-right" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign({ onClick: (__VLS_ctx.closeModal) }, { class: "close-button-footer" }));
}
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy-status']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy-status-text']} */ ;
/** @type {__VLS_StyleScopedClasses['accuracy-value']} */ ;
/** @type {__VLS_StyleScopedClasses['gps-points-button']} */ ;
/** @type {__VLS_StyleScopedClasses['gps-points-button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-overlay']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-label']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-checkbox']} */ ;
/** @type {__VLS_StyleScopedClasses['toggle-text']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-body']} */ ;
/** @type {__VLS_StyleScopedClasses['no-points']} */ ;
/** @type {__VLS_StyleScopedClasses['points-list']} */ ;
/** @type {__VLS_StyleScopedClasses['list-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['index']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['lat']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['lon']} */ ;
/** @type {__VLS_StyleScopedClasses['header-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['list-body']} */ ;
/** @type {__VLS_StyleScopedClasses['point-row']} */ ;
/** @type {__VLS_StyleScopedClasses['current-point']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['index']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['lat']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['lon']} */ ;
/** @type {__VLS_StyleScopedClasses['row-item']} */ ;
/** @type {__VLS_StyleScopedClasses['time']} */ ;
/** @type {__VLS_StyleScopedClasses['modal-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-left']} */ ;
/** @type {__VLS_StyleScopedClasses['export-button']} */ ;
/** @type {__VLS_StyleScopedClasses['clear-button-1']} */ ;
/** @type {__VLS_StyleScopedClasses['footer-right']} */ ;
/** @type {__VLS_StyleScopedClasses['close-button-footer']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            POINTS_PRECISION: POINTS_PRECISION,
            canvasEl: canvasEl,
            points: points,
            showModal: showModal,
            isAnonymized: isAnonymized,
            currentAccuracy: currentAccuracy,
            gpsSignalQuality: gpsSignalQuality,
            displayPoints: displayPoints,
            toggleAnonymization: toggleAnonymization,
            closeModal: closeModal,
            formatTime: formatTime,
            exportPoints: exportPoints,
            clearAllPoints: clearAllPoints,
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
