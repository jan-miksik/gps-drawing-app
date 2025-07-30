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
import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
var BackgroundGeolocation = registerPlugin('BackgroundGeolocation');
export function usePermissions() {
    var _this = this;
    var locationPermission = ref('prompt');
    var backgroundLocationPermission = ref('prompt');
    var isCheckingPermissions = ref(false);
    // Computed properties
    var hasLocationPermission = computed(function () { return locationPermission.value === 'granted'; });
    var hasBackgroundLocationPermission = computed(function () { return backgroundLocationPermission.value === 'granted'; });
    var needsLocationPermission = computed(function () { return !hasLocationPermission.value; });
    var needsBackgroundLocationPermission = computed(function () { return hasLocationPermission.value && !hasBackgroundLocationPermission.value; });
    var canTrackGPS = computed(function () { return hasLocationPermission.value; });
    var canTrackBackgroundGPS = computed(function () { return hasLocationPermission.value && hasBackgroundLocationPermission.value; });
    // Check current permissions
    var checkPermissions = function () { return __awaiter(_this, void 0, void 0, function () {
        var locationStatus, testWatcherId, removeError_1, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isCheckingPermissions.value = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 14, 15, 16]);
                    return [4 /*yield*/, Geolocation.checkPermissions()];
                case 2:
                    locationStatus = _a.sent();
                    locationPermission.value = locationStatus.location || 'prompt';
                    if (!Capacitor.isNativePlatform()) return [3 /*break*/, 12];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 10, , 11]);
                    return [4 /*yield*/, BackgroundGeolocation.addWatcher({
                            backgroundMessage: "Testing background permission",
                            backgroundTitle: "GPS Drawing",
                            requestPermissions: false, // Don't request, just test
                            stale: false,
                            distanceFilter: 1000 // Large distance to avoid triggering
                        }, function (location, error) {
                            if (error) {
                                console.log('Background permission test error:', error);
                                if (error.code === "NOT_AUTHORIZED") {
                                    backgroundLocationPermission.value = 'denied';
                                }
                            }
                            else if (location) {
                                backgroundLocationPermission.value = 'granted';
                            }
                        })];
                case 4:
                    testWatcherId = _a.sent();
                    // Wait a bit to see if we get an error
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 5:
                    // Wait a bit to see if we get an error
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, BackgroundGeolocation.removeWatcher({ id: testWatcherId })];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    removeError_1 = _a.sent();
                    console.log('Error removing test watcher (expected):', removeError_1);
                    return [3 /*break*/, 9];
                case 9:
                    // If we still don't know the status, assume prompt
                    if (backgroundLocationPermission.value === 'prompt') {
                        backgroundLocationPermission.value = 'prompt';
                    }
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _a.sent();
                    console.log('Background location permission check failed:', error_1);
                    backgroundLocationPermission.value = 'prompt';
                    return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 13];
                case 12:
                    backgroundLocationPermission.value = 'denied'; // Not available on web
                    _a.label = 13;
                case 13:
                    console.log('Permission status:', {
                        location: locationPermission.value,
                        backgroundLocation: backgroundLocationPermission.value
                    });
                    return [3 /*break*/, 16];
                case 14:
                    error_2 = _a.sent();
                    console.error('Error checking permissions:', error_2);
                    return [3 /*break*/, 16];
                case 15:
                    isCheckingPermissions.value = false;
                    return [7 /*endfinally*/];
                case 16: return [2 /*return*/];
            }
        });
    }); };
    // Request location permission
    var requestLocationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var status_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Geolocation.requestPermissions()];
                case 1:
                    status_1 = _a.sent();
                    locationPermission.value = status_1.location || 'denied';
                    return [2 /*return*/, hasLocationPermission.value];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error requesting location permission:', error_3);
                    locationPermission.value = 'denied';
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Request background location permission
    var requestBackgroundLocationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var watcherId, removeError_2, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!Capacitor.isNativePlatform()) {
                        console.warn('Background location is not available on web platform');
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, BackgroundGeolocation.addWatcher({
                            backgroundMessage: "Requesting background location permission",
                            backgroundTitle: "GPS Drawing",
                            requestPermissions: true,
                            stale: false,
                            distanceFilter: 10
                        }, function (location, error) {
                            if (error) {
                                console.error('Background location permission error:', error);
                                if (error.code === "NOT_AUTHORIZED") {
                                    backgroundLocationPermission.value = 'denied';
                                }
                            }
                            else if (location) {
                                backgroundLocationPermission.value = 'granted';
                            }
                        })];
                case 2:
                    watcherId = _a.sent();
                    // Wait a bit for the permission request to be processed
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 3:
                    // Wait a bit for the permission request to be processed
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, BackgroundGeolocation.removeWatcher({ id: watcherId })];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    removeError_2 = _a.sent();
                    console.log('Error removing background watcher (expected):', removeError_2);
                    return [3 /*break*/, 7];
                case 7: 
                // Re-check permissions after the request
                return [4 /*yield*/, checkPermissions()];
                case 8:
                    // Re-check permissions after the request
                    _a.sent();
                    return [2 /*return*/, hasBackgroundLocationPermission.value];
                case 9:
                    error_4 = _a.sent();
                    console.error('Error requesting background location permission:', error_4);
                    backgroundLocationPermission.value = 'denied';
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    // Open app settings (for manual permission enabling)
    var openAppSettings = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_5;
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
                    error_5 = _a.sent();
                    console.error('Error opening app settings:', error_5);
                    // Fallback: show instructions to user
                    alert('Please go to your device settings and enable location permissions for this app.');
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    // On web, show instructions
                    alert('Please enable location permissions in your browser settings and refresh the page.');
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Initialize permissions check
    var initPermissions = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkPermissions()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        // State
        locationPermission: locationPermission,
        backgroundLocationPermission: backgroundLocationPermission,
        isCheckingPermissions: isCheckingPermissions,
        // Computed
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
    };
}
