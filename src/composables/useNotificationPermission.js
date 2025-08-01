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
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { PushNotifications } from '@capacitor/push-notifications';
import { useDevLogs } from './useDevLogs';
var _a = useDevLogs(), logInfo = _a.logInfo, logWarn = _a.logWarn, logError = _a.logError;
export function useNotificationPermission() {
    var _this = this;
    var notificationPermission = ref('not-needed');
    var isRequestingNotificationPermission = ref(false);
    var needsNotificationPermission = ref(false);
    var checkIfNeedsNotificationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var info, osVersion, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (Capacitor.getPlatform() !== 'android') {
                        needsNotificationPermission.value = false;
                        logInfo('Not Android platform, notification permission not needed');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Device.getInfo()];
                case 2:
                    info = _a.sent();
                    osVersion = parseInt(info.osVersion);
                    needsNotificationPermission.value = osVersion >= 13; // Android 13 = API 33
                    logInfo('Device info checked', {
                        platform: Capacitor.getPlatform(),
                        osVersion: info.osVersion,
                        parsedVersion: osVersion,
                        needsPermission: needsNotificationPermission.value
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    logError('Error getting device info', error_1);
                    needsNotificationPermission.value = false;
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var checkNotificationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkIfNeedsNotificationPermission()];
                case 1:
                    _a.sent();
                    if (!needsNotificationPermission.value) {
                        notificationPermission.value = 'not-needed';
                        logInfo('Notification permission not needed on this platform');
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, PushNotifications.checkPermissions()];
                case 3:
                    result = _a.sent();
                    notificationPermission.value = result.receive === 'granted' ? 'granted' : 'denied';
                    logInfo('Notification permission status checked', {
                        status: notificationPermission.value,
                        platform: Capacitor.getPlatform(),
                        needsPermission: needsNotificationPermission.value
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    logError('Error checking notification permission', error_2);
                    notificationPermission.value = 'denied';
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var requestNotificationPermission = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, granted, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, checkIfNeedsNotificationPermission()];
                case 1:
                    _a.sent();
                    if (!needsNotificationPermission.value) {
                        logInfo('Notification permission not needed on this platform');
                        return [2 /*return*/, true];
                    }
                    if (notificationPermission.value === 'granted') {
                        logInfo('Notification permission already granted');
                        return [2 /*return*/, true];
                    }
                    isRequestingNotificationPermission.value = true;
                    logInfo('Showing notification permission request dialog...');
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, 5, 6]);
                    return [4 /*yield*/, PushNotifications.requestPermissions()];
                case 3:
                    result = _a.sent();
                    granted = result.receive === 'granted';
                    notificationPermission.value = granted ? 'granted' : 'denied';
                    if (granted) {
                        logInfo('Notification permission granted');
                    }
                    else {
                        logWarn('Notification permission denied - background GPS may not work properly');
                    }
                    return [2 /*return*/, granted];
                case 4:
                    error_3 = _a.sent();
                    logError('Error requesting notification permission', error_3);
                    notificationPermission.value = 'denied';
                    return [2 /*return*/, false];
                case 5:
                    isRequestingNotificationPermission.value = false;
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var hasNotificationPermission = computed(function () {
        return notificationPermission.value === 'granted' || !needsNotificationPermission.value;
    });
    return {
        // State
        notificationPermission: notificationPermission,
        isRequestingNotificationPermission: isRequestingNotificationPermission,
        needsNotificationPermission: needsNotificationPermission,
        // Computed
        hasNotificationPermission: hasNotificationPermission,
        // Methods
        checkNotificationPermission: checkNotificationPermission,
        requestNotificationPermission: requestNotificationPermission,
    };
}
