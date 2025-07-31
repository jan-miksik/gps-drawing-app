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
import { usePermissions } from './composables/usePermissions';
import { GPS_CONFIG, CANVAS_CONFIG, updateGPSConfig, updateCanvasConfig } from './constants/gpsConstants';
import GPSPointsModal from './components/GPSPointsModal.vue';
import ExportModal from './components/ExportModal.vue';
import DevLogsModal from './components/DevLogsModal.vue';
import BackgroundTrackingModal from './components/BackgroundTrackingModal.vue';
import SettingsModal from './components/SettingsModal.vue';
import { anonymizePoints, createAnonymizationOrigin } from './utils/coordinateUtils';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
// State
var showModal = ref(false);
var showExportModal = ref(false);
var showBackgroundTrackingModal = ref(false);
var showSettingsModal = ref(false);
var isRequestingPermission = ref(false);
var dontShowBackgroundModal = ref(false);
var points = ref([]);
// Tap debouncing for settings button
var lastTapTime = 0;
// Settings state (already declared above)
var isAnonymized = ref(true);
var anonymizationOrigin = ref(null);
// Settings state - use computed to sync with actual configs
var settings = computed(function () { return ({
    ACCURACY_THRESHOLD: GPS_CONFIG.value.ACCURACY_THRESHOLD,
    DISTANCE_THRESHOLD: GPS_CONFIG.value.DISTANCE_THRESHOLD,
    MIN_TIME_INTERVAL: GPS_CONFIG.value.MIN_TIME_INTERVAL / 1000, // Convert to seconds for UI
    PINCH_ZOOM_SENSITIVITY: CANVAS_CONFIG.value.PINCH_ZOOM_SENSITIVITY,
    MIN_SCALE: CANVAS_CONFIG.value.MIN_SCALE,
    MAX_SCALE: CANVAS_CONFIG.value.MAX_SCALE,
    LINE_WIDTH: CANVAS_CONFIG.value.LINE_WIDTH,
}); });
// Composables
var _a = useGPS(), currentAccuracy = _a.currentAccuracy, startGPSTracking = _a.startGPSTracking, stopGPSTracking = _a.stopGPSTracking, shouldAddPoint = _a.shouldAddPoint;
// Permission computed properties
var hasLocationPermission = computed(function () { return locationPermission.value === 'granted'; });
var hasBackgroundLocationPermission = computed(function () {
    return backgroundLocationPermission.value === 'granted' || backgroundLocationPermission.value === 'not-needed';
});
var _b = useBackgroundGPS(), initBackgroundGPS = _b.initBackgroundGPS, stopBackgroundGPS = _b.stopBackgroundGPS, removeBackgroundGPSListeners = _b.removeBackgroundGPSListeners;
var _c = useCanvas(), canvasEl = _c.canvasEl, setupCanvas = _c.setupCanvas, drawPath = _c.drawPath, calculateBounds = _c.calculateBounds, pan = _c.pan, zoom = _c.zoom, resetView = _c.resetView, scale = _c.scale, viewOffsetX = _c.viewOffsetX, viewOffsetY = _c.viewOffsetY;
var _d = useFileOperations(), loadPointsFromFile = _d.loadPointsFromFile, savePointsToFile = _d.savePointsToFile, exportPoints = _d.exportPoints, exportCanvasAsImage = _d.exportCanvasAsImage, clearAllData = _d.clearAllData;
var _e = useDevLogs(), logs = _e.logs, isDevLogsVisible = _e.isDevLogsVisible, logInfo = _e.logInfo, logWarn = _e.logWarn, logError = _e.logError, clearLogs = _e.clearLogs, hideDevLogs = _e.hideDevLogs, formatLogTime = _e.formatLogTime;
var _f = usePermissions(), locationPermission = _f.locationPermission, backgroundLocationPermission = _f.backgroundLocationPermission, canTrackGPS = _f.canTrackGPS, canTrackBackgroundGPS = _f.canTrackBackgroundGPS, checkPermissions = _f.checkPermissions, requestLocationPermission = _f.requestLocationPermission, requestBackgroundLocationPermission = _f.requestBackgroundLocationPermission, openAppSettings = _f.openAppSettings, initPermissions = _f.initPermissions;
var _g = useInteractions(function (deltaX, deltaY) {
    pan(deltaX, deltaY);
    redrawCanvas();
}, function (deltaY) {
    zoom(deltaY);
    redrawCanvas();
}, function () {
    resetView();
    redrawCanvas();
}), handleTouchStart = _g.handleTouchStart, handleTouchMove = _g.handleTouchMove, handleTouchEnd = _g.handleTouchEnd, handleMouseDown = _g.handleMouseDown, handleMouseMove = _g.handleMouseMove, handleMouseUp = _g.handleMouseUp, handleWheel = _g.handleWheel;
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
};
var addBackgroundGPSPoint = function (newPoint) { return __awaiter(void 0, void 0, void 0, function () {
    var processedPoint;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logInfo('Background GPS point received', newPoint);
                if (!shouldAddPoint(points.value, newPoint)) {
                    return [2 /*return*/];
                }
                processedPoint = newPoint;
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
var handleSettingsSave = function (newSettings) {
    // Update GPS config
    updateGPSConfig({
        ACCURACY_THRESHOLD: newSettings.ACCURACY_THRESHOLD,
        DISTANCE_THRESHOLD: newSettings.DISTANCE_THRESHOLD,
        MIN_TIME_INTERVAL: newSettings.MIN_TIME_INTERVAL * 1000, // Convert back to milliseconds
    });
    // Update Canvas config
    updateCanvasConfig({
        PINCH_ZOOM_SENSITIVITY: newSettings.PINCH_ZOOM_SENSITIVITY,
        MIN_SCALE: newSettings.MIN_SCALE,
        MAX_SCALE: newSettings.MAX_SCALE,
        LINE_WIDTH: newSettings.LINE_WIDTH,
    });
    // Also update the settings ref for the modal
    Object.assign(settings.value, newSettings);
    // Redraw canvas to apply visual changes immediately
    redrawCanvas();
    logInfo('Settings updated', newSettings);
};
var handleResetZoom = function () {
    resetView();
    redrawCanvas();
    logInfo('Zoom and view reset to default');
};
var handleRequestLocationPermission = function () { return __awaiter(void 0, void 0, void 0, function () {
    var granted, gpsError_1, error_4, checkError_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🔄 handleRequestLocationPermission called');
                console.log('Current state - isRequesting:', isRequestingPermission.value, 'permission:', locationPermission.value);
                // Prevent multiple simultaneous requests
                if (isRequestingPermission.value) {
                    console.log('⏸️ Permission request already in progress, skipping...');
                    return [2 /*return*/];
                }
                // If permission is already granted, no need to request
                if (locationPermission.value === 'granted') {
                    console.log('✅ Permission already granted, no need to request');
                    return [2 /*return*/];
                }
                isRequestingPermission.value = true;
                console.log('🔄 Set isRequestingPermission to true, starting request...');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 13, 18, 19]);
                console.log('📱 Calling requestLocationPermission...');
                return [4 /*yield*/, requestLocationPermission()];
            case 2:
                granted = _a.sent();
                console.log('📱 Location permission result:', granted);
                console.log('📱 New permission state:', locationPermission.value);
                if (!granted) return [3 /*break*/, 11];
                logInfo('✅ Location permission granted successfully');
                // Force re-check permissions to ensure state is up to date
                console.log('🔄 Re-checking permissions after grant...');
                return [4 /*yield*/, checkPermissions()];
            case 3:
                _a.sent();
                console.log('✅ Permissions re-checked, final state:', locationPermission.value);
                if (!canTrackGPS.value) return [3 /*break*/, 10];
                _a.label = 4;
            case 4:
                _a.trys.push([4, 9, , 10]);
                if (!canTrackBackgroundGPS.value) return [3 /*break*/, 6];
                return [4 /*yield*/, initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy)];
            case 5:
                _a.sent();
                logInfo('🛰️ Background GPS tracking started');
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, startGPSTracking(addGPSPoint)];
            case 7:
                _a.sent();
                logInfo('📍 Foreground GPS tracking started');
                _a.label = 8;
            case 8: return [3 /*break*/, 10];
            case 9:
                gpsError_1 = _a.sent();
                console.error('❌ Failed to start GPS tracking after permission grant:', gpsError_1);
                logError('Failed to start GPS tracking after permission grant', gpsError_1);
                return [3 /*break*/, 10];
            case 10: return [3 /*break*/, 12];
            case 11:
                logWarn('❌ Location permission denied by user');
                console.log('❌ Permission denied, final state:', locationPermission.value);
                // If permission was denied, offer to open settings
                if (locationPermission.value === 'denied') {
                    console.log('💡 Permission permanently denied, should show settings option');
                }
                _a.label = 12;
            case 12: return [3 /*break*/, 19];
            case 13:
                error_4 = _a.sent();
                console.error('❌ Error in handleRequestLocationPermission:', error_4);
                logError('Error requesting location permission:', error_4);
                _a.label = 14;
            case 14:
                _a.trys.push([14, 16, , 17]);
                return [4 /*yield*/, checkPermissions()];
            case 15:
                _a.sent();
                return [3 /*break*/, 17];
            case 16:
                checkError_1 = _a.sent();
                console.error('❌ Error checking permissions after request error:', checkError_1);
                return [3 /*break*/, 17];
            case 17: return [3 /*break*/, 19];
            case 18:
                isRequestingPermission.value = false;
                console.log('✅ Set isRequestingPermission to false, request completed');
                return [7 /*endfinally*/];
            case 19: return [2 /*return*/];
        }
    });
}); };
var handleRequestBackgroundPermission = function () { return __awaiter(void 0, void 0, void 0, function () {
    var granted, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('handleRequestBackgroundPermission called');
                isRequestingPermission.value = true;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, 7, 8]);
                console.log('Calling requestBackgroundLocationPermission...');
                return [4 /*yield*/, requestBackgroundLocationPermission()];
            case 2:
                granted = _a.sent();
                console.log('Background permission result:', granted);
                if (!granted) return [3 /*break*/, 4];
                logInfo('Background location permission granted');
                // Re-check permissions after granting
                return [4 /*yield*/, checkPermissions()];
            case 3:
                // Re-check permissions after granting
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                logWarn('Background location permission denied');
                _a.label = 5;
            case 5: return [3 /*break*/, 8];
            case 6:
                error_5 = _a.sent();
                console.error('Error in handleRequestBackgroundPermission:', error_5);
                logError('Error requesting background location permission:', error_5);
                return [3 /*break*/, 8];
            case 7:
                isRequestingPermission.value = false;
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); };
var handleOpenAppSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
    var now, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                now = Date.now();
                if (now - lastTapTime < 1000)
                    return [2 /*return*/]; // ignore if less than 1s since last tap
                lastTapTime = now;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, openAppSettings()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_6 = _a.sent();
                console.error('Error opening app settings:', error_6);
                logError('Error opening app settings:', error_6);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
