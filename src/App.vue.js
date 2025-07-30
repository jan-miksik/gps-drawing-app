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
import { useDevLogs } from './composables/useDevLogs';
// import GPSStatusBar from './components/GPSStatusBar.vue';
import GPSPointsModal from './components/GPSPointsModal.vue';
import ExportModal from './components/ExportModal.vue';
import DevLogsModal from './components/DevLogsModal.vue';
import { anonymizePoints, createAnonymizationOrigin } from './utils/coordinateUtils';
import { getSignalQuality } from './utils/gpsUtils';
// State
var showModal = ref(false);
var showExportModal = ref(false);
var points = ref([]);
var isAnonymized = ref(true);
var anonymizationOrigin = ref(null);
// Composables
var _a = useGPS(), currentAccuracy = _a.currentAccuracy, gpsSignalQuality = _a.gpsSignalQuality, startGPSTracking = _a.startGPSTracking, stopGPSTracking = _a.stopGPSTracking, shouldAddPoint = _a.shouldAddPoint, processNewPoint = _a.processNewPoint;
var _b = useBackgroundGPS(), isBackgroundGPSActive = _b.isBackgroundGPSActive, initBackgroundGPS = _b.initBackgroundGPS, stopBackgroundGPS = _b.stopBackgroundGPS, removeBackgroundGPSListeners = _b.removeBackgroundGPSListeners;
var _c = useCanvas(), canvasEl = _c.canvasEl, setupCanvas = _c.setupCanvas, drawPath = _c.drawPath, calculateBounds = _c.calculateBounds, pan = _c.pan, zoom = _c.zoom, resetView = _c.resetView, scale = _c.scale, viewOffsetX = _c.viewOffsetX, viewOffsetY = _c.viewOffsetY;
var _d = useFileOperations(), loadPointsFromFile = _d.loadPointsFromFile, savePointsToFile = _d.savePointsToFile, exportPoints = _d.exportPoints, exportCanvasAsImage = _d.exportCanvasAsImage, clearAllData = _d.clearAllData;
var _e = useDevLogs(), logs = _e.logs, isDevLogsVisible = _e.isDevLogsVisible, logInfo = _e.logInfo, logWarn = _e.logWarn, logError = _e.logError, clearLogs = _e.clearLogs, hideDevLogs = _e.hideDevLogs, formatLogTime = _e.formatLogTime;
var _f = useInteractions(function (deltaX, deltaY) {
    pan(deltaX, deltaY);
    redrawCanvas();
}, function (deltaY) {
    zoom(deltaY);
    redrawCanvas();
}, function () {
    resetView();
    redrawCanvas();
}), handleTouchStart = _f.handleTouchStart, handleTouchMove = _f.handleTouchMove, handleTouchEnd = _f.handleTouchEnd, handleMouseDown = _f.handleMouseDown, handleMouseMove = _f.handleMouseMove, handleMouseUp = _f.handleMouseUp, handleWheel = _f.handleWheel;
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
        logInfo('GPS point filtered out', {
            reason: 'distance/time threshold',
            point: newPoint
        });
        return;
    }
    // const processedPoint = processNewPoint(points.value, newPoint);
    points.value.push(newPoint);
    logInfo('Foreground GPS point added', newPoint);
    // Set anonymization origin if this is the first point
    if (points.value.length === 1 && isAnonymized.value && !anonymizationOrigin.value) {
        anonymizationOrigin.value = createAnonymizationOrigin(points.value);
    }
    savePointsToFile(points.value);
    redrawCanvas();
};
// Background GPS accuracy handler (updates display for every GPS reading)
var updateCurrentAccuracy = function (accuracy) {
    currentAccuracy.value = accuracy;
    gpsSignalQuality.value = getSignalQuality(accuracy);
};
// Background GPS point handler
var addBackgroundGPSPoint = function (newPoint) { return __awaiter(void 0, void 0, void 0, function () {
    var processedPoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logInfo('Background GPS point received', newPoint);
                if (!shouldAddPoint(points.value, newPoint)) {
                    return [2 /*return*/];
                }
                processedPoint = processNewPoint(newPoint);
                logInfo('Background GPS point processedPoint', processedPoint);
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
var handleDirectExport = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!canvasEl.value) {
                    logError('Canvas element not available for image export');
                    return [2 /*return*/];
                }
                return [4 /*yield*/, exportCanvasAsImage(canvasEl.value, points.value, isAnonymized.value, anonymizationOrigin.value)];
            case 1:
                _a.sent();
                logInfo('Drawing exported as SVG successfully');
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                logError('Failed to export drawing as SVG', error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var handleExportImage = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!canvasEl.value) {
                    logError('Canvas element not available for image export');
                    return [2 /*return*/];
                }
                return [4 /*yield*/, exportCanvasAsImage(canvasEl.value, points.value, isAnonymized.value, anonymizationOrigin.value)];
            case 1:
                _a.sent();
                showExportModal.value = false;
                logInfo('Drawing exported as SVG successfully');
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                logError('Failed to export drawing as SVG', error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var handleExportData = function (coordinateType) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, exportPoints(points.value, coordinateType, anonymizationOrigin.value)];
            case 1:
                _a.sent();
                showExportModal.value = false;
                logInfo('GPS points exported successfully', {
                    count: points.value.length,
                    coordinateType: coordinateType
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                logError('Failed to export GPS points', error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var handleClearAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    var pointCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pointCount = points.value.length;
                points.value = [];
                anonymizationOrigin.value = null;
                return [4 /*yield*/, clearAllData()];
            case 1:
                _a.sent();
                redrawCanvas();
                showModal.value = false;
                logInfo('All GPS points cleared', { clearedCount: pointCount });
                return [2 /*return*/];
        }
    });
}); };
var handleResetZoom = function () {
    resetView();
    redrawCanvas();
    logInfo('Zoom and view reset to default');
};
// Lifecycle
onMounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    var loadedPoints, error_4, fallbackError_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logInfo('App starting up');
                setupCanvas();
                return [4 /*yield*/, loadPointsFromFile()];
            case 1:
                loadedPoints = _a.sent();
                if (loadedPoints.length > 0) {
                    points.value = loadedPoints;
                    logInfo('Loaded existing GPS points', { count: loadedPoints.length });
                    if (isAnonymized.value && !anonymizationOrigin.value) {
                        anonymizationOrigin.value = createAnonymizationOrigin(points.value);
                    }
                }
                else {
                    logInfo('No existing GPS points found');
                }
                // Setup canvas resize listener
                window.addEventListener('resize', setupCanvas);
                logInfo('Canvas setup completed');
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 9]);
                return [4 /*yield*/, initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy)];
            case 3:
                _a.sent();
                logInfo('Background GPS initialized successfully');
                return [3 /*break*/, 9];
            case 4:
                error_4 = _a.sent();
                logError('Failed to initialize background GPS', error_4);
                // Fallback to regular GPS if background GPS fails
                logWarn('Falling back to regular GPS tracking');
                _a.label = 5;
            case 5:
                _a.trys.push([5, 7, , 8]);
                return [4 /*yield*/, startGPSTracking(addGPSPoint)];
            case 6:
                _a.sent();
                logInfo('Foreground GPS tracking started');
                return [3 /*break*/, 8];
            case 7:
                fallbackError_1 = _a.sent();
                logError('Failed to start foreground GPS', fallbackError_1);
                return [3 /*break*/, 8];
            case 8: return [3 /*break*/, 9];
            case 9:
                // Initial draw
                redrawCanvas();
                logInfo('App initialization completed');
                return [2 /*return*/];
        }
    });
}); });
onUnmounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Stop GPS tracking
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
                error_5 = _a.sent();
                console.error('Error stopping background GPS:', error_5);
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showModal = true;
    } }, { class: "gps-points-button" }), { title: "Click: Open GPS Points" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "gps-points-button-text" }));
