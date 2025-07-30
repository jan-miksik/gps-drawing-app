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

export const smoothGPSPoints = (newPoint: Point): Point => {
  // Smoothing disabled - return the new point with precision rounding
  return {
    lat: Math.round(newPoint.lat * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
    lon: Math.round(newPoint.lon * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
    timestamp: newPoint.timestamp,
    accuracy: newPoint.accuracy
  };
};

export const roundCoordinates = (lat: number, lon: number): { lat: number; lon: number } => {
  const precision = Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION);
  return {
    lat: Math.round(lat * precision) / precision,
    lon: Math.round(lon * precision) / precision
  };
}; 