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
import { ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { GPS_CONFIG } from '../constants/gpsConstants';
import { calculateDistance, getSignalQuality, smoothGPSPoints, roundCoordinates } from '../utils/gpsUtils';
import { useDevLogs } from './useDevLogs';
var logInfo = useDevLogs().logInfo;
export function useGPS() {
    var _this = this;
    // GPS state
    var currentLat = ref(0);
    var currentLon = ref(0);
    var currentAccuracy = ref(null);
    var gpsSignalQuality = ref('unknown');
    var isGPSActive = ref(false);
    // Internal state
    var watchId = null;
    // Computed properties
    var isTracking = computed(function () { return isGPSActive.value && watchId !== null; });
    var startGPSTracking = function (onPointAdded) { return __awaiter(_this, void 0, void 0, function () {
        var permissionStatus, requestStatus, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!Capacitor.isNativePlatform()) {
                        console.warn('GPS tracking is optimized for native platforms');
                    }
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
                        return [2 /*return*/];
                    }
                    _a.label = 4;
                case 4:
                    logInfo('Starting enhanced GPS tracking for lock screen support');
                    return [4 /*yield*/, Geolocation.watchPosition({
                            enableHighAccuracy: true,
                            timeout: GPS_CONFIG.value.TIMEOUT,
                            maximumAge: GPS_CONFIG.value.MAXIMUM_AGE
                        }, function (position, err) {
                            if (err) {
                                console.error('GPS Error:', err.message, err.code);
                                gpsSignalQuality.value = 'unknown';
                            }
                            else if (position) {
                                processGPSPosition(position, onPointAdded);
                            }
                        })];
                case 5:
                    // Enhanced GPS tracking with better lock screen support
                    watchId = _a.sent();
                    isGPSActive.value = true;
                    logInfo('GPS tracking started successfully');
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Failed to start GPS tracking:', error_1.message || error_1);
                    logInfo('GPS tracking failed to start', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var processGPSPosition = function (position, onPointAdded) {
        var accuracy = position.coords.accuracy || 999;
        currentAccuracy.value = accuracy;
        gpsSignalQuality.value = getSignalQuality(accuracy);
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
        if (accuracy > GPS_CONFIG.value.ACCURACY_THRESHOLD) {
            console.warn("Skipping low-accuracy GPS point: ".concat(accuracy.toFixed(1), "m (threshold: ").concat(GPS_CONFIG.value.ACCURACY_THRESHOLD, "m)"));
            return;
        }
        // Round coordinates to specified precision
        var _a = roundCoordinates(position.coords.latitude, position.coords.longitude), lat = _a.lat, lon = _a.lon;
        var timestamp = Date.now();
        // Always update current position for display
        currentLat.value = lat;
        currentLon.value = lon;
        // Create new point
        var newPoint = { lat: lat, lon: lon, timestamp: timestamp, accuracy: accuracy };
        onPointAdded(newPoint);
    };
    var stopGPSTracking = function () {
        if (watchId) {
            Geolocation.clearWatch({ id: watchId });
            watchId = null;
            isGPSActive.value = false;
            logInfo('GPS tracking stopped');
        }
    };
    var shouldAddPoint = function (points, newPoint) {
        if (points.length === 0) {
            console.log('Adding first GPS point');
            return true;
        }
        var lastPoint = points[points.length - 1];
        var distance = calculateDistance(lastPoint.lat, lastPoint.lon, newPoint.lat, newPoint.lon);
        var timeDiff = newPoint.timestamp - lastPoint.timestamp;
        // Check distance threshold
        if (distance < GPS_CONFIG.value.DISTANCE_THRESHOLD) {
            console.log("Skipping point - too close: ".concat(distance.toFixed(1), "m (threshold: ").concat(GPS_CONFIG.value.DISTANCE_THRESHOLD, "m)"));
            return false;
        }
        // Check time interval
        if (timeDiff < GPS_CONFIG.value.MIN_TIME_INTERVAL) {
            console.log("Skipping point - too soon: ".concat(timeDiff, "ms (threshold: ").concat(GPS_CONFIG.value.MIN_TIME_INTERVAL, "ms)"));
            return false;
        }
        console.log("Adding GPS point - distance: ".concat(distance.toFixed(1), "m, time: ").concat(timeDiff, "ms"));
        return true;
    };
    var processNewPoint = function (newPoint) {
        logInfo('processNewPoint', newPoint);
        return smoothGPSPoints(newPoint);
    };
    return {
        // State
        currentLat: currentLat,
        currentLon: currentLon,
        currentAccuracy: currentAccuracy,
        gpsSignalQuality: gpsSignalQuality,
        isGPSActive: isGPSActive,
        // Computed
        isTracking: isTracking,
        // Methods
        startGPSTracking: startGPSTracking,
        stopGPSTracking: stopGPSTracking,
        shouldAddPoint: shouldAddPoint,
        processNewPoint: processNewPoint,
    };
}
