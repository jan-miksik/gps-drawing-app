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
// Global buffer for smoothing - stores recent points
var smoothingBuffer = [];
export var smoothGPSPoints = function (newPoint) {
    var smoothingWindow = GPS_CONFIG.value.SMOOTHING_WINDOW;
    // If smoothing is disabled (window size 1 or less), return the point as-is
    if (smoothingWindow <= 1) {
        return {
            lat: Math.round(newPoint.lat * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
            lon: Math.round(newPoint.lon * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
            timestamp: newPoint.timestamp,
            accuracy: newPoint.accuracy
        };
    }
    // Add new point to buffer
    smoothingBuffer.push(newPoint);
    // Keep only the last N points in the buffer
    if (smoothingBuffer.length > smoothingWindow) {
        smoothingBuffer = smoothingBuffer.slice(-smoothingWindow);
    }
    // If we don't have enough points for smoothing, return the original point
    if (smoothingBuffer.length < 2) {
        return {
            lat: Math.round(newPoint.lat * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
            lon: Math.round(newPoint.lon * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
            timestamp: newPoint.timestamp,
            accuracy: newPoint.accuracy
        };
    }
    // Calculate weighted average based on recency and accuracy
    var totalWeight = 0;
    var weightedLat = 0;
    var weightedLon = 0;
    var weightedAccuracy = 0;
    for (var i = 0; i < smoothingBuffer.length; i++) {
        var point = smoothingBuffer[i];
        var recencyWeight = i + 1; // More recent points get higher weight
        var accuracyWeight = 1 / Math.max(point.accuracy || 999, 1); // Better accuracy gets higher weight
        var weight = recencyWeight * accuracyWeight;
        weightedLat += point.lat * weight;
        weightedLon += point.lon * weight;
        weightedAccuracy += (point.accuracy || 999) * weight;
        totalWeight += weight;
    }
    // Calculate final smoothed coordinates
    var smoothedLat = weightedLat / totalWeight;
    var smoothedLon = weightedLon / totalWeight;
    var smoothedAccuracy = weightedAccuracy / totalWeight;
    return {
        lat: Math.round(smoothedLat * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
        lon: Math.round(smoothedLon * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
        timestamp: newPoint.timestamp,
        accuracy: Math.round(smoothedAccuracy)
    };
};
export var roundCoordinates = function (lat, lon) {
    var precision = Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION);
    return {
        lat: Math.round(lat * precision) / precision,
        lon: Math.round(lon * precision) / precision
    };
};
// Function to clear the smoothing buffer (call this when starting a new drawing)
export var clearSmoothingBuffer = function () {
    smoothingBuffer = [];
};
