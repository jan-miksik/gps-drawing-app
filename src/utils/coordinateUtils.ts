import type { Point, AnonymizationOrigin } from '../types/gps';
import { calculateDistance } from './gpsUtils';

export const anonymizePoint = (point: Point, origin: AnonymizationOrigin): Point => {
  // Convert to relative coordinates (preserving distances)
  return {
    lat: point.lat - origin.lat,
    lon: point.lon - origin.lon,
    timestamp: point.timestamp // Keep original timestamp
  };
};

export const anonymizePoints = (points: Point[], origin: AnonymizationOrigin): Point[] => {
  if (points.length === 0) return points;
  return points.map(point => anonymizePoint(point, origin));
};

export const getDistanceFromOrigin = (
  point: Point, 
  origin: AnonymizationOrigin | null, 
  isAnonymized: boolean
): number => {
  if (!origin) {
    return 0;
  }
  
  if (isAnonymized) {
    // Point is already anonymized (relative coords), convert back to real coords for distance calc
    const realLat = point.lat + origin.lat;
    const realLon = point.lon + origin.lon;
    return calculateDistance(origin.lat, origin.lon, realLat, realLon);
  } else {
    // Point is in real coordinates
    return calculateDistance(origin.lat, origin.lon, point.lat, point.lon);
  }
};

export const createAnonymizationOrigin = (points: Point[]): AnonymizationOrigin | null => {
  if (points.length === 0) return null;
  
  // Use the first point as the origin for anonymization
  const firstPoint = points[0];
  return {
    lat: firstPoint.lat,
    lon: firstPoint.lon
  };
}; 