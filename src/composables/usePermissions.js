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
import { useDevLogs } from './useDevLogs';
var BackgroundGeolocation = registerPlugin('BackgroundGeolocation');
var locationPermission = ref(null);
export function usePermissions() {
    var _this = this;
    var logError = useDevLogs().logError;
    var isCheckingPermissions = ref(false);
    // Tap debouncing for settings button
    var lastTapTime = 0;
    // Computed properties
    var hasLocationPermission = computed(function () { return locationPermission.value === 'granted'; });
    // const canTrackGPS = computed(() => hasLocationPermission.value);
    // Check current permissions
    var checkHasLocationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var locationStatus, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    isCheckingPermissions.value = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, Geolocation.checkPermissions()];
                case 2:
                    locationStatus = _a.sent();
                    locationPermission.value = locationStatus.location;
                    return [2 /*return*/, locationPermission.value === 'granted'];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error checking permissions:', error_1);
                    return [2 /*return*/, false];
                case 4:
                    isCheckingPermissions.value = false;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Request location permission
    var requestLocationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var timeoutPromise, status_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    timeoutPromise = new Promise(function (_, reject) {
                        setTimeout(function () { return reject(new Error('Permission request timeout after 15 seconds')); }, 15000);
                    });
                    return [4 /*yield*/, Promise.race([
                            Geolocation.requestPermissions(),
                            timeoutPromise
                        ])];
                case 1:
                    status_1 = _a.sent();
                    locationPermission.value = status_1.location || 'denied';
                    return [2 /*return*/, locationPermission.value === 'granted'];
                case 2:
                    error_2 = _a.sent();
                    // Set to denied on any error
                    locationPermission.value = 'denied';
                    logError('Error requesting location permission', error_2);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Open app settings (for manual permission enabling)
    var openAppSettings = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
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
                    error_3 = _a.sent();
                    logError('Error opening app settings', error_3);
                    alert('Please go to your device settings > Apps > GPS Pen > Permissions and enable location access.');
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 6];
                case 5:
                    alert('Please enable location permissions in your browser settings.');
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleOpenAppSettings = function () { return __awaiter(_this, void 0, void 0, function () {
        var now, error_4;
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
                    error_4 = _a.sent();
                    logError('Error opening app settings', error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return {
        // State
        locationPermission: locationPermission,
        isCheckingPermissions: isCheckingPermissions,
        // Computed properties
        hasLocationPermission: hasLocationPermission,
        // canTrackGPS,
        // Methods
        checkHasLocationPermission: checkHasLocationPermission,
        requestLocationPermission: requestLocationPermission,
        openAppSettings: openAppSettings,
        // Permission handlers
        handleOpenAppSettings: handleOpenAppSettings,
    };
}
