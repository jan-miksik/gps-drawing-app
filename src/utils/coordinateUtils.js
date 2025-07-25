import { calculateDistance } from './gpsUtils';
export var anonymizePoint = function (point, origin) {
    // Convert to relative coordinates (preserving distances)
    return {
        lat: point.lat - origin.lat,
        lon: point.lon - origin.lon,
        timestamp: point.timestamp // Keep original timestamp
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
