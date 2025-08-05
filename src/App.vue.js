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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { Capacitor } from '@capacitor/core';
import { useGPS } from './composables/useGPS';
import { useBackgroundGPS } from './composables/useBackgroundGPS';
import { useCanvas } from './composables/useCanvas';
import { useFileOperations } from './composables/useFileOperations';
import { useInteractions } from './composables/useInteractions';
import { useDevLogs, IS_DEV_MODE } from './composables/useDevLogs';
import { usePermissions } from './composables/usePermissions';
import { useNotificationPermission } from './composables/useNotificationPermission';
import { useExportOperations } from './composables/useExportOperations';
import { useSettingsManagement } from './composables/useSettingsManagement';
import { GPS_CONFIG, CANVAS_CONFIG } from './constants/gpsConstants';
import GPSPointsModal from './components/GPSPointsModal.vue';
import ExportModal from './components/ExportModal.vue';
import DevLogsModal from './components/DevLogsModal.vue';
import PermissionModal from './components/PermissionModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import { anonymizePoints, createAnonymizationOrigin } from './utils/coordinateUtils';
import { clearSmoothingBuffer } from './utils/gpsUtils';
// import resetZoomIcon from './assets/reset-zoom.svg';
import BaseButton from './components/BaseButton.vue';
// State
var showGPSPointsModal = ref(false);
var showExportModal = ref(false);
var showSettingsModal = ref(false);
var points = ref([]);
// Settings state (already declared above)
var isAnonymized = ref(true);
var anonymizationOrigin = ref(null);
// Settings state - use computed to sync with actual configs
var settings = computed(function () { return ({
    ACCURACY_THRESHOLD: GPS_CONFIG.value.ACCURACY_THRESHOLD,
    DISTANCE_THRESHOLD: GPS_CONFIG.value.DISTANCE_THRESHOLD,
    MIN_TIME_INTERVAL: GPS_CONFIG.value.MIN_TIME_INTERVAL / 1000, // Convert to seconds for UI
    SMOOTHING_WINDOW: GPS_CONFIG.value.SMOOTHING_WINDOW,
    PINCH_ZOOM_SENSITIVITY: CANVAS_CONFIG.value.PINCH_ZOOM_SENSITIVITY,
    MIN_SCALE: CANVAS_CONFIG.value.MIN_SCALE,
    MAX_SCALE: CANVAS_CONFIG.value.MAX_SCALE,
    LINE_WIDTH: CANVAS_CONFIG.value.LINE_WIDTH,
}); });
var _a = useGPS(), currentAccuracy = _a.currentAccuracy, shouldAddPoint = _a.shouldAddPoint, processNewPoint = _a.processNewPoint;
var initBackgroundGPS = useBackgroundGPS().initBackgroundGPS;
var _b = useCanvas(), canvasEl = _b.canvasEl, setupCanvas = _b.setupCanvas, drawPath = _b.drawPath, calculateBounds = _b.calculateBounds, pan = _b.pan, zoom = _b.zoom, resetView = _b.resetView, scale = _b.scale, viewOffsetX = _b.viewOffsetX, viewOffsetY = _b.viewOffsetY;
var _c = useFileOperations(), loadPointsFromFile = _c.loadPointsFromFile, savePointsToFile = _c.savePointsToFile, clearAllData = _c.clearAllData;
var _d = useDevLogs(), logs = _d.logs, isDevLogsVisible = _d.isDevLogsVisible, logInfo = _d.logInfo, logError = _d.logError, clearLogs = _d.clearLogs, hideDevLogs = _d.hideDevLogs, formatLogTime = _d.formatLogTime;
var _e = useExportOperations(canvasEl, points, isAnonymized, anonymizationOrigin, showExportModal), handleDirectExport = _e.handleDirectExport, handleExportImage = _e.handleExportImage, handleExportData = _e.handleExportData;
var _f = usePermissions(), locationPermission = _f.locationPermission, checkHasLocationPermission = _f.checkHasLocationPermission, requestLocationPermission = _f.requestLocationPermission, handleOpenAppSettings = _f.handleOpenAppSettings;
var _g = useNotificationPermission(), notificationPermission = _g.notificationPermission, checkNotificationPermission = _g.checkNotificationPermission, requestNotificationPermission = _g.requestNotificationPermission, isRequestingNotificationPermission = _g.isRequestingNotificationPermission;
var _h = useInteractions(function (deltaX, deltaY) {
    pan(deltaX, deltaY);
    redrawCanvas();
}, function (deltaY) {
    zoom(deltaY);
    redrawCanvas();
}, function () {
    redrawCanvas();
}), handleTouchStart = _h.handleTouchStart, handleTouchMove = _h.handleTouchMove, handleTouchEnd = _h.handleTouchEnd, handleMouseDown = _h.handleMouseDown, handleMouseMove = _h.handleMouseMove, handleMouseUp = _h.handleMouseUp, handleWheel = _h.handleWheel;
// Computed properties
var displayPoints = computed(function () {
    return isAnonymized.value && anonymizationOrigin.value
        ? anonymizePoints(points.value, anonymizationOrigin.value)
        : points.value;
});
var displayBounds = computed(function () {
    return calculateBounds(displayPoints.value);
});
// Background GPS accuracy handler (updates display for every GPS reading)
var updateCurrentAccuracy = function (accuracy) {
    currentAccuracy.value = accuracy;
};
// Works for both foreground and background GPS points
var addGPSPoint = function (newPoint) { return __awaiter(void 0, void 0, void 0, function () {
    var processedPoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!shouldAddPoint(points.value, newPoint)) {
                    return [2 /*return*/];
                }
                processedPoint = processNewPoint(newPoint);
                logInfo('Background GPS point to add', processedPoint);
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
var handleSettingsSave = useSettingsManagement(settings, redrawCanvas).handleSettingsSave;
var toggleAnonymization = function () {
    isAnonymized.value = !isAnonymized.value;
    // Set origin when first enabling anonymization
    if (isAnonymized.value && !anonymizationOrigin.value) {
        anonymizationOrigin.value = createAnonymizationOrigin(points.value);
    }
    redrawCanvas();
};
var handleClearAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    var pointCount;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pointCount = points.value.length;
                points.value = [];
                anonymizationOrigin.value = null;
                clearSmoothingBuffer(); // Clear smoothing buffer for new drawing
                return [4 /*yield*/, clearAllData()];
            case 1:
                _a.sent();
                redrawCanvas();
                showGPSPointsModal.value = false;
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
    var loadedPoints;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logInfo('App starting up');
                return [4 /*yield*/, Promise.all([
                        checkNotificationPermission(),
                        checkHasLocationPermission()
                    ])];
            case 1:
                _a.sent();
                setupCanvas();
                return [4 /*yield*/, loadPointsFromFile()];
            case 2:
                loadedPoints = _a.sent();
                if (loadedPoints.length > 0) {
                    points.value = loadedPoints;
                    if (isAnonymized.value && !anonymizationOrigin.value) {
                        anonymizationOrigin.value = createAnonymizationOrigin(points.value);
                    }
                }
                // Setup canvas resize listener only on desktop
                if (!Capacitor.isNativePlatform()) {
                    window.addEventListener('resize', setupCanvas);
                }
                // Initial draw
                redrawCanvas();
                logInfo('App initialization completed');
                return [2 /*return*/];
        }
    });
}); });
watch([locationPermission, notificationPermission], function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var error_1;
    var locationPermission = _b[0], notificationPermission = _b[1];
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (locationPermission === 'prompt' || notificationPermission === 'prompt')
                    return [2 /*return*/];
                if (!(locationPermission === 'granted')) return [3 /*break*/, 4];
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 4]);
                return [4 /*yield*/, initBackgroundGPS(addGPSPoint, updateCurrentAccuracy)];
            case 2:
                _c.sent();
                logInfo('Background GPS tracking started for long-term drawing');
                return [3 /*break*/, 4];
            case 3:
                error_1 = _c.sent();
                logError('Failed to start GPS tracking', error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); }, {
    immediate: true,
});
onUnmounted(function () {
    // Remove window resize listener (only if it was added on desktop)
    if (!Capacitor.isNativePlatform()) {
        window.removeEventListener('resize', setupCanvas);
    }
    // Note: Capacitor handles GPS cleanup automatically when app terminates
});
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
if (__VLS_ctx.IS_DEV_MODE) {
    /** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
    // @ts-ignore
    var __VLS_0 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { variant: "circular", position: "top-left", title: "Open Dev Logs" })));
    var __VLS_1 = __VLS_0.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "circular", position: "top-left", title: "Open Dev Logs" })], __VLS_functionalComponentArgsRest(__VLS_0), false));
    var __VLS_3 = void 0;
    var __VLS_4 = void 0;
    var __VLS_5 = void 0;
    var __VLS_6 = {
        onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(__VLS_ctx.IS_DEV_MODE))
                return;
            __VLS_ctx.isDevLogsVisible = true;
        }
    };
    __VLS_2.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "dev-logs-icon" }));
    var __VLS_2;
}
/** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
// @ts-ignore
var __VLS_7 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { variant: "primary", position: "bottom-right", title: "Click: Open GPS Points" })));
var __VLS_8 = __VLS_7.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "primary", position: "bottom-right", title: "Click: Open GPS Points" })], __VLS_functionalComponentArgsRest(__VLS_7), false));
var __VLS_10;
var __VLS_11;
var __VLS_12;
var __VLS_13 = {
    onClick: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showGPSPointsModal = true;
    }
};
__VLS_9.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "gps-points-button-text" }));
(__VLS_ctx.points.length);
var __VLS_9;
/** @type {[typeof BaseButton, typeof BaseButton, ]} */ ;
// @ts-ignore
var __VLS_14 = __VLS_asFunctionalComponent(BaseButton, new BaseButton(__assign({ 'onClick': {} }, { variant: "primary", position: "bottom-left", title: "Export drawing as image" })));
var __VLS_15 = __VLS_14.apply(void 0, __spreadArray([__assign({ 'onClick': {} }, { variant: "primary", position: "bottom-left", title: "Export drawing as image" })], __VLS_functionalComponentArgsRest(__VLS_14), false));
var __VLS_17;
var __VLS_18;
var __VLS_19;
var __VLS_20 = {
    onClick: (__VLS_ctx.handleDirectExport)
};
__VLS_16.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "export-button-text" }));
var __VLS_16;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign({ onClick: (__VLS_ctx.handleResetZoom) }, { class: "reset-zoom-button" }), { title: "Reset zoom and center" }));
__VLS_asFunctionalDirective(__VLS_directives.vShow)(null, __assign(__assign({}, __VLS_directiveBindingRestFields), { value: (__VLS_ctx.scale !== __VLS_ctx.CANVAS_CONFIG.DEFAULT_SCALE || __VLS_ctx.viewOffsetX !== 0 || __VLS_ctx.viewOffsetY !== 0) }), null, null);
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)(__assign({ class: "reset-zoom-icon" }));
__VLS_asFunctionalElement(__VLS_intrinsicElements.img)(__assign({ src: "/reset-zoom.svg", alt: "Reset zoom" }, { class: "reset-zoom-icon-image" }));
/** @type {[typeof PermissionModal, ]} */ ;
// @ts-ignore
var __VLS_21 = __VLS_asFunctionalComponent(PermissionModal, new PermissionModal(__assign(__assign(__assign({ 'onRequestLocationPermission': {} }, { 'onOpenSettings': {} }), { 'onRequestNotificationPermission': {} }), { locationPermission: (__VLS_ctx.locationPermission), notificationPermission: (__VLS_ctx.notificationPermission), isRequesting: (__VLS_ctx.isRequestingNotificationPermission) })));
var __VLS_22 = __VLS_21.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onRequestLocationPermission': {} }, { 'onOpenSettings': {} }), { 'onRequestNotificationPermission': {} }), { locationPermission: (__VLS_ctx.locationPermission), notificationPermission: (__VLS_ctx.notificationPermission), isRequesting: (__VLS_ctx.isRequestingNotificationPermission) })], __VLS_functionalComponentArgsRest(__VLS_21), false));
var __VLS_24;
var __VLS_25;
var __VLS_26;
var __VLS_27 = {
    onRequestLocationPermission: (__VLS_ctx.requestLocationPermission)
};
var __VLS_28 = {
    onOpenSettings: (__VLS_ctx.handleOpenAppSettings)
};
var __VLS_29 = {
    onRequestNotificationPermission: (__VLS_ctx.requestNotificationPermission)
};
var __VLS_23;
/** @type {[typeof GPSPointsModal, ]} */ ;
// @ts-ignore
var __VLS_30 = __VLS_asFunctionalComponent(GPSPointsModal, new GPSPointsModal(__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onToggleAnonymization': {} }), { 'onExport': {} }), { 'onClear': {} }), { 'onSettingsSave': {} }), { show: (__VLS_ctx.showGPSPointsModal), points: (__VLS_ctx.points), displayPoints: (__VLS_ctx.displayPoints), isAnonymized: (__VLS_ctx.isAnonymized), anonymizationOrigin: (__VLS_ctx.anonymizationOrigin), currentAccuracy: (__VLS_ctx.currentAccuracy), settings: (__VLS_ctx.settings) })));
var __VLS_31 = __VLS_30.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onToggleAnonymization': {} }), { 'onExport': {} }), { 'onClear': {} }), { 'onSettingsSave': {} }), { show: (__VLS_ctx.showGPSPointsModal), points: (__VLS_ctx.points), displayPoints: (__VLS_ctx.displayPoints), isAnonymized: (__VLS_ctx.isAnonymized), anonymizationOrigin: (__VLS_ctx.anonymizationOrigin), currentAccuracy: (__VLS_ctx.currentAccuracy), settings: (__VLS_ctx.settings) })], __VLS_functionalComponentArgsRest(__VLS_30), false));
var __VLS_33;
var __VLS_34;
var __VLS_35;
var __VLS_36 = {
    onClose: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showGPSPointsModal = false;
    }
};
var __VLS_37 = {
    onToggleAnonymization: (__VLS_ctx.toggleAnonymization)
};
var __VLS_38 = {
    onExport: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showExportModal = true;
    }
};
var __VLS_39 = {
    onClear: (__VLS_ctx.handleClearAll)
};
var __VLS_40 = {
    onSettingsSave: (__VLS_ctx.handleSettingsSave)
};
var __VLS_32;
/** @type {[typeof ExportModal, ]} */ ;
// @ts-ignore
var __VLS_41 = __VLS_asFunctionalComponent(ExportModal, new ExportModal(__assign(__assign(__assign({ 'onClose': {} }, { 'onExportImage': {} }), { 'onExportData': {} }), { show: (__VLS_ctx.showExportModal), points: (__VLS_ctx.points) })));
var __VLS_42 = __VLS_41.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClose': {} }, { 'onExportImage': {} }), { 'onExportData': {} }), { show: (__VLS_ctx.showExportModal), points: (__VLS_ctx.points) })], __VLS_functionalComponentArgsRest(__VLS_41), false));
var __VLS_44;
var __VLS_45;
var __VLS_46;
var __VLS_47 = {
    onClose: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showExportModal = false;
    }
};
var __VLS_48 = {
    onExportImage: (__VLS_ctx.handleExportImage)
};
var __VLS_49 = {
    onExportData: (__VLS_ctx.handleExportData)
};
var __VLS_43;
/** @type {[typeof DevLogsModal, ]} */ ;
// @ts-ignore
var __VLS_50 = __VLS_asFunctionalComponent(DevLogsModal, new DevLogsModal(__assign(__assign({ 'onClose': {} }, { 'onClear': {} }), { show: (__VLS_ctx.isDevLogsVisible), logs: (__VLS_ctx.logs), formatLogTime: (__VLS_ctx.formatLogTime), locationPermission: (__VLS_ctx.locationPermission), notificationPermission: (__VLS_ctx.notificationPermission) })));
var __VLS_51 = __VLS_50.apply(void 0, __spreadArray([__assign(__assign({ 'onClose': {} }, { 'onClear': {} }), { show: (__VLS_ctx.isDevLogsVisible), logs: (__VLS_ctx.logs), formatLogTime: (__VLS_ctx.formatLogTime), locationPermission: (__VLS_ctx.locationPermission), notificationPermission: (__VLS_ctx.notificationPermission) })], __VLS_functionalComponentArgsRest(__VLS_50), false));
var __VLS_53;
var __VLS_54;
var __VLS_55;
var __VLS_56 = {
    onClose: (__VLS_ctx.hideDevLogs)
};
var __VLS_57 = {
    onClear: (__VLS_ctx.clearLogs)
};
var __VLS_52;
/** @type {[typeof SettingsModal, ]} */ ;
// @ts-ignore
var __VLS_58 = __VLS_asFunctionalComponent(SettingsModal, new SettingsModal(__assign(__assign(__assign({ 'onClose': {} }, { 'onSave': {} }), { 'onOpenSettings': {} }), { show: (__VLS_ctx.showSettingsModal), settings: (__VLS_ctx.settings), locationPermission: (__VLS_ctx.locationPermission), isNativePlatform: (true) })));
var __VLS_59 = __VLS_58.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClose': {} }, { 'onSave': {} }), { 'onOpenSettings': {} }), { show: (__VLS_ctx.showSettingsModal), settings: (__VLS_ctx.settings), locationPermission: (__VLS_ctx.locationPermission), isNativePlatform: (true) })], __VLS_functionalComponentArgsRest(__VLS_58), false));
var __VLS_61;
var __VLS_62;
var __VLS_63;
var __VLS_64 = {
    onClose: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showSettingsModal = false;
    }
};
var __VLS_65 = {
    onSave: (__VLS_ctx.handleSettingsSave)
};
var __VLS_66 = {
    onOpenSettings: (__VLS_ctx.handleOpenAppSettings)
};
var __VLS_60;
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['dev-logs-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['gps-points-button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['export-button-text']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-zoom-button']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-zoom-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['reset-zoom-icon-image']} */ ;
var __VLS_dollars;
var __VLS_self = (await import('vue')).defineComponent({
    setup: function () {
        return {
            IS_DEV_MODE: IS_DEV_MODE,
            CANVAS_CONFIG: CANVAS_CONFIG,
            GPSPointsModal: GPSPointsModal,
            ExportModal: ExportModal,
            DevLogsModal: DevLogsModal,
            PermissionModal: PermissionModal,
            SettingsModal: SettingsModal,
            BaseButton: BaseButton,
            showGPSPointsModal: showGPSPointsModal,
            showExportModal: showExportModal,
            showSettingsModal: showSettingsModal,
            points: points,
            isAnonymized: isAnonymized,
            anonymizationOrigin: anonymizationOrigin,
            settings: settings,
            currentAccuracy: currentAccuracy,
            canvasEl: canvasEl,
            scale: scale,
            viewOffsetX: viewOffsetX,
            viewOffsetY: viewOffsetY,
            logs: logs,
            isDevLogsVisible: isDevLogsVisible,
            clearLogs: clearLogs,
            hideDevLogs: hideDevLogs,
            formatLogTime: formatLogTime,
            handleDirectExport: handleDirectExport,
            handleExportImage: handleExportImage,
            handleExportData: handleExportData,
            locationPermission: locationPermission,
            requestLocationPermission: requestLocationPermission,
            handleOpenAppSettings: handleOpenAppSettings,
            notificationPermission: notificationPermission,
            requestNotificationPermission: requestNotificationPermission,
            isRequestingNotificationPermission: isRequestingNotificationPermission,
            handleTouchStart: handleTouchStart,
            handleTouchMove: handleTouchMove,
            handleTouchEnd: handleTouchEnd,
            handleMouseDown: handleMouseDown,
            handleMouseMove: handleMouseMove,
            handleMouseUp: handleMouseUp,
            handleWheel: handleWheel,
            displayPoints: displayPoints,
            handleSettingsSave: handleSettingsSave,
            toggleAnonymization: toggleAnonymization,
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
