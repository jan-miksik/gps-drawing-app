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
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { FILE_CONFIG } from '../constants/gpsConstants';
import { anonymizePoints } from '../utils/coordinateUtils';
import { project, calculateBounds } from '../utils/canvasUtils';
export function useFileOperations() {
    var _this = this;
    var savePointsToFile = function (points_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([points_1], args_1, true), void 0, function (points, append) {
            var dataToSave, existing, e_1;
            if (append === void 0) { append = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        dataToSave = void 0;
                        if (!append) return [3 /*break*/, 2];
                        return [4 /*yield*/, loadPointsFromFile()];
                    case 1:
                        existing = _a.sent();
                        dataToSave = __spreadArray(__spreadArray([], existing, true), points, true);
                        return [3 /*break*/, 3];
                    case 2:
                        // Replace all points
                        dataToSave = points;
                        _a.label = 3;
                    case 3: return [4 /*yield*/, Filesystem.writeFile({
                            path: FILE_CONFIG.FILE_NAME,
                            data: JSON.stringify(dataToSave),
                            directory: Directory.Data,
                            encoding: Encoding.UTF8,
                        })];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        console.error('Failed to save GPS points to file', e_1);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
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
    var exportPoints = function (points, coordinateType, anonymizationOrigin) { return __awaiter(_this, void 0, void 0, function () {
        var currentTime, timestamp, isAnonymized_1, displayPoints, dataToExport, exportData, suffix, fileName, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (points.length === 0) {
                        alert('No GPS points to export');
                        return [2 /*return*/];
                    }
                    currentTime = new Date();
                    timestamp = currentTime.toISOString().replace(/[:.]/g, '-').split('T')[0];
                    isAnonymized_1 = coordinateType === 'relative';
                    displayPoints = isAnonymized_1 && anonymizationOrigin
                        ? anonymizePoints(points, anonymizationOrigin)
                        : points;
                    dataToExport = __assign(__assign({ exportDate: currentTime.toISOString(), totalPoints: points.length, coordinateType: coordinateType, isAnonymized: isAnonymized_1 }, (isAnonymized_1 && anonymizationOrigin && {
                        note: "Coordinates are anonymized - showing relative x,y coordinates from first point"
                    })), { points: displayPoints.map(function (point, index) { return (__assign(__assign(__assign({ index: index + 1 }, (!isAnonymized_1 && {
                            latitude: point.lat,
                            longitude: point.lon
                        })), (isAnonymized_1 && {
                            x: point.lon, // Relative x coordinate (longitude offset - horizontal)
                            y: point.lat // Relative y coordinate (latitude offset - vertical)
                        })), { timestamp: point.timestamp, time: new Date(point.timestamp).toISOString(), accuracy: point.accuracy !== undefined ? point.accuracy : null })); }) });
                    exportData = JSON.stringify(dataToExport, null, 2);
                    suffix = isAnonymized_1 ? '_anonymized' : '_exact';
                    fileName = "gps_export".concat(suffix, "_").concat(timestamp, ".json");
                    // Try multiple export methods for data
                    return [4 /*yield*/, tryMultipleExportMethods(fileName, exportData, 'application/json', points.length, isAnonymized_1)];
                case 1:
                    // Try multiple export methods for data
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Data export failed:', error_1);
                    handleExportError(error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var exportCanvasAsImage = function (canvas, points, isAnonymized, anonymizationOrigin) { return __awaiter(_this, void 0, void 0, function () {
        var currentTime, timestamp, fileName, ctx, dpr, logicalWidth, logicalHeight, svgContent, mimeType, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    currentTime = new Date();
                    timestamp = currentTime.toISOString().replace(/[:.]/g, '-').split('T')[0];
                    fileName = "gps_drawing_".concat(timestamp, ".svg");
                    ctx = canvas.getContext('2d');
                    if (!ctx) {
                        throw new Error('Failed to get canvas context');
                    }
                    dpr = window.devicePixelRatio || 1;
                    logicalWidth = canvas.width / dpr;
                    logicalHeight = canvas.height / dpr;
                    svgContent = generateSVGFromCanvas(canvas, ctx, logicalWidth, logicalHeight, dpr, points, isAnonymized, anonymizationOrigin);
                    mimeType = 'image/svg+xml';
                    // Try multiple export methods for SVG
                    return [4 /*yield*/, tryMultipleExportMethods(fileName, svgContent, mimeType, points.length, isAnonymized)];
                case 1:
                    // Try multiple export methods for SVG
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('SVG export failed:', error_2);
                    handleExportError(error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var tryMultipleExportMethods = function (fileName, content, mimeType, pointCount, isAnonymized) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tryCapacitorShare(fileName, content, pointCount, isAnonymized)];
                case 1:
                    // Method 1: Try Capacitor Share plugin (most reliable for mobile)
                    if (_a.sent()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, tryWebShareWithFile(fileName, content, mimeType, pointCount, isAnonymized)];
                case 2:
                    // Method 2: Try Web Share API with File
                    if (_a.sent()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, tryWebShareWithURL(content, mimeType, pointCount, isAnonymized)];
                case 3:
                    // Method 3: Try Web Share API with URL
                    if (_a.sent()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, tryDownloadLink(fileName, content, mimeType)];
                case 4:
                    // Method 4: Try download link (fallback for web)
                    if (_a.sent()) {
                        return [2 /*return*/];
                    }
                    // Method 5: Save to filesystem (final fallback)
                    return [4 /*yield*/, saveToFilesystem(fileName, content, pointCount, isAnonymized)];
                case 5:
                    // Method 5: Save to filesystem (final fallback)
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var tryCapacitorShare = function (fileName, content, pointCount, isAnonymized) { return __awaiter(_this, void 0, void 0, function () {
        var tempPath, dataToWrite, fileUri, cleanupError_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    // Check if Capacitor Share is available
                    if (typeof Share === 'undefined' || !Share.share) {
                        console.log('Capacitor Share not available');
                        return [2 /*return*/, false];
                    }
                    tempPath = "temp_".concat(fileName);
                    dataToWrite = void 0;
                    dataToWrite = content;
                    return [4 /*yield*/, Filesystem.writeFile({
                            path: tempPath,
                            data: dataToWrite,
                            directory: Directory.Cache,
                            encoding: Encoding.UTF8,
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, Filesystem.getUri({
                            directory: Directory.Cache,
                            path: tempPath
                        })];
                case 2:
                    fileUri = _a.sent();
                    // Share using Capacitor
                    return [4 /*yield*/, Share.share({
                            title: 'GPS Drawing',
                            text: "GPS Drawing (".concat(isAnonymized ? 'anonymized' : 'exact', ") - ").concat(pointCount, " points"),
                            url: fileUri.uri,
                            dialogTitle: 'Share GPS Drawing'
                        })];
                case 3:
                    // Share using Capacitor
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, Filesystem.deleteFile({
                            path: tempPath,
                            directory: Directory.Cache,
                        })];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    cleanupError_1 = _a.sent();
                    console.warn('Failed to clean up temp file:', cleanupError_1);
                    return [3 /*break*/, 7];
                case 7:
                    console.log('Successfully shared via Capacitor Share');
                    return [2 /*return*/, true];
                case 8:
                    error_3 = _a.sent();
                    console.warn('Capacitor Share failed:', error_3);
                    return [2 /*return*/, false];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var tryWebShareWithFile = function (fileName, content, mimeType, pointCount, isAnonymized) { return __awaiter(_this, void 0, void 0, function () {
        var blob, file, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!navigator.share || !navigator.canShare) {
                        console.log('Web Share API not available');
                        return [2 /*return*/, false];
                    }
                    blob = new Blob([content], { type: mimeType });
                    file = new File([blob], fileName, { type: mimeType });
                    if (!navigator.canShare({ files: [file] })) {
                        console.log('Web Share API cannot share this file type');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, navigator.share({
                            title: 'GPS Drawing',
                            text: "GPS Drawing (".concat(isAnonymized ? 'anonymized' : 'exact', ") - ").concat(pointCount, " points"),
                            files: [file]
                        })];
                case 1:
                    _a.sent();
                    console.log('Successfully shared via Web Share API with File');
                    return [2 /*return*/, true];
                case 2:
                    error_4 = _a.sent();
                    if (error_4.name === 'AbortError') {
                        console.log('User cancelled share');
                        return [2 /*return*/, true]; // Consider this a success since user chose to cancel
                    }
                    console.warn('Web Share with File failed:', error_4);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var tryWebShareWithURL = function (content, mimeType, pointCount, isAnonymized) { return __awaiter(_this, void 0, void 0, function () {
        var blob, blobUrl_1, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!navigator.share) {
                        console.log('Web Share API not available');
                        return [2 /*return*/, false];
                    }
                    blob = new Blob([content], { type: mimeType });
                    blobUrl_1 = URL.createObjectURL(blob);
                    return [4 /*yield*/, navigator.share({
                            title: 'GPS Drawing',
                            text: "GPS Drawing (".concat(isAnonymized ? 'anonymized' : 'exact', ") - ").concat(pointCount, " points"),
                            url: blobUrl_1
                        })];
                case 1:
                    _a.sent();
                    // Clean up blob URL after a delay
                    setTimeout(function () {
                        URL.revokeObjectURL(blobUrl_1);
                    }, 1000);
                    console.log('Successfully shared via Web Share API with URL');
                    return [2 /*return*/, true];
                case 2:
                    error_5 = _a.sent();
                    if (error_5.name === 'AbortError') {
                        console.log('User cancelled share');
                        return [2 /*return*/, true];
                    }
                    console.warn('Web Share with URL failed:', error_5);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var tryDownloadLink = function (fileName, content, mimeType) { return __awaiter(_this, void 0, void 0, function () {
        var blob, url_1, link;
        return __generator(this, function (_a) {
            try {
                blob = new Blob([content], { type: mimeType });
                url_1 = URL.createObjectURL(blob);
                link = document.createElement('a');
                link.href = url_1;
                link.download = fileName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                // Clean up
                setTimeout(function () {
                    URL.revokeObjectURL(url_1);
                }, 1000);
                alert("\u2705 Drawing downloaded as ".concat(fileName));
                console.log('Successfully downloaded via download link');
                return [2 /*return*/, true];
            }
            catch (error) {
                console.warn('Download link method failed:', error);
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    }); };
    var saveToFilesystem = function (fileName, content, pointCount, isAnonymized) { return __awaiter(_this, void 0, void 0, function () {
        var dataToWrite, encoding, exportType, externalError_1, exportType;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dataToWrite = content;
                    encoding = Encoding.UTF8;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, Filesystem.writeFile({
                            path: fileName,
                            data: dataToWrite,
                            directory: Directory.ExternalStorage,
                            encoding: encoding,
                        })];
                case 2:
                    _a.sent();
                    exportType = isAnonymized ? 'anonymized' : 'exact';
                    alert("\u2705 Drawing exported to Downloads/".concat(fileName, " (").concat(exportType, ", ").concat(pointCount, " points)"));
                    return [3 /*break*/, 5];
                case 3:
                    externalError_1 = _a.sent();
                    console.warn('External storage failed, trying Documents:', externalError_1);
                    return [4 /*yield*/, Filesystem.writeFile({
                            path: fileName,
                            data: dataToWrite,
                            directory: Directory.Documents,
                            encoding: encoding,
                        })];
                case 4:
                    _a.sent();
                    exportType = isAnonymized ? 'anonymized' : 'exact';
                    alert("\u2705 Drawing exported to Documents/".concat(fileName, " (").concat(exportType, ", ").concat(pointCount, " points)"));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleExportError = function (error) {
        var _a, _b, _c, _d;
        if ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('permission')) {
            alert('❌ Export failed: Storage permission denied. Please check app permissions.');
        }
        else if ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('space')) {
            alert('❌ Export failed: Not enough storage space.');
        }
        else if (((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes('network')) || ((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes('fetch'))) {
            alert('❌ Export failed: Network error. Please check your connection.');
        }
        else {
            alert("\u274C Export failed: ".concat(error.message || 'Unknown error', ". Check console for details."));
        }
    };
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
    var generateSVGFromCanvas = function (_canvas, _ctx, logicalWidth, logicalHeight, _dpr, points, isAnonymized, anonymizationOrigin) {
        // Create SVG header optimized for Google Drive preview
        var svgHeader = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg width=\"".concat(logicalWidth, "\" height=\"").concat(logicalHeight, "\" viewBox=\"0 0 ").concat(logicalWidth, " ").concat(logicalHeight, "\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\">\n  <defs>\n    <style type=\"text/css\">\n      .gps-path { stroke: #ffffff; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }\n      .gps-point { fill: #ffffff; }\n    </style>\n  </defs>\n  <rect width=\"").concat(logicalWidth, "\" height=\"").concat(logicalHeight, "\" fill=\"#000000\"/>");
        // Get display points (anonymized if needed)
        var displayPoints = isAnonymized && anonymizationOrigin
            ? anonymizePoints(points, anonymizationOrigin)
            : points;
        // Calculate bounds for projection
        var bounds = calculateBounds(displayPoints);
        // Generate SVG path from points
        var pathElement = '';
        var lastPointElement = '';
        if (displayPoints.length > 0 && bounds) {
            // Create path for the GPS track
            if (displayPoints.length > 1) {
                var pathData = displayPoints.map(function (point, index) {
                    var _a = project(point, bounds, logicalWidth, logicalHeight), x = _a.x, y = _a.y;
                    return "".concat(index === 0 ? 'M' : 'L', " ").concat(x, " ").concat(y);
                }).join(' ');
                pathElement = "<path d=\"".concat(pathData, "\" class=\"gps-path\"/>");
            }
            // Create circle only for the last point
            if (displayPoints.length > 0) {
                var lastPoint = displayPoints[displayPoints.length - 1];
                var _a = project(lastPoint, bounds, logicalWidth, logicalHeight), x = _a.x, y = _a.y;
                lastPointElement = "<circle cx=\"".concat(x, "\" cy=\"").concat(y, "\" r=\"4\" class=\"gps-point\"/>");
            }
        }
        // Complete SVG content with minimal metadata for better preview
        var svgContent = "".concat(svgHeader, "\n  \n  <!-- GPS Path -->\n  ").concat(pathElement, "\n  \n  <!-- Last GPS Point -->\n  ").concat(lastPointElement, "\n  \n  <!-- Metadata for preview systems -->\n  <metadata>\n    <title>GPS Drawing</title>\n    <description>GPS movement visualization with ").concat(displayPoints.length, " points</description>\n  </metadata>\n</svg>");
        return svgContent;
    };
    return {
        savePointsToFile: savePointsToFile,
        loadPointsFromFile: loadPointsFromFile,
        exportPoints: exportPoints,
        exportCanvasAsImage: exportCanvasAsImage,
        clearAllData: clearAllData
    };
}
