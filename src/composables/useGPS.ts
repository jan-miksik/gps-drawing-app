import { ref, computed } from 'vue';
// import { Geolocation } from '@capacitor/geolocation';
// import { Capacitor } from '@capacitor/core';
import type { Point, GPSSignalQuality } from '../types/gps';
import { GPS_CONFIG } from '../constants/gpsConstants';
import { calculateDistance, smoothGPSPoints } from '../utils/gpsUtils';
import { useDevLogs } from './useDevLogs';
const { logInfo } = useDevLogs();

export function useGPS() {
  // GPS state
  const currentLat = ref(0);
  const currentLon = ref(0);
  const currentAccuracy = ref<number | null>(null);
  const gpsSignalQuality = ref<GPSSignalQuality>('unknown');
  const isGPSActive = ref(false);
  
  // Internal state
  let watchId: string | null = null;
  
  // Computed properties
  const isTracking = computed(() => isGPSActive.value && watchId !== null);

  // Note: Capacitor handles cleanup automatically when app terminates
  // No manual cleanup needed for app state listeners or GPS watchers

  const shouldAddPoint = (points: Point[], newPoint: Point): boolean => {
    if (points.length === 0) {
      console.log('Adding first GPS point');
      return true;
    }

    const lastPoint = points[points.length - 1];
    const distance = calculateDistance(lastPoint.lat, lastPoint.lon, newPoint.lat, newPoint.lon);
    const timeDiff = newPoint.timestamp - lastPoint.timestamp;
    const accuracy = newPoint?.accuracy || 999;

    // Check accuracy threshold
    if (accuracy > GPS_CONFIG.value.ACCURACY_THRESHOLD) {
      return false;
    }

    // Check distance threshold
    if (distance < GPS_CONFIG.value.DISTANCE_THRESHOLD) {
      console.log(`Skipping point - too close: ${distance.toFixed(1)}m (threshold: ${GPS_CONFIG.value.DISTANCE_THRESHOLD}m)`);
      return false;
    }

    // Check time interval
    if (timeDiff < GPS_CONFIG.value.MIN_TIME_INTERVAL) {
      console.log(`Skipping point - too soon: ${timeDiff}ms (threshold: ${GPS_CONFIG.value.MIN_TIME_INTERVAL}ms)`);
      return false;
    }

    console.log(`Adding GPS point - distance: ${distance.toFixed(1)}m, time: ${timeDiff}ms`);
    return true;
  };

  const processNewPoint = (newPoint: Point): Point => {
    logInfo('processNewPoint', newPoint);
    return smoothGPSPoints(newPoint);
  };

  return {
    // State
    currentLat,
    currentLon,
    currentAccuracy,
    gpsSignalQuality,
    isGPSActive,
    
    // Computed
    isTracking,
    
    // Methods
    // startGPSTracking,
    // stopGPSTracking,
    shouldAddPoint,
    processNewPoint,
  };
} 