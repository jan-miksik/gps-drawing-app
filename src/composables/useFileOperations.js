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
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { FILE_CONFIG } from '../constants/gpsConstants';
import { anonymizePoints, getDistanceFromOrigin } from '../utils/coordinateUtils';
export function useFileOperations() {
    var _this = this;
    var savePointsToFile = function (points) { return __awaiter(_this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Filesystem.writeFile({
                            path: FILE_CONFIG.FILE_NAME,
                            data: JSON.stringify(points),
                            directory: Directory.Data,
                            encoding: Encoding.UTF8,
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.error('Failed to save GPS points to file', e_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var loadPointsFromFile = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, dataString, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Filesystem.readFile({
                            path: FILE_CONFIG.FILE_NAME,
                            directory: Directory.Data,
                            encoding: Encoding.UTF8,
                        })];
                case 1:
                    result = _a.sent();
                    dataString = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
                    return [2 /*return*/, JSON.parse(dataString)];
                case 2:
                    e_2 = _a.sent();
                    console.warn('No saved file found. Starting fresh.', e_2);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var exportPoints = function (points, isAnonymized, anonymizationOrigin) { return __awaiter(_this, void 0, void 0, function () {
        var currentTime, timestamp, displayPoints, dataToExport, exportData, suffix, fileName, exportType, externalError_1, exportType, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 6, , 7]);
                    if (points.length === 0) {
                        alert('No GPS points to export');
                        return [2 /*return*/];
                    }
                    currentTime = new Date();
                    timestamp = currentTime.toISOString().replace(/[:.]/g, '-').split('T')[0];
                    displayPoints = isAnonymized && anonymizationOrigin
                        ? anonymizePoints(points, anonymizationOrigin)
                        : points;
                    dataToExport = __assign(__assign({ exportDate: currentTime.toISOString(), totalPoints: points.length, isAnonymized: isAnonymized }, (isAnonymized && anonymizationOrigin && {
                        anonymizationOrigin: anonymizationOrigin,
                        note: "Coordinates are anonymized - showing relative distances from first point"
                    })), { points: displayPoints.map(function (point, index) { return (__assign(__assign({ index: index + 1, latitude: point.lat, longitude: point.lon }, (isAnonymized && anonymizationOrigin && {
                            distanceFromOrigin: getDistanceFromOrigin(point, anonymizationOrigin, isAnonymized)
                        })), { timestamp: point.timestamp, time: new Date(point.timestamp).toISOString() })); }) });
                    exportData = JSON.stringify(dataToExport, null, 2);
                    suffix = isAnonymized ? '_anonymized' : '';
                    fileName = "gps_export".concat(suffix, "_").concat(timestamp, ".json");
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, Filesystem.writeFile({
                            path: fileName,
                            data: exportData,
                            directory: Directory.ExternalStorage,
                            encoding: Encoding.UTF8,
                        })];
                case 2:
                    _c.sent();
                    exportType = isAnonymized ? 'anonymized' : 'real GPS';
                    alert("\u2705 Exported ".concat(points.length, " ").concat(exportType, " points to Downloads/").concat(fileName));
                    return [3 /*break*/, 5];
                case 3:
                    externalError_1 = _c.sent();
                    console.warn('External storage failed, trying Documents:', externalError_1);
                    return [4 /*yield*/, Filesystem.writeFile({
                            path: fileName,
                            data: exportData,
                            directory: Directory.Documents,
                            encoding: Encoding.UTF8,
                        })];
                case 4:
                    _c.sent();
                    exportType = isAnonymized ? 'anonymized' : 'real GPS';
                    alert("\u2705 Exported ".concat(points.length, " ").concat(exportType, " points to Documents/").concat(fileName));
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_1 = _c.sent();
                    console.error('Export failed:', error_1);
                    if ((_a = error_1.message) === null || _a === void 0 ? void 0 : _a.includes('permission')) {
                        alert('❌ Export failed: Storage permission denied. Please check app permissions.');
                    }
                    else if ((_b = error_1.message) === null || _b === void 0 ? void 0 : _b.includes('space')) {
                        alert('❌ Export failed: Not enough storage space.');
                    }
                    else {
                        alert("\u274C Export failed: ".concat(error_1.message || 'Unknown error', ". Check console for details."));
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var clearAllData = function () { return __awaiter(_this, void 0, void 0, function () {
        var e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Filesystem.deleteFile({
                            path: FILE_CONFIG.FILE_NAME,
                            directory: Directory.Data,
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_3 = _a.sent();
                    console.warn('No file to delete or delete failed:', e_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return {
        savePointsToFile: savePointsToFile,
        loadPointsFromFile: loadPointsFromFile,
        exportPoints: exportPoints,
        clearAllData: clearAllData
    };
}