(__VLS_ctx.points.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleDirectExport) }, { class: "export-button-main" }), { title: "Export drawing as image" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "export-button-text" }));
if (__VLS_ctx.scale !== 1 || __VLS_ctx.viewOffsetX !== 0 || __VLS_ctx.viewOffsetY !== 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleResetZoom) }, { class: "reset-zoom-button" }), { title: "Reset zoom and center" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "reset-zoom-icon" }));
}
/** @type {[typeof GPSPointsModal, ]} */ ;
// @ts-ignore
var __VLS_0 = __VLS_asFunctionalComponent(GPSPointsModal, new GPSPointsModal(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onToggleAnonymization': {} }), { 'onExport': {} }), { 'onClear': {} }), { show: (__VLS_ctx.showModal), points: (__VLS_ctx.points), displayPoints: (__VLS_ctx.displayPoints), isAnonymized: (__VLS_ctx.isAnonymized), anonymizationOrigin: (__VLS_ctx.anonymizationOrigin), backgroundActive: (__VLS_ctx.isBackgroundGPSActive), currentAccuracy: (__VLS_ctx.currentAccuracy) })));
var __VLS_1 = __VLS_0.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onToggleAnonymization': {} }), { 'onExport': {} }), { 'onClear': {} }), { show: (__VLS_ctx.showModal), points: (__VLS_ctx.points), displayPoints: (__VLS_ctx.displayPoints), isAnonymized: (__VLS_ctx.isAnonymized), anonymizationOrigin: (__VLS_ctx.anonymizationOrigin), backgroundActive: (__VLS_ctx.isBackgroundGPSActive), currentAccuracy: (__VLS_ctx.currentAccuracy) })], __VLS_functionalComponentArgsRest(__VLS_0), false));
var __VLS_3;
var __VLS_4;
var __VLS_5;
var __VLS_6 = {
    onClose: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showModal = false;
    }
};
var __VLS_7 = {
    onToggleAnonymization: (__VLS_ctx.toggleAnonymization)
};
var __VLS_8 = {
    onExport: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showExportModal = true;
    }
};
var __VLS_9 = {
    onClear: (__VLS_ctx.handleClearAll)
};
var __VLS_2;
/** @type {[typeof ExportModal, ]} */ ;
// @ts-ignore
var __VLS_10 = __VLS_asFunctionalComponent(ExportModal, new ExportModal(__assign(__assign(__assign({ 'onClose': {} }, { 'onExportImage': {} }), { 'onExportData': {} }), { show: (__VLS_ctx.showExportModal), points: (__VLS_ctx.points) })));
var __VLS_11 = __VLS_10.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClose': {} }, { 'onExportImage': {} }), { 'onExportData': {} }), { show: (__VLS_ctx.showExportModal), points: (__VLS_ctx.points) })], __VLS_functionalComponentArgsRest(__VLS_10), false));
var __VLS_13;
var __VLS_14;
var __VLS_15;
var __VLS_16 = {
    onClose: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showExportModal = false;
    }
};
var __VLS_17 = {
    onExportImage: (__VLS_ctx.handleExportImage)
};
var __VLS_18 = {
    onExportData: (__VLS_ctx.handleExportData)
};
var __VLS_12;
/** @type {[typeof DevLogsModal, ]} */ ;
// @ts-ignore
var __VLS_19 = __VLS_asFunctionalComponent(DevLogsModal, new DevLogsModal(__assign(__assign({ 'onClose': {} }, { 'onClear': {} }), { show: (__VLS_ctx.isDevLogsVisible), logs: (__VLS_ctx.logs), formatLogTime: (__VLS_ctx.formatLogTime) })));
var __VLS_20 = __VLS_19.apply(void 0, __spreadArray([__assign(__assign({ 'onClose': {} }, { 'onClear': {} }), { show: (__VLS_ctx.isDevLogsVisible), logs: (__VLS_ctx.logs), formatLogTime: (__VLS_ctx.formatLogTime) })], __VLS_functionalComponentArgsRest(__VLS_19), false));
var __VLS_22;
var __VLS_23;
var __VLS_24;
var __VLS_25 = {
    onClose: (__VLS_ctx.hideDevLogs)
};
var __VLS_26 = {
    onClear: (__VLS_ctx.clearLogs)
};
var __VLS_21;
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['gps-points-button']} */ ;
/** @type {__VLS_StyleScopedClasses['gps-points-button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['export-button-main']} */ ;
/** @type {__VLS_StyleScopedClasses['export-button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-zoom-button']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-zoom-icon']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            GPSPointsModal: GPSPointsModal,
            ExportModal: ExportModal,
            DevLogsModal: DevLogsModal,
            showModal: showModal,
            showExportModal: showExportModal,
            points: points,
            isAnonymized: isAnonymized,
            anonymizationOrigin: anonymizationOrigin,
            currentAccuracy: currentAccuracy,
            isBackgroundGPSActive: isBackgroundGPSActive,
            canvasEl: canvasEl,
            scale: scale,
            viewOffsetX: viewOffsetX,
            viewOffsetY: viewOffsetY,
            logs: logs,
            isDevLogsVisible: isDevLogsVisible,
            clearLogs: clearLogs,
            hideDevLogs: hideDevLogs,
            formatLogTime: formatLogTime,
            handleTouchStart: handleTouchStart,
            handleTouchMove: handleTouchMove,
            handleTouchEnd: handleTouchEnd,
            handleMouseDown: handleMouseDown,
            handleMouseMove: handleMouseMove,
            handleMouseUp: handleMouseUp,
            handleWheel: handleWheel,
            displayPoints: displayPoints,
            toggleAnonymization: toggleAnonymization,
            handleDirectExport: handleDirectExport,
            handleExportImage: handleExportImage,
            handleExportData: handleExportData,
            handleClearAll: handleClearAll,
            handleResetZoom: handleResetZoom,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
