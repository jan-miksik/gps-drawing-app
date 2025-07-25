import { ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import type { Point, GPSSignalQuality, GPSPosition } from '../types/gps';
import { GPS_CONFIG } from '../constants/gpsConstants';
import { calculateDistance, getSignalQuality, smoothGPSPoints, roundCoordinates } from '../utils/gpsUtils';

export function useGPS() {
  // GPS state
  const currentLat = ref(0);
  const currentLon = ref(0);
  const currentAccuracy = ref<number | null>(null);
  const gpsSignalQuality = ref<GPSSignalQuality>('unknown');
  
  // Internal state
  let watchId: string | null = null;
  
  // Computed properties
  const isGPSActive = computed(() => watchId !== null);
  
  const startGPSTracking = async (onPointAdded: (point: Point) => void): Promise<void> => {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      if (permissionStatus.location !== 'granted' && permissionStatus.coarseLocation !== 'granted') {
        const requestStatus = await Geolocation.requestPermissions();
        if (requestStatus.location !== 'granted' && requestStatus.coarseLocation !== 'granted') {
          console.error('Location permission denied.');
          return;
        }
      }

      watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: GPS_CONFIG.TIMEOUT,
          maximumAge: GPS_CONFIG.MAXIMUM_AGE
        },
        (position, err) => {
          if (err) {
            console.error('GPS Error:', err.message, err.code);
            gpsSignalQuality.value = 'unknown';
          } else if (position) {
            processGPSPosition(position, onPointAdded);
          }
        }
      );
    } catch (error: any) {
      console.error('Failed to start GPS tracking:', error.message || error);
    }
  };

  const processGPSPosition = (position: GPSPosition, onPointAdded: (point: Point) => void): void => {
    const accuracy = position.coords.accuracy || 999;
    currentAccuracy.value = accuracy;
    gpsSignalQuality.value = getSignalQuality(accuracy);
    
    // Log GPS metadata for debugging
    console.log('GPS Position:', {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      accuracy: accuracy,
      speed: position.coords.speed || 'unknown',
      heading: position.coords.heading || 'unknown',
      quality: gpsSignalQuality.value
    });
    
    // Filter out low-accuracy points
    if (accuracy > GPS_CONFIG.ACCURACY_THRESHOLD) {
      console.warn(`Skipping low-accuracy GPS point: ${accuracy.toFixed(1)}m (threshold: ${GPS_CONFIG.ACCURACY_THRESHOLD}m)`);
      return;
    }
    
    // Round coordinates to specified precision
    const { lat, lon } = roundCoordinates(position.coords.latitude, position.coords.longitude);
    const timestamp = Date.now();

    // Always update current position for display
    currentLat.value = lat;
    currentLon.value = lon;

    // Create new point
    const newPoint: Point = { lat, lon, timestamp };
    onPointAdded(newPoint);
  };

  const stopGPSTracking = (): void => {
    if (watchId) {
      Geolocation.clearWatch({ id: watchId });
      watchId = null;
    }
  };

  const shouldAddPoint = (points: Point[], newPoint: Point): boolean => {
    if (points.length === 0) {
      console.log('Adding first GPS point');
      return true;
    }

    const lastPoint = points[points.length - 1];
    const distance = calculateDistance(lastPoint.lat, lastPoint.lon, newPoint.lat, newPoint.lon);
    
    if (distance < GPS_CONFIG.DISTANCE_THRESHOLD) {
      console.log(`Skipping GPS point: distance ${distance.toFixed(1)}m < ${GPS_CONFIG.DISTANCE_THRESHOLD}m threshold`);
      return false;
    }
    
    console.log(`Adding GPS point: distance ${distance.toFixed(1)}m from last point`);
    return true;
  };

  const processNewPoint = (points: Point[], newPoint: Point): Point => {
    return smoothGPSPoints(points, newPoint);
  };

  return {
    // State
    currentLat,
    currentLon,
    currentAccuracy,
    gpsSignalQuality,
    isGPSActive,
    
    // Methods
    startGPSTracking,
    stopGPSTracking,
    shouldAddPoint,
    processNewPoint
  };
} 