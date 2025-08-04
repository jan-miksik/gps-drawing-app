import { ref, computed } from 'vue';
import type { Point, GPSSignalQuality } from '../types/gps';
import { GPS_CONFIG } from '../constants/gpsConstants';
import { calculateDistance, smoothGPSPoints } from '../utils/gpsUtils';

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
    const accuracy = newPoint?.accuracy || 999;

    // Check accuracy threshold for all points (including first point)
    if (accuracy > GPS_CONFIG.value.ACCURACY_THRESHOLD) {
      return false;
    }

    if (points.length === 0) {
      return true;
    }

    const lastPoint = points[points.length - 1];
    const distance = calculateDistance(lastPoint.lat, lastPoint.lon, newPoint.lat, newPoint.lon);
    const timeDiff = newPoint.timestamp - lastPoint.timestamp;

    // Check distance threshold
    if (distance < GPS_CONFIG.value.DISTANCE_THRESHOLD) {
      return false;
    }

    // Check time interval
    if (timeDiff < GPS_CONFIG.value.MIN_TIME_INTERVAL) {
      return false;
    }

    return true;
  };

  const processNewPoint = (newPoint: Point): Point => {
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