import { calculateDistance } from './gpsUtils';
export var anonymizePoint = function (point, origin) {
    // Convert to relative coordinates (preserving distances)
    return {
        lat: point.lat - origin.lat,
        lon: point.lon - origin.lon,
        timestamp: point.timestamp, // Keep original timestamp
        accuracy: point.accuracy
    };
};
export var anonymizePoints = function (points, origin) {
    if (points.length === 0)
        return points;
    return points.map(function (point) { return anonymizePoint(point, origin); });
};
export var getDistanceFromOrigin = function (point, origin, isAnonymized) {
    if (!origin) {
        return 0;
    }
    if (isAnonymized) {
        // Point is already anonymized (relative coords), convert back to real coords for distance calc
        var realLat = point.lat + origin.lat;
        var realLon = point.lon + origin.lon;
        return calculateDistance(origin.lat, origin.lon, realLat, realLon);
    }
    else {
        // Point is in real coordinates
        return calculateDistance(origin.lat, origin.lon, point.lat, point.lon);
    }
};
// Calculate X (east-west) distance in meters from origin
export var getXDistanceFromOrigin = function (point, origin, isAnonymized) {
    if (!origin) {
        return 0;
    }
    var targetLon;
    if (isAnonymized) {
        // Point is already anonymized (relative coords), convert back to real coords
        targetLon = point.lon + origin.lon;
    }
    else {
        // Point is in real coordinates
        targetLon = point.lon;
    }
    // Calculate distance along longitude (X-axis) keeping latitude constant
    var distance = calculateDistance(origin.lat, origin.lon, origin.lat, targetLon);
    // Return positive for east, negative for west
    return targetLon >= origin.lon ? distance : -distance;
};
// Calculate Y (north-south) distance in meters from origin
export var getYDistanceFromOrigin = function (point, origin, isAnonymized) {
    if (!origin) {
        return 0;
    }
    var targetLat;
    if (isAnonymized) {
        // Point is already anonymized (relative coords), convert back to real coords
        targetLat = point.lat + origin.lat;
    }
    else {
        // Point is in real coordinates
        targetLat = point.lat;
    }
    // Calculate distance along latitude (Y-axis) keeping longitude constant
    var distance = calculateDistance(origin.lat, origin.lon, targetLat, origin.lon);
    // Return positive for north, negative for south
    return targetLat >= origin.lat ? distance : -distance;
};
export var createAnonymizationOrigin = function (points) {
    if (points.length === 0)
        return null;
    // Use the first point as the origin for anonymization
    var firstPoint = points[0];
    return {
        lat: firstPoint.lat,
        lon: firstPoint.lon
    };
};
