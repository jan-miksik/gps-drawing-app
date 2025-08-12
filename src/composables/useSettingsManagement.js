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
import { useDevLogs } from './useDevLogs';
import { updateGPSConfig, updateCanvasConfig } from '../constants/gpsConstants';
import { useSettingsPersistence } from './useSettingsPersistence';
export function useSettingsManagement(settings, redrawCanvas) {
    var _this = this;
    var logInfo = useDevLogs().logInfo;
    var _a = useSettingsPersistence(), saveSettings = _a.saveSettings, loadSettings = _a.loadSettings, resetSettings = _a.resetSettings;
    var handleSettingsSave = function (newSettings) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
                    // Save settings to persistent storage
                    return [4 /*yield*/, saveSettings(newSettings)];
                case 1:
                    // Save settings to persistent storage
                    _a.sent();
                    // Redraw canvas to apply visual changes immediately
                    redrawCanvas();
                    logInfo('Settings updated and saved', newSettings);
                    return [2 /*return*/];
            }
        });
    }); };
    var loadPersistedSettings = function () { return __awaiter(_this, void 0, void 0, function () {
        var savedSettings;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSettings()];
                case 1:
                    savedSettings = _a.sent();
                    if (savedSettings) {
                        handleSettingsSave(savedSettings);
                        logInfo('Settings loaded from persistence', savedSettings);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var resetToDefaults = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resetSettings()];
                case 1:
                    _a.sent();
                    logInfo('Settings reset to defaults');
                    return [2 /*return*/];
            }
        });
    }); };
    return {
        handleSettingsSave: handleSettingsSave,
        loadPersistedSettings: loadPersistedSettings,
        resetToDefaults: resetToDefaults
    };
}
