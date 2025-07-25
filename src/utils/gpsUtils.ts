import type { Point, GPSSignalQuality } from '../types/gps';
import { GPS_CONFIG } from '../constants/gpsConstants';

// Distance calculation function (Haversine formula)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
};

export const getSignalQuality = (accuracy: number): GPSSignalQuality => {
  if (accuracy <= 5) return 'excellent';
  if (accuracy <= 10) return 'good';
  if (accuracy <= 20) return 'fair';
  return 'poor';
};

export const smoothGPSPoints = (points: Point[], newPoint: Point): Point => {
  if (points.length < GPS_CONFIG.SMOOTHING_WINDOW) {
    return newPoint;
  }
  
  // Get the last N points including the new one
  const recentPoints = [...points.slice(-GPS_CONFIG.SMOOTHING_WINDOW + 1), newPoint];
  
  // Calculate moving average
  const avgLat = recentPoints.reduce((sum, p) => sum + p.lat, 0) / recentPoints.length;
  const avgLon = recentPoints.reduce((sum, p) => sum + p.lon, 0) / recentPoints.length;
  
  return {
    lat: Math.round(avgLat * Math.pow(10, GPS_CONFIG.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.POINTS_PRECISION),
    lon: Math.round(avgLon * Math.pow(10, GPS_CONFIG.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.POINTS_PRECISION),
    timestamp: newPoint.timestamp
  };
};

export const roundCoordinates = (lat: number, lon: number): { lat: number; lon: number } => {
  const precision = Math.pow(10, GPS_CONFIG.POINTS_PRECISION);
  return {
    lat: Math.round(lat * precision) / precision,
    lon: Math.round(lon * precision) / precision
  };
}; 