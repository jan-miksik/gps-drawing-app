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
import { ref } from 'vue';
import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { GPS_CONFIG } from '../constants/gpsConstants';
import { roundCoordinates } from '../utils/gpsUtils';
var BackgroundGeolocation = registerPlugin('BackgroundGeolocation');
export function useBackgroundGPS() {
    var _this = this;
    var isBackgroundGPSActive = ref(false);
    var isInitialized = ref(false);
    var watcherId = ref(null);
    var lastPointTime = ref(0);
    var initBackgroundGPS = function (onPoint, onAccuracyUpdate) { return __awaiter(_this, void 0, void 0, function () {
        var id, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!Capacitor.isNativePlatform()) {
                        return [2 /*return*/];
                    }
                    if (isInitialized.value) {
                        return [2 /*return*/];
                    }
                    isInitialized.value = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, BackgroundGeolocation.addWatcher({
                            backgroundMessage: "GPS drawing in progress",
                            backgroundTitle: "GPS Drawing Active",
                            requestPermissions: true,
                            stale: false,
                            distanceFilter: GPS_CONFIG.value.DISTANCE_THRESHOLD
                        }, function (location, error) {
                            if (error) {
                                console.error('Background GPS error:', error);
                                return;
                            }
                            if (location) {
                                var accuracy = location.accuracy || 999;
                                // Always update current accuracy display (even for poor accuracy points)
                                if (onAccuracyUpdate) {
                                    onAccuracyUpdate(accuracy);
                                }
                                // Round coordinates to specified precision
                                var _a = roundCoordinates(location.latitude, location.longitude), lat = _a.lat, lon = _a.lon;
                                var timestamp = Date.now();
                                var point = {
                                    lat: lat,
                                    lon: lon,
                                    timestamp: timestamp,
                                    accuracy: accuracy
                                };
                                // Apply timeout based on settings to prevent too frequent updates
                                var now = Date.now();
                                var timeSinceLastPoint = now - lastPointTime.value;
                                var minInterval = GPS_CONFIG.value.MIN_TIME_INTERVAL;
                                if (timeSinceLastPoint >= minInterval) {
                                    // Call the provided callback for point recording
                                    onPoint(point);
                                    lastPointTime.value = now;
                                }
                            }
                        })];
                case 2:
                    id = _a.sent();
                    watcherId.value = id;
                    isBackgroundGPSActive.value = true;
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var startBackgroundGPS = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!Capacitor.isNativePlatform()) {
                console.warn('Background GPS is only available on native platforms.');
                return [2 /*return*/];
            }
            if (!isInitialized.value) {
                console.warn('Background GPS not initialized. Call initBackgroundGPS first.');
                return [2 /*return*/];
            }
            try {
                console.log('Background GPS already started during initialization');
                isBackgroundGPSActive.value = true;
            }
            catch (err) {
                console.error('Failed to start background GPS:', err);
                throw err;
            }
            return [2 /*return*/];
        });
    }); };
    var stopBackgroundGPS = function () { return __awaiter(_this, void 0, void 0, function () {
        var err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!Capacitor.isNativePlatform())
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    console.log('Stopping background GPS...');
                    if (!watcherId.value) return [3 /*break*/, 3];
                    return [4 /*yield*/, BackgroundGeolocation.removeWatcher({
                            id: watcherId.value
                        })];
                case 2:
                    _a.sent();
                    watcherId.value = null;
                    _a.label = 3;
                case 3:
                    isBackgroundGPSActive.value = false;
                    console.log('Background GPS stopped successfully');
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    console.error('Failed to stop background GPS:', err_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getBackgroundGPSState = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!Capacitor.isNativePlatform())
                return [2 /*return*/, null];
            try {
                // The community plugin doesn't have a getState method
                // Return our internal state
                return [2 /*return*/, {
                        enabled: isBackgroundGPSActive.value,
                        isMoving: true
                    }];
            }
            catch (err) {
                console.error('Failed to get background GPS state:', err);
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    }); };
    // Note: Capacitor handles cleanup automatically when app terminates
    // No manual cleanup needed for background GPS watchers
    return {
        // State
        isBackgroundGPSActive: isBackgroundGPSActive,
        // isInitialized,
        // Methods
        initBackgroundGPS: initBackgroundGPS,
        startBackgroundGPS: startBackgroundGPS,
        stopBackgroundGPS: stopBackgroundGPS,
        getBackgroundGPSState: getBackgroundGPSState,
    };
}