// Background tracking modal handlers
var handleEnableBackgroundTracking = function () { return __awaiter(void 0, void 0, void 0, function () {
    var granted, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                isRequestingPermission.value = true;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, 7, 8]);
                return [4 /*yield*/, requestBackgroundLocationPermission()];
            case 2:
                granted = _a.sent();
                if (!granted) return [3 /*break*/, 4];
                logInfo('Background tracking enabled');
                showBackgroundTrackingModal.value = false;
                return [4 /*yield*/, checkPermissions()];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                logWarn('Background tracking permission denied');
                _a.label = 5;
            case 5: return [3 /*break*/, 8];
            case 6:
                error_7 = _a.sent();
                console.error('Error enabling background tracking:', error_7);
                logError('Error enabling background tracking:', error_7);
                return [3 /*break*/, 8];
            case 7:
                isRequestingPermission.value = false;
                return [7 /*endfinally*/];
            case 8: return [2 /*return*/];
        }
    });
}); };
var handleSkipBackgroundTracking = function (dontShowAgain) {
    if (dontShowAgain) {
        dontShowBackgroundModal.value = true;
        // Save this preference
        localStorage.setItem('dontShowBackgroundModal', 'true');
    }
    showBackgroundTrackingModal.value = false;
};
// Settings modal handlers
var handleSettingsRequestLocation = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, handleRequestLocationPermission()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var handleSettingsRequestBackground = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, handleRequestBackgroundPermission()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var handleSettingsOpenSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, handleOpenAppSettings()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
// Lifecycle
onMounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    var savedPreference, loadedPoints, error_8, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logInfo('App starting up');
                savedPreference = localStorage.getItem('dontShowBackgroundModal');
                if (savedPreference === 'true') {
                    dontShowBackgroundModal.value = true;
                }
                // Initialize permissions first
                return [4 /*yield*/, initPermissions()];
            case 1:
                // Initialize permissions first
                _a.sent();
                setupCanvas();
                return [4 /*yield*/, loadPointsFromFile()];
            case 2:
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
                // Auto-request location permission if not granted (with UI breathing room)
                if (!hasLocationPermission.value) {
                    logInfo('Location permission not granted, requesting automatically');
                    nextTick(function () {
                        setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                            var error_10;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, handleRequestLocationPermission()];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_10 = _a.sent();
                                        logError('Failed to request location permission automatically', error_10);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, 100);
                    });
                }
                if (!canTrackGPS.value) return [3 /*break*/, 10];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 8, , 9]);
                if (!canTrackBackgroundGPS.value) return [3 /*break*/, 5];
                // Use background GPS for long-term tracking
                return [4 /*yield*/, initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy)];
            case 4:
                // Use background GPS for long-term tracking
                _a.sent();
                logInfo('Background GPS tracking started for long-term drawing');
                return [3 /*break*/, 7];
            case 5: 
            // Fallback to foreground GPS
            return [4 /*yield*/, startGPSTracking(addGPSPoint)];
            case 6:
                // Fallback to foreground GPS
                _a.sent();
                logInfo('Foreground GPS tracking started (background permission needed for long-term tracking)');
                _a.label = 7;
            case 7: return [3 /*break*/, 9];
            case 8:
                error_8 = _a.sent();
                logError('Failed to start GPS tracking', error_8);
                return [3 /*break*/, 9];
            case 9: return [3 /*break*/, 11];
            case 10:
                logWarn('GPS tracking not started - location permission required');
                _a.label = 11;
            case 11:
                // Initial draw
                redrawCanvas();
                logInfo('App initialization completed');
                if (!Capacitor.isNativePlatform()) return [3 /*break*/, 15];
                _a.label = 12;
            case 12:
                _a.trys.push([12, 14, , 15]);
                return [4 /*yield*/, App.addListener('appStateChange', function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
                        var isActive = _b.isActive;
                        return __generator(this, function (_c) {
                            if (!isActive && !dontShowBackgroundModal.value && hasLocationPermission.value && !hasBackgroundLocationPermission.value) {
                                // App is going to background, show background tracking modal
                                showBackgroundTrackingModal.value = true;
                            }
                            return [2 /*return*/];
                        });
                    }); })];
            case 13:
                _a.sent();
                return [3 /*break*/, 15];
            case 14:
                error_9 = _a.sent();
                console.error('Error setting up app state listener:', error_9);
                return [3 /*break*/, 15];
            case 15: return [2 /*return*/];
        }
    });
}); });
onUnmounted(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_11;
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
                error_11 = _a.sent();
                console.error('Error stopping background GPS:', error_11);
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
if (!__VLS_ctx.hasLocationPermission) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-button-container" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)(__assign({ class: "permission-explanation" }));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)(__assign(__assign(__assign({ onClick: function () {
            var _a = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                _a[_i] = arguments[_i];
            }
            var $event = _a[0];
            if (!(!__VLS_ctx.hasLocationPermission))
                return;
            __VLS_ctx.handleOpenAppSettings();
        } }, { disabled: (__VLS_ctx.isRequestingPermission) }), { class: "permission-button-center" }), { class: ({ 'requesting': __VLS_ctx.isRequestingPermission }) }));
    if (__VLS_ctx.isRequestingPermission) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else if (__VLS_ctx.locationPermission === 'denied') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.br, __VLS_intrinsicElements.br)({});
}
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
var __VLS_0 = __VLS_asFunctionalComponent(GPSPointsModal, new GPSPointsModal(__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onToggleAnonymization': {} }), { 'onExport': {} }), { 'onClear': {} }), { 'onSettingsSave': {} }), { show: (__VLS_ctx.showModal), points: (__VLS_ctx.points), displayPoints: (__VLS_ctx.displayPoints), isAnonymized: (__VLS_ctx.isAnonymized), anonymizationOrigin: (__VLS_ctx.anonymizationOrigin), currentAccuracy: (__VLS_ctx.currentAccuracy), settings: (__VLS_ctx.settings) })));
var __VLS_1 = __VLS_0.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onToggleAnonymization': {} }), { 'onExport': {} }), { 'onClear': {} }), { 'onSettingsSave': {} }), { show: (__VLS_ctx.showModal), points: (__VLS_ctx.points), displayPoints: (__VLS_ctx.displayPoints), isAnonymized: (__VLS_ctx.isAnonymized), anonymizationOrigin: (__VLS_ctx.anonymizationOrigin), currentAccuracy: (__VLS_ctx.currentAccuracy), settings: (__VLS_ctx.settings) })], __VLS_functionalComponentArgsRest(__VLS_0), false));
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
var __VLS_10 = {
    onSettingsSave: (__VLS_ctx.handleSettingsSave)
};
var __VLS_2;
/** @type {[typeof ExportModal, ]} */ ;
// @ts-ignore
var __VLS_11 = __VLS_asFunctionalComponent(ExportModal, new ExportModal(__assign(__assign(__assign({ 'onClose': {} }, { 'onExportImage': {} }), { 'onExportData': {} }), { show: (__VLS_ctx.showExportModal), points: (__VLS_ctx.points) })));
var __VLS_12 = __VLS_11.apply(void 0, __spreadArray([__assign(__assign(__assign({ 'onClose': {} }, { 'onExportImage': {} }), { 'onExportData': {} }), { show: (__VLS_ctx.showExportModal), points: (__VLS_ctx.points) })], __VLS_functionalComponentArgsRest(__VLS_11), false));
var __VLS_14;
var __VLS_15;
var __VLS_16;
var __VLS_17 = {
    onClose: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showExportModal = false;
    }
};
var __VLS_18 = {
    onExportImage: (__VLS_ctx.handleExportImage)
};
var __VLS_19 = {
    onExportData: (__VLS_ctx.handleExportData)
};
var __VLS_13;
/** @type {[typeof DevLogsModal, ]} */ ;
// @ts-ignore
var __VLS_20 = __VLS_asFunctionalComponent(DevLogsModal, new DevLogsModal(__assign(__assign({ 'onClose': {} }, { 'onClear': {} }), { show: (__VLS_ctx.isDevLogsVisible), logs: (__VLS_ctx.logs), formatLogTime: (__VLS_ctx.formatLogTime) })));
var __VLS_21 = __VLS_20.apply(void 0, __spreadArray([__assign(__assign({ 'onClose': {} }, { 'onClear': {} }), { show: (__VLS_ctx.isDevLogsVisible), logs: (__VLS_ctx.logs), formatLogTime: (__VLS_ctx.formatLogTime) })], __VLS_functionalComponentArgsRest(__VLS_20), false));
var __VLS_23;
var __VLS_24;
var __VLS_25;
var __VLS_26 = {
    onClose: (__VLS_ctx.hideDevLogs)
};
var __VLS_27 = {
    onClear: (__VLS_ctx.clearLogs)
};
var __VLS_22;
/** @type {[typeof BackgroundTrackingModal, ]} */ ;
// @ts-ignore
var __VLS_28 = __VLS_asFunctionalComponent(BackgroundTrackingModal, new BackgroundTrackingModal(__assign(__assign({ 'onEnableBackground': {} }, { 'onSkip': {} }), { show: (__VLS_ctx.showBackgroundTrackingModal), isRequesting: (__VLS_ctx.isRequestingPermission) })));
var __VLS_29 = __VLS_28.apply(void 0, __spreadArray([__assign(__assign({ 'onEnableBackground': {} }, { 'onSkip': {} }), { show: (__VLS_ctx.showBackgroundTrackingModal), isRequesting: (__VLS_ctx.isRequestingPermission) })], __VLS_functionalComponentArgsRest(__VLS_28), false));
var __VLS_31;
var __VLS_32;
var __VLS_33;
var __VLS_34 = {
    onEnableBackground: (__VLS_ctx.handleEnableBackgroundTracking)
};
var __VLS_35 = {
    onSkip: (__VLS_ctx.handleSkipBackgroundTracking)
};
var __VLS_30;
/** @type {[typeof SettingsModal, ]} */ ;
// @ts-ignore
var __VLS_36 = __VLS_asFunctionalComponent(SettingsModal, new SettingsModal(__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onSave': {} }), { 'onRequestLocation': {} }), { 'onRequestBackground': {} }), { 'onOpenSettings': {} }), { show: (__VLS_ctx.showSettingsModal), settings: (__VLS_ctx.settings), locationPermission: (__VLS_ctx.locationPermission), backgroundLocationPermission: (__VLS_ctx.backgroundLocationPermission), isNativePlatform: (true) })));
var __VLS_37 = __VLS_36.apply(void 0, __spreadArray([__assign(__assign(__assign(__assign(__assign({ 'onClose': {} }, { 'onSave': {} }), { 'onRequestLocation': {} }), { 'onRequestBackground': {} }), { 'onOpenSettings': {} }), { show: (__VLS_ctx.showSettingsModal), settings: (__VLS_ctx.settings), locationPermission: (__VLS_ctx.locationPermission), backgroundLocationPermission: (__VLS_ctx.backgroundLocationPermission), isNativePlatform: (true) })], __VLS_functionalComponentArgsRest(__VLS_36), false));
var __VLS_39;
var __VLS_40;
var __VLS_41;
var __VLS_42 = {
    onClose: function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var $event = _a[0];
        __VLS_ctx.showSettingsModal = false;
    }
};
var __VLS_43 = {
    onSave: (__VLS_ctx.handleSettingsSave)
};
var __VLS_44 = {
    onRequestLocation: (__VLS_ctx.handleSettingsRequestLocation)
};
var __VLS_45 = {
    onRequestBackground: (__VLS_ctx.handleSettingsRequestBackground)
};
var __VLS_46 = {
    onOpenSettings: (__VLS_ctx.handleSettingsOpenSettings)
};
var __VLS_38;
/** @type {__VLS_StyleScopedClasses['canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button-container']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-explanation']} */ ;
/** @type {__VLS_StyleScopedClasses['permission-button-center']} */ ;
/** @type {__VLS_StyleScopedClasses['requesting']} */ ;
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
            BackgroundTrackingModal: BackgroundTrackingModal,
            SettingsModal: SettingsModal,
            showModal: showModal,
            showExportModal: showExportModal,
            showBackgroundTrackingModal: showBackgroundTrackingModal,
            showSettingsModal: showSettingsModal,
            isRequestingPermission: isRequestingPermission,
            points: points,
            isAnonymized: isAnonymized,
            anonymizationOrigin: anonymizationOrigin,
            settings: settings,
            currentAccuracy: currentAccuracy,
            hasLocationPermission: hasLocationPermission,
            canvasEl: canvasEl,
            scale: scale,
            viewOffsetX: viewOffsetX,
            viewOffsetY: viewOffsetY,
            logs: logs,
            isDevLogsVisible: isDevLogsVisible,
            clearLogs: clearLogs,
            hideDevLogs: hideDevLogs,
            formatLogTime: formatLogTime,
            locationPermission: locationPermission,
            backgroundLocationPermission: backgroundLocationPermission,
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
            handleSettingsSave: handleSettingsSave,
            handleResetZoom: handleResetZoom,
            handleOpenAppSettings: handleOpenAppSettings,
            handleEnableBackgroundTracking: handleEnableBackgroundTracking,
            handleSkipBackgroundTracking: handleSkipBackgroundTracking,
            handleSettingsRequestLocation: handleSettingsRequestLocation,
            handleSettingsRequestBackground: handleSettingsRequestBackground,
            handleSettingsOpenSettings: handleSettingsOpenSettings,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup: function () {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
