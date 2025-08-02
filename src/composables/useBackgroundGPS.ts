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
  const lastPointTime = ref<number>(0);

  const initBackgroundGPS = async (onPoint: (point: Point) => void, onAccuracyUpdate?: (accuracy: number) => void): Promise<void> => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    if (isInitialized.value) {
      return;
    }
    isInitialized.value = true;

    try {      
      // Add watcher using the correct API with improved configuration
      const id = await BackgroundGeolocation.addWatcher({
        backgroundMessage: "GPS drawing in progress",
        backgroundTitle: "GPS Drawing Active",
        requestPermissions: true,
        stale: false,
        distanceFilter: GPS_CONFIG.value.DISTANCE_THRESHOLD
      }, (location, error) => {
        if (error) {
          console.error('Background GPS error:', error);
          return;
        }

        if (location) {
          const accuracy = location.accuracy || 999;
          // Always update current accuracy display (even for poor accuracy points)
          if (onAccuracyUpdate) {
            onAccuracyUpdate(accuracy);
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

          // Apply timeout based on settings to prevent too frequent updates
          const now = Date.now();
          const timeSinceLastPoint = now - lastPointTime.value;
          const minInterval = GPS_CONFIG.value.MIN_TIME_INTERVAL;
          
          if (timeSinceLastPoint >= minInterval) {
            // Call the provided callback for point recording
            onPoint(point);
            lastPointTime.value = now;
          }
        }
      });

      watcherId.value = id;

      isBackgroundGPSActive.value = true;
    } catch (err) {
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
    // isInitialized,
    
    // Methods
    initBackgroundGPS,
    startBackgroundGPS,
    stopBackgroundGPS,
    getBackgroundGPSState,
  };
} 