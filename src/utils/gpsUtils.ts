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

// Global buffer for smoothing - stores recent points
let smoothingBuffer: Point[] = [];

export const smoothGPSPoints = (newPoint: Point): Point => {
  const smoothingWindow = GPS_CONFIG.value.SMOOTHING_WINDOW;
  
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
  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLon = 0;
  let weightedAccuracy = 0;

  for (let i = 0; i < smoothingBuffer.length; i++) {
    const point = smoothingBuffer[i];
    const recencyWeight = i + 1; // More recent points get higher weight
    const accuracyWeight = 1 / Math.max(point.accuracy || 999, 1); // Better accuracy gets higher weight
    const weight = recencyWeight * accuracyWeight;
    
    weightedLat += point.lat * weight;
    weightedLon += point.lon * weight;
    weightedAccuracy += (point.accuracy || 999) * weight;
    totalWeight += weight;
  }

  // Calculate final smoothed coordinates
  const smoothedLat = weightedLat / totalWeight;
  const smoothedLon = weightedLon / totalWeight;
  const smoothedAccuracy = weightedAccuracy / totalWeight;

  return {
    lat: Math.round(smoothedLat * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
    lon: Math.round(smoothedLon * Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION)) / Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION),
    timestamp: newPoint.timestamp,
    accuracy: Math.round(smoothedAccuracy)
  };
};

export const roundCoordinates = (lat: number, lon: number): { lat: number; lon: number } => {
  const precision = Math.pow(10, GPS_CONFIG.value.POINTS_PRECISION);
  return {
    lat: Math.round(lat * precision) / precision,
    lon: Math.round(lon * precision) / precision
  };
};

// Function to clear the smoothing buffer (call this when starting a new drawing)
export const clearSmoothingBuffer = (): void => {
  smoothingBuffer = [];
}; 