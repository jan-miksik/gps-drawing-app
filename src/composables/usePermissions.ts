import { ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export interface PermissionStatus {
  location: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  backgroundLocation?: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
}

export function usePermissions() {
  const locationPermission = ref<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'>('prompt');
  const backgroundLocationPermission = ref<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'>('prompt');
  const isCheckingPermissions = ref(false);

  // Computed properties
  const hasLocationPermission = computed(() => locationPermission.value === 'granted');
  const hasBackgroundLocationPermission = computed(() => backgroundLocationPermission.value === 'granted');
  const needsLocationPermission = computed(() => !hasLocationPermission.value);
  const needsBackgroundLocationPermission = computed(() => hasLocationPermission.value && !hasBackgroundLocationPermission.value);
  const canTrackGPS = computed(() => hasLocationPermission.value);
  const canTrackBackgroundGPS = computed(() => hasLocationPermission.value && hasBackgroundLocationPermission.value);

  // Check current permissions
  const checkPermissions = async (): Promise<void> => {
    isCheckingPermissions.value = true;
    
    try {
      // Check location permission
      const locationStatus = await Geolocation.checkPermissions();
      locationPermission.value = locationStatus.location || 'prompt';

      // Check background location permission (only on native platforms)
      if (Capacitor.isNativePlatform()) {
        try {
          // Try to get background location permission status
          // Since BackgroundGeolocation doesn't have checkPermissions method,
          // we'll try to add a temporary watcher to test if we have permission
          const testWatcherId = await BackgroundGeolocation.addWatcher({
            backgroundMessage: "Testing background permission",
            backgroundTitle: "GPS Drawing",
            requestPermissions: false, // Don't request, just test
            stale: false,
            distanceFilter: 1000 // Large distance to avoid triggering
          }, (location, error) => {
            if (error) {
              console.log('Background permission test error:', error);
              if (error.code === "NOT_AUTHORIZED") {
                backgroundLocationPermission.value = 'denied';
              }
            } else if (location) {
              backgroundLocationPermission.value = 'granted';
            }
          });
          
          // Wait a bit to see if we get an error
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Remove the test watcher
          try {
            await BackgroundGeolocation.removeWatcher({ id: testWatcherId });
          } catch (removeError) {
            console.log('Error removing test watcher (expected):', removeError);
          }
          
          // If we still don't know the status, assume prompt
          if (backgroundLocationPermission.value === 'prompt') {
            backgroundLocationPermission.value = 'prompt';
          }
        } catch (error) {
          console.log('Background location permission check failed:', error);
          backgroundLocationPermission.value = 'prompt';
        }
      } else {
        backgroundLocationPermission.value = 'denied'; // Not available on web
      }

      console.log('Permission status:', {
        location: locationPermission.value,
        backgroundLocation: backgroundLocationPermission.value
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      isCheckingPermissions.value = false;
    }
  };

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const status = await Geolocation.requestPermissions();
      locationPermission.value = status.location || 'denied';
      return hasLocationPermission.value;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      locationPermission.value = 'denied';
      return false;
    }
  };

  // Request background location permission
  const requestBackgroundLocationPermission = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Background location is not available on web platform');
      return false;
    }

    try {
      // Try to request background location permission
      // We'll try to add a watcher which will trigger permission request
      const watcherId = await BackgroundGeolocation.addWatcher({
        backgroundMessage: "Requesting background location permission",
        backgroundTitle: "GPS Drawing",
        requestPermissions: true,
        stale: false,
        distanceFilter: 10
      }, (location, error) => {
        if (error) {
          console.error('Background location permission error:', error);
          if (error.code === "NOT_AUTHORIZED") {
            backgroundLocationPermission.value = 'denied';
          }
        } else if (location) {
          backgroundLocationPermission.value = 'granted';
        }
      });
      
      // Wait a bit for the permission request to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Remove the watcher since we just wanted to trigger permission request
      try {
        await BackgroundGeolocation.removeWatcher({ id: watcherId });
      } catch (removeError) {
        console.log('Error removing background watcher (expected):', removeError);
      }
      
      // Re-check permissions after the request
      await checkPermissions();
      
      return hasBackgroundLocationPermission.value;
    } catch (error) {
      console.error('Error requesting background location permission:', error);
      backgroundLocationPermission.value = 'denied';
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
        console.error('Error opening app settings:', error);
        // Fallback: show instructions to user
        alert('Please go to your device settings and enable location permissions for this app.');
      }
    } else {
      // On web, show instructions
      alert('Please enable location permissions in your browser settings and refresh the page.');
    }
  };

  // Initialize permissions check
  const initPermissions = async (): Promise<void> => {
    await checkPermissions();
  };

  return {
    // State
    locationPermission,
    backgroundLocationPermission,
    isCheckingPermissions,
    
    // Computed
    hasLocationPermission,
    hasBackgroundLocationPermission,
    needsLocationPermission,
    needsBackgroundLocationPermission,
    canTrackGPS,
    canTrackBackgroundGPS,
    
    // Methods
    checkPermissions,
    requestLocationPermission,
    requestBackgroundLocationPermission,
    openAppSettings,
    initPermissions,
  };
} 