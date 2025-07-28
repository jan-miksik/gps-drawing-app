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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useGPS } from './composables/useGPS';
import { useBackgroundGPS } from './composables/useBackgroundGPS';
import { useCanvas } from './composables/useCanvas';
import { useFileOperations } from './composables/useFileOperations';
import { useInteractions } from './composables/useInteractions';
import GPSStatusBar from './components/GPSStatusBar.vue';
import GPSPointsModal from './components/GPSPointsModal.vue';
import { anonymizePoints, createAnonymizationOrigin } from './utils/coordinateUtils';
// State
var showModal = ref(false);
var points = ref([]);
var isAnonymized = ref(true);
var anonymizationOrigin = ref(null);
// Composables
var _a = useGPS(), currentAccuracy = _a.currentAccuracy, gpsSignalQuality = _a.gpsSignalQuality, startGPSTracking = _a.startGPSTracking, stopGPSTracking = _a.stopGPSTracking, shouldAddPoint = _a.shouldAddPoint, processNewPoint = _a.processNewPoint;
var _b = useBackgroundGPS(), isBackgroundGPSActive = _b.isBackgroundGPSActive, initBackgroundGPS = _b.initBackgroundGPS, stopBackgroundGPS = _b.stopBackgroundGPS, removeBackgroundGPSListeners = _b.removeBackgroundGPSListeners;
var _c = useCanvas(), canvasEl = _c.canvasEl, setupCanvas = _c.setupCanvas, drawPath = _c.drawPath, calculateBounds = _c.calculateBounds, pan = _c.pan, zoom = _c.zoom;
var _d = useFileOperations(), loadPointsFromFile = _d.loadPointsFromFile, savePointsToFile = _d.savePointsToFile, exportPoints = _d.exportPoints, clearAllData = _d.clearAllData;
var _e = useInteractions(function (deltaX, deltaY) {
    pan(deltaX, deltaY);
    redrawCanvas();
}, function (deltaY) {
    zoom(deltaY);
    redrawCanvas();
}), handleTouchStart = _e.handleTouchStart, handleTouchMove = _e.handleTouchMove, handleTouchEnd = _e.handleTouchEnd, handleMouseDown = _e.handleMouseDown, handleMouseMove = _e.handleMouseMove, handleMouseUp = _e.handleMouseUp, handleWheel = _e.handleWheel;
// Computed properties
var displayPoints = computed(function () {
    return isAnonymized.value && anonymizationOrigin.value
        ? anonymizePoints(points.value, anonymizationOrigin.value)
        : points.value;
});
var displayBounds = computed(function () {
    return calculateBounds(displayPoints.value);
});
// Methods
var addGPSPoint = function (newPoint) {
    if (!shouldAddPoint(points.value, newPoint)) {
        return;
    }
    var processedPoint = processNewPoint(points.value, newPoint);
    points.value.push(processedPoint);
    // Set anonymization origin if this is the first point
    if (points.value.length === 1 && isAnonymized.value && !anonymizationOrigin.value) {
        anonymizationOrigin.value = createAnonymizationOrigin(points.value);
    }
    savePointsToFile(points.value);
    redrawCanvas();
};
// Background GPS point handler (for offline saves)
var addBackgroundGPSPoint = function (newPoint) { return __awaiter(void 0, void 0, void 0, function () {
    var processedPoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Background GPS point received:', newPoint);
                if (!shouldAddPoint(points.value, newPoint)) {
                    return [2 /*return*/];
                }
                processedPoint = processNewPoint(points.value, newPoint);
                points.value.push(processedPoint);
                // Set anonymization origin if this is the first point
                if (points.value.length === 1 && isAnonymized.value && !anonymizationOrigin.value) {
                    anonymizationOrigin.value = createAnonymizationOrigin(points.value);
                }
                // Save to file (this will handle both foreground and background points)
                return [4 /*yield*/, savePointsToFile([processedPoint], true)];
            case 1:
                // Save to file (this will handle both foreground and background points)
                _a.sent(); // true = append mode
                redrawCanvas();
                return [2 /*return*/];
        }
    });
}); };
var redrawCanvas = function () {
    nextTick(function () {
        drawPath(displayPoints.value, displayBounds.value);
    });
};
var toggleAnonymization = function () {
    isAnonymized.value = !isAnonymized.value;
    // Set origin when first enabling anonymization
    if (isAnonymized.value && !anonymizationOrigin.value) {
        anonymizationOrigin.value = createAnonymizationOrigin(points.value);
    }
    redrawCanvas();
};
var handleExport = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exportPoints(points.value, isAnonymized.value, anonymizationOrigin.value)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var handleClearAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                points.value = [];
                anonymizationOrigin.value = null;
                return [4 /*yield*/, clearAllData()];
            case 1:
                _a.sent();
                redrawCanvas();
                showModal.value = false;
                return [2 /*return*/];
        }
    });
}); };
// Lifecycle
onMounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    var loadedPoints, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                setupCanvas();
                return [4 /*yield*/, loadPointsFromFile()];
            case 1:
                loadedPoints = _a.sent();
                if (loadedPoints.length > 0) {
                    points.value = loadedPoints;
                    if (isAnonymized.value && !anonymizationOrigin.value) {
                        anonymizationOrigin.value = createAnonymizationOrigin(points.value);
                    }
                }
                // Setup canvas resize listener
                window.addEventListener('resize', setupCanvas);
                // Start regular GPS tracking (for immediate UI updates)
                startGPSTracking(addGPSPoint);
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, initBackgroundGPS(addBackgroundGPSPoint)];
            case 3:
                _a.sent();
                console.log('Background GPS initialized successfully');
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error('Failed to initialize background GPS:', error_1);
                return [3 /*break*/, 5];
            case 5:
                // Initial draw
                redrawCanvas();
                return [2 /*return*/];
        }
    });
}); });
onUnmounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Stop regular GPS tracking
                stopGPSTracking();
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, stopBackgroundGPS()];
            case 2:
                _a.sent();
                return [4 /*yield*/, removeBackgroundGPSListeners()];
            case 3:
                _a.sent();
                console.log('Background GPS stopped and cleaned up');
                return [3 /*break*/, 5];
            case 4:
                error_2 = _a.sent();
                console.error('Error stopping background GPS:', error_2);
                return [3 /*break*/, 5];
            case 5:
                window.removeEventListener('resize', setupCanvas);
                return [2 /*return*/];
        }
    });
}); });
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
/** @type {[typeof GPSStatusBar, ]} */ ;
// @ts-ignore
var __VLS_0 = __VLS_asFunctionalComponent(GPSStatusBar, new GPSStatusBar({
    gpsSignalQuality: (__VLS_ctx.gpsSignalQuality),
    currentAccuracy: (__VLS_ctx.currentAccuracy),
}));
var __VLS_1 = __VLS_0.apply(void 0, __spreadArray([{
        gpsSignalQuality: (__VLS_ctx.gpsSignalQuality),
        currentAccuracy: (__VLS_ctx.currentAccuracy),
    }], __VLS_functionalComponentArgsRest(__VLS_0), false));
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
/** @type {[typeof GPSPointsModal, ]} */ ;
// @ts-ignore
var __VLS_3 = __VLS_asFunctionalComponent(GPSPointsModal, new GPSPointsModal(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onToggleAnonymization': {} }), { 'onExport': {} }), { 'onClear': {} }), { show: (__VLS_ctx.showModal), points: (__VLS_ctx.points), displayPoints: (__VLS_ctx.displayPoints), isAnonymized: (__VLS_ctx.isAnonymized), anonymizationOrigin: (__VLS_ctx.anonymizationOrigin), backgroundActive: (__VLS_ctx.isBackgroundGPSActive) })));
var __VLS_4 = __VLS_3.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onToggleAnonymization': {} }), { 'onExport': {} }), { 'onClear': {} }), { show: (__VLS_ctx.showModal), points: (__VLS_ctx.points), displayPoints: (__VLS_ctx.displayPoints), isAnonymized: (__VLS_ctx.isAnonymized), anonymizationOrigin: (__VLS_ctx.anonymizationOrigin), backgroundActive: (__VLS_ctx.isBackgroundGPSActive) })], __VLS_functionalComponentArgsRest(__VLS_3), false));
var __VLS_6;
var __VLS_7;
var __VLS_8;
var __VLS_9 = {
    onClose: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showModal = false;
    }
};
var __VLS_10 = {
    onToggleAnonymization: (__VLS_ctx.toggleAnonymization)
};
var __VLS_11 = {
    onExport: (__VLS_ctx.handleExport)
};
var __VLS_12 = {
    onClear: (__VLS_ctx.handleClearAll)
};
var __VLS_5;
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['gps-points-button']} */ ;
/** @type {__VLS_StyleScopedClasses['gps-points-button-text']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            GPSStatusBar: GPSStatusBar,
            GPSPointsModal: GPSPointsModal,
            showModal: showModal,
            points: points,
            isAnonymized: isAnonymized,
            anonymizationOrigin: anonymizationOrigin,
            currentAccuracy: currentAccuracy,
            gpsSignalQuality: gpsSignalQuality,
            isBackgroundGPSActive: isBackgroundGPSActive,
            canvasEl: canvasEl,
            handleTouchStart: handleTouchStart,
            handleTouchMove: handleTouchMove,
            handleTouchEnd: handleTouchEnd,
            handleMouseDown: handleMouseDown,
            handleMouseMove: handleMouseMove,
            handleMouseUp: handleMouseUp,
            handleWheel: handleWheel,
            displayPoints: displayPoints,
            toggleAnonymization: toggleAnonymization,
            handleExport: handleExport,
            handleClearAll: handleClearAll,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
