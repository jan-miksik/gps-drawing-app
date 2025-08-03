import { ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';
import { useDevLogs } from './useDevLogs';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export interface PermissionStatus {
  location: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
}

const locationPermission = ref<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale' | null>(null);

export function usePermissions() {
  const { logError } = useDevLogs();
  
  const isCheckingPermissions = ref(false);
  
  // Tap debouncing for settings button
  let lastTapTime = 0;

  // Computed properties
  const hasLocationPermission = computed(() => locationPermission.value === 'granted');
  // const canTrackGPS = computed(() => hasLocationPermission.value);

  // Check current permissions
  const checkHasLocationPermission = async (): Promise<boolean> => {
    isCheckingPermissions.value = true;
    try {
      // Check location permission
      const locationStatus = await Geolocation.checkPermissions();
      locationPermission.value = locationStatus.location;
      return locationPermission.value === 'granted';
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    } finally {
      isCheckingPermissions.value = false;
    }
  };

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Permission request timeout after 15 seconds')), 15000);
      });
      
      const status = await Promise.race([
        Geolocation.requestPermissions(),
        timeoutPromise
      ]);
      
      locationPermission.value = status.location || 'denied';
      
      return locationPermission.value === 'granted';
    } catch (error) {
      // Set to denied on any error
      locationPermission.value = 'denied';
      logError('Error requesting location permission', error);
      return false;
    }
  };

  // Open app settings (for manual permission enabling)
  const openAppSettings = async (): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      try {
        // This will open the app's settings page where users can manually enable permissions
        await BackgroundGeolocation.openSettings();
      } catch (error) {
        logError('Error opening app settings', error);
        alert('Please go to your device settings > Apps > GPS Pen > Permissions and enable location access.');
      }
    } else {
      alert('Please enable location permissions in your browser settings.');
    }
  };

  const handleOpenAppSettings = async (): Promise<void> => {
    const now = Date.now();
    if (now - lastTapTime < 1000) return; // ignore if less than 1s since last tap
    lastTapTime = now;
    
    try {
      await openAppSettings();
    } catch (error) {
      logError('Error opening app settings', error);
    }
  };

  return {
    // State
    locationPermission,
    isCheckingPermissions,
    
    // Computed properties
    hasLocationPermission,
    // canTrackGPS,
    
    // Methods
    checkHasLocationPermission,
    requestLocationPermission,
    openAppSettings,
    
    // Permission handlers
    handleOpenAppSettings,
  };
} 