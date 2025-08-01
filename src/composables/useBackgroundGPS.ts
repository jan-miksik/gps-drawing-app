import { ref } from 'vue';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import type { Point } from '../types/gps';
import { GPS_CONFIG } from '../constants/gpsConstants';
import { roundCoordinates } from '../utils/gpsUtils';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export function useBackgroundGPS() {
  const isBackgroundGPSActive = ref(false);
  const isInitialized = ref(false);
  const watcherId = ref<string | null>(null);

  const initBackgroundGPS = async (onPoint: (point: Point) => void, onAccuracyUpdate?: (accuracy: number) => void): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Background GPS is only available on native platforms.');
      return;
    }

    if (isInitialized.value) {
      console.log('Background GPS already initialized');
      return;
    }

    try {
      console.log('Initializing background GPS...');
      
      // Add watcher using the correct API with improved configuration
      const id = await BackgroundGeolocation.addWatcher({
        backgroundMessage: "Recording your GPS path in the background",
        backgroundTitle: "GPS Drawing Active",
        requestPermissions: true,
        stale: false,
        distanceFilter: GPS_CONFIG.value.DISTANCE_THRESHOLD
      }, (location, error) => {
        if (error) {
          console.error('Background GPS error:', error);
          
          if (error.code === "NOT_AUTHORIZED") {
            console.warn('Background location permission denied');
          }
          return;
        }

        if (location) {
          console.log('Background GPS location received:', {
            lat: location.latitude,
            lon: location.longitude,
            accuracy: location.accuracy,
            speed: location.speed,
            timestamp: location.time
          });

          const accuracy = location.accuracy || 999;
          
          // Always update current accuracy display (even for poor accuracy points)
          if (onAccuracyUpdate) {
            onAccuracyUpdate(accuracy);
          }

          // Apply accuracy filter for recording points
          if (accuracy > GPS_CONFIG.value.ACCURACY_THRESHOLD) {
          console.warn(`Skipping low-accuracy background GPS point: ${accuracy.toFixed(1)}m (threshold: ${GPS_CONFIG.value.ACCURACY_THRESHOLD}m)`);
            return;
          }

          // Round coordinates to specified precision
          const { lat, lon } = roundCoordinates(location.latitude, location.longitude);
          const timestamp = Date.now();

          const point: Point = {
            lat,
            lon,
            timestamp,
            accuracy
          };

          // Call the provided callback for point recording
          onPoint(point);
        }
      });

      watcherId.value = id;
      isInitialized.value = true;
      isBackgroundGPSActive.value = true;
      console.log('Background GPS initialized successfully with watcher ID:', id);

    } catch (err) {
      console.error('Failed to initialize background GPS:', err);
      throw err;
    }
  };

  const startBackgroundGPS = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Background GPS is only available on native platforms.');
      return;
    }

    if (!isInitialized.value) {
      console.warn('Background GPS not initialized. Call initBackgroundGPS first.');
      return;
    }

    try {
      console.log('Background GPS already started during initialization');
      isBackgroundGPSActive.value = true;
    } catch (err) {
      console.error('Failed to start background GPS:', err);
      throw err;
    }
  };

  const stopBackgroundGPS = async (): Promise<void> => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      console.log('Stopping background GPS...');
      
      if (watcherId.value) {
        await BackgroundGeolocation.removeWatcher({
          id: watcherId.value
        });
        watcherId.value = null;
      }
      
      isBackgroundGPSActive.value = false;
      console.log('Background GPS stopped successfully');
    } catch (err) {
      console.error('Failed to stop background GPS:', err);
    }
  };

  const getBackgroundGPSState = async () => {
    if (!Capacitor.isNativePlatform()) return null;
    
    try {
      // The community plugin doesn't have a getState method
      // Return our internal state
      return {
        enabled: isBackgroundGPSActive.value,
        isMoving: true
      };
    } catch (err) {
      console.error('Failed to get background GPS state:', err);
      return null;
    }
  };

  // Note: Capacitor handles cleanup automatically when app terminates
  // No manual cleanup needed for background GPS watchers

  return {
    // State
    isBackgroundGPSActive,
    isInitialized,
    
    // Methods
    initBackgroundGPS,
    startBackgroundGPS,
    stopBackgroundGPS,
    getBackgroundGPSState,
  };
} 