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
import { registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { useDevLogs } from './useDevLogs';
var BackgroundGeolocation = registerPlugin('BackgroundGeolocation');
export function usePermissions() {
    var _this = this;
    var logError = useDevLogs().logError;
    var locationPermission = ref('prompt');
    var backgroundLocationPermission = ref('not-needed');
    var isCheckingPermissions = ref(false);
    var isRequestingPermission = ref(false);
    var dontShowBackgroundModal = ref(false);
    // Tap debouncing for settings button
    var lastTapTime = 0;
    // Singleton flag for app state listener
    var appStateListenerInitialized = false;
    // Computed properties
    var hasLocationPermission = computed(function () { return locationPermission.value === 'granted'; });
    var hasBackgroundLocationPermission = computed(function () {
        return backgroundLocationPermission.value === 'granted' || backgroundLocationPermission.value === 'not-needed';
    });
    var needsLocationPermission = computed(function () { return !hasLocationPermission.value; });
    var needsBackgroundLocationPermission = computed(function () {
        return hasLocationPermission.value &&
            Capacitor.isNativePlatform() &&
            backgroundLocationPermission.value !== 'granted';
    });
    var canTrackGPS = computed(function () { return hasLocationPermission.value; });
    var canTrackBackgroundGPS = computed(function () { return hasLocationPermission.value && hasBackgroundLocationPermission.value; });
    // Check current permissions
    var checkPermissions = function () { return __awaiter(_this, void 0, void 0, function () {
        var locationStatus, position, locationError_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isCheckingPermissions.value)
                        return [2 /*return*/];
                    isCheckingPermissions.value = true;
                    // 🕒 Let UI breathe before blocking it with async ops
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 50); })];
                case 1:
                    // 🕒 Let UI breathe before blocking it with async ops
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 10, 11, 12]);
                    return [4 /*yield*/, Geolocation.checkPermissions()];
                case 3:
                    locationStatus = _a.sent();
                    locationPermission.value = locationStatus.location || 'prompt';
                    if (!Capacitor.isNativePlatform()) return [3 /*break*/, 8];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, Geolocation.getCurrentPosition({
                            enableHighAccuracy: true,
                            timeout: 5000
                        })];
                case 5:
                    position = _a.sent();
                    if (position) {
                        // If we get position the background permission is granted
                        backgroundLocationPermission.value = 'granted';
                    }
                    else {
                        backgroundLocationPermission.value = 'prompt';
                    }
                    return [3 /*break*/, 7];
                case 6:
                    locationError_1 = _a.sent();
                    // If location permission is granted but we can't get position,
                    // background permission might be the issue
                    if (locationPermission.value === 'granted') {
                        backgroundLocationPermission.value = 'denied';
                    }
                    else {
                        backgroundLocationPermission.value = 'prompt';
                    }
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 9];
                case 8:
                    backgroundLocationPermission.value = 'not-needed'; // Not available on web
                    _a.label = 9;
                case 9: return [3 /*break*/, 12];
                case 10:
                    error_1 = _a.sent();
                    console.error('Error checking permissions:', error_1);
                    // Set default states on error
                    locationPermission.value = 'prompt';
                    backgroundLocationPermission.value = 'prompt';
                    return [3 /*break*/, 12];
                case 11:
                    isCheckingPermissions.value = false;
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    }); };
    // Request location permission
    var requestLocationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var timeoutPromise, status_1, newPermissionState, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    // Use requestAnimationFrame to let UI complete paint before opening system dialog
                    return [4 /*yield*/, new Promise(function (resolve) {
                            if ('requestAnimationFrame' in window) {
                                requestAnimationFrame(function () { return setTimeout(resolve, 30); });
                            }
                            else {
                                setTimeout(resolve, 30);
                            }
                        })];
                case 1:
                    // Use requestAnimationFrame to let UI complete paint before opening system dialog
                    _a.sent();
                    timeoutPromise = new Promise(function (_, reject) {
                        setTimeout(function () { return reject(new Error('Permission request timeout after 15 seconds')); }, 15000);
                    });
                    return [4 /*yield*/, Promise.race([
                            Geolocation.requestPermissions(),
                            timeoutPromise
                        ])];
                case 2:
                    status_1 = _a.sent();
                    newPermissionState = status_1.location || 'denied';
                    locationPermission.value = newPermissionState;
                    result = locationPermission.value === 'granted';
                    return [2 /*return*/, result];
                case 3:
                    error_2 = _a.sent();
                    // Set to denied on any error
                    locationPermission.value = 'denied';
                    logError('Error requesting location permission', error_2);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Request background location permission - now opens settings directly
    var requestBackgroundLocationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var locationGranted, appStateListener_1, settingsError_1, fallbackError_1, error_3;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!Capacitor.isNativePlatform()) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, , 13]);
                    if (!!hasLocationPermission.value) return [3 /*break*/, 3];
                    return [4 /*yield*/, requestLocationPermission()];
                case 2:
                    locationGranted = _a.sent();
                    if (!locationGranted) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, , 11]);
                    return [4 /*yield*/, BackgroundGeolocation.openSettings()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, App.addListener('appStateChange', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var _this = this;
                            var isActive = _b.isActive;
                            return __generator(this, function (_c) {
                                if (isActive) {
                                    // Wait a bit for settings to take effect
                                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, checkPermissions()];
                                                case 1:
                                                    _a.sent();
                                                    // Remove the listener after checking
                                                    return [4 /*yield*/, appStateListener_1.remove()];
                                                case 2:
                                                    // Remove the listener after checking
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }, 1000);
                                }
                                return [2 /*return*/];
                            });
                        }); })];
                case 5:
                    appStateListener_1 = _a.sent();
                    return [2 /*return*/, true]; // Settings opened successfully
                case 6:
                    settingsError_1 = _a.sent();
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    // This might work on some devices
                    return [4 /*yield*/, BackgroundGeolocation.addWatcher({
                            backgroundMessage: "GPS Drawing needs background location access",
                            backgroundTitle: "Background Permission Required",
                            requestPermissions: true,
                            stale: false,
                            distanceFilter: 1000
                        }, function () {
                            // Background permission test callback
                        })];
                case 8:
                    // This might work on some devices
                    _a.sent();
                    // Wait and then remove
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        var removeError_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, BackgroundGeolocation.removeWatcher({ id: 'temp' })];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    removeError_1 = _a.sent();
                                    logError('Error removing temp watcher', removeError_1);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }, 2000);
                    return [2 /*return*/, true];
                case 9:
                    fallbackError_1 = _a.sent();
                    logError('Fallback background permission method failed', fallbackError_1);
                    return [2 /*return*/, false];
                case 10: return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_3 = _a.sent();
                    return [2 /*return*/, false];
                case 13: return [2 /*return*/];
            }
        });
    }); };
    // Open app settings (for manual permission enabling)
    var openAppSettings = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!Capacitor.isNativePlatform()) return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // This will open the app's settings page where users can manually enable permissions
                    return [4 /*yield*/, BackgroundGeolocation.openSettings()];
                case 2:
                    // This will open the app's settings page where users can manually enable permissions
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    logError('Error opening app settings', error_4);
                    // Fallback: show instructions to user
                    alert('Please go to your device settings > Apps > GPS Drawing > Permissions and enable "Allow all the time" for location access.');
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    // On web, show instructions
                    alert('Please enable location permissions in your browser settings.');
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Initialize permissions and set up app state monitoring
    var initPermissions = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_5;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkPermissions()];
                case 1:
                    _a.sent();
                    if (!(!appStateListenerInitialized && Capacitor.isNativePlatform())) return [3 /*break*/, 5];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    appStateListenerInitialized = true;
                    return [4 /*yield*/, App.addListener('appStateChange', function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var isActive = _b.isActive;
                            return __generator(this, function (_c) {
                                if (isActive) {
                                    // Small delay to let system state settle
                                    setTimeout(function () {
                                        checkPermissions();
                                    }, 500);
                                }
                                return [2 /*return*/];
                            });
                        }); })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_5 = _a.sent();
                    logError('Error setting up app state listener', error_5);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Permission request handlers
    var handleRequestLocationPermission = function (addGPSPoint, addBackgroundGPSPoint, updateCurrentAccuracy, canTrackGPS, canTrackBackgroundGPS, initBackgroundGPS, startGPSTracking) { return __awaiter(_this, void 0, void 0, function () {
        var granted, gpsError_1, error_6, checkError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Prevent multiple simultaneous requests
                    if (isRequestingPermission.value) {
                        return [2 /*return*/];
                    }
                    // If permission is already granted, no need to request
                    if (locationPermission.value === 'granted') {
                        return [2 /*return*/];
                    }
                    isRequestingPermission.value = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 11, 16, 17]);
                    return [4 /*yield*/, requestLocationPermission()];
                case 2:
                    granted = _a.sent();
                    if (!granted) return [3 /*break*/, 10];
                    // Force re-check permissions to ensure state is up to date
                    return [4 /*yield*/, checkPermissions()];
                case 3:
                    // Force re-check permissions to ensure state is up to date
                    _a.sent();
                    if (!canTrackGPS.value) return [3 /*break*/, 10];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 9, , 10]);
                    if (!canTrackBackgroundGPS.value) return [3 /*break*/, 6];
                    return [4 /*yield*/, initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, startGPSTracking(addGPSPoint)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    gpsError_1 = _a.sent();
                    logError('Failed to start GPS tracking after permission grant', gpsError_1);
                    return [3 /*break*/, 10];
                case 10: return [3 /*break*/, 17];
                case 11:
                    error_6 = _a.sent();
                    logError('Error in handleRequestLocationPermission', error_6);
                    _a.label = 12;
                case 12:
                    _a.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, checkPermissions()];
                case 13:
                    _a.sent();
                    return [3 /*break*/, 15];
                case 14:
                    checkError_1 = _a.sent();
                    logError('Error checking permissions after request error', checkError_1);
                    return [3 /*break*/, 15];
                case 15: return [3 /*break*/, 17];
                case 16:
                    isRequestingPermission.value = false;
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    }); };
    var handleRequestBackgroundPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var granted, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isRequestingPermission.value = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, requestBackgroundLocationPermission()];
                case 2:
                    granted = _a.sent();
                    if (!granted) return [3 /*break*/, 4];
                    // Re-check permissions after granting
                    return [4 /*yield*/, checkPermissions()];
                case 3:
                    // Re-check permissions after granting
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_7 = _a.sent();
                    logError('Error in handleRequestBackgroundPermission', error_7);
                    return [3 /*break*/, 7];
                case 6:
                    isRequestingPermission.value = false;
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleOpenAppSettings = function () { return __awaiter(_this, void 0, void 0, function () {
        var now, error_8;
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
                    error_8 = _a.sent();
                    logError('Error opening app settings', error_8);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return {
        // State
        locationPermission: locationPermission,
        backgroundLocationPermission: backgroundLocationPermission,
        isCheckingPermissions: isCheckingPermissions,
        isRequestingPermission: isRequestingPermission,
        dontShowBackgroundModal: dontShowBackgroundModal,
        // Computed properties
        hasLocationPermission: hasLocationPermission,
        hasBackgroundLocationPermission: hasBackgroundLocationPermission,
        needsLocationPermission: needsLocationPermission,
        needsBackgroundLocationPermission: needsBackgroundLocationPermission,
        canTrackGPS: canTrackGPS,
        canTrackBackgroundGPS: canTrackBackgroundGPS,
        // Methods
        checkPermissions: checkPermissions,
        requestLocationPermission: requestLocationPermission,
        requestBackgroundLocationPermission: requestBackgroundLocationPermission,
        openAppSettings: openAppSettings,
        initPermissions: initPermissions,
        // Permission handlers
        handleRequestLocationPermission: handleRequestLocationPermission,
        handleRequestBackgroundPermission: handleRequestBackgroundPermission,
        handleOpenAppSettings: handleOpenAppSettings,
    };
}
