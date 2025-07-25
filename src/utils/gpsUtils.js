var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { GPS_CONFIG } from '../constants/gpsConstants';
// Distance calculation function (Haversine formula)
export var calculateDistance = function (lat1, lon1, lat2, lon2) {
    var R = 6371000; // Earth's radius in meters
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
};
export var getSignalQuality = function (accuracy) {
    if (accuracy <= 5)
        return 'excellent';
    if (accuracy <= 10)
        return 'good';
    if (accuracy <= 20)
        return 'fair';
    return 'poor';
};
export var smoothGPSPoints = function (points, newPoint) {
    if (points.length < GPS_CONFIG.SMOOTHING_WINDOW) {
        return newPoint;
    }
    // Get the last N points including the new one
    var recentPoints = __spreadArray(__spreadArray([], points.slice(-GPS_CONFIG.SMOOTHING_WINDOW + 1), true), [newPoint], false);
    // Calculate moving average
    var avgLat = recentPoints.reduce(function (sum, p) { return sum + p.lat; }, 0) / recentPoints.length;
    var avgLon = recentPoints.reduce(function (sum, p) { return sum + p.lon; }, 0) / recentPoints.length;
    return {
        lat: Math.round(avgLat * Math.pow(10, GPS_CONFIG.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.POINTS_PRECISION),
        lon: Math.round(avgLon * Math.pow(10, GPS_CONFIG.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.POINTS_PRECISION),
        timestamp: newPoint.timestamp
    };
};
export var roundCoordinates = function (lat, lon) {
    var precision = Math.pow(10, GPS_CONFIG.POINTS_PRECISION);
    return {
        lat: Math.round(lat * precision) / precision,
        lon: Math.round(lon * precision) / precision
    };
};
