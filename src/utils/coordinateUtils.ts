import type { Point, AnonymizationOrigin } from '../types/gps';
import { calculateDistance } from './gpsUtils';

export const anonymizePoint = (point: Point, origin: AnonymizationOrigin): Point => {
  // Convert to relative coordinates (preserving distances)
  return {
    lat: point.lat - origin.lat,
    lon: point.lon - origin.lon,
    timestamp: point.timestamp, // Keep original timestamp
    accuracy: point.accuracy
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

// Calculate X (east-west) distance in meters from origin
export const getXDistanceFromOrigin = (
  point: Point, 
  origin: AnonymizationOrigin | null, 
  isAnonymized: boolean
): number => {
  if (!origin) {
    return 0;
  }
  
  let targetLon: number;
  
  if (isAnonymized) {
    // Point is already anonymized (relative coords), convert back to real coords
    targetLon = point.lon + origin.lon;
  } else {
    // Point is in real coordinates
    targetLon = point.lon;
  }
  
  // Calculate distance along longitude (X-axis) keeping latitude constant
  const distance = calculateDistance(origin.lat, origin.lon, origin.lat, targetLon);
  
  // Return positive for east, negative for west
  return targetLon >= origin.lon ? distance : -distance;
};

// Calculate Y (north-south) distance in meters from origin
export const getYDistanceFromOrigin = (
  point: Point, 
  origin: AnonymizationOrigin | null, 
  isAnonymized: boolean
): number => {
  if (!origin) {
    return 0;
  }
  
  let targetLat: number;
  
  if (isAnonymized) {
    // Point is already anonymized (relative coords), convert back to real coords
    targetLat = point.lat + origin.lat;
  } else {
    // Point is in real coordinates
    targetLat = point.lat;
  }
  
  // Calculate distance along latitude (Y-axis) keeping longitude constant
  const distance = calculateDistance(origin.lat, origin.lon, targetLat, origin.lon);
  
  // Return positive for north, negative for south
  return targetLat >= origin.lat ? distance : -distance;
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