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
export var smoothGPSPoints = function (newPoint) {
    // Smoothing disabled - return the new point with precision rounding
    return {
        lat: Math.round(newPoint.lat * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
        lon: Math.round(newPoint.lon * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
        timestamp: newPoint.timestamp,
        accuracy: newPoint.accuracy
    };
};
export var roundCoordinates = function (lat, lon) {
    var precision = Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION);
    return {
        lat: Math.round(lat * precision) / precision,
        lon: Math.round(lon * precision) / precision
    };
};
