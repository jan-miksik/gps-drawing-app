import { ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { useDevLogs } from './useDevLogs';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export interface PermissionStatus {
  location: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  backgroundLocation: 'granted' | 'denied' | 'prompt' | 'not-needed';
}

export function usePermissions() {
  const { logError } = useDevLogs();
  
  const locationPermission = ref<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'>('prompt');
  const backgroundLocationPermission = ref<'granted' | 'denied' | 'prompt' | 'not-needed'>('not-needed');
  const isCheckingPermissions = ref(false);
  const isRequestingPermission = ref(false);
  const dontShowBackgroundModal = ref(false);
  
  // Tap debouncing for settings button
  let lastTapTime = 0;
  
  // Singleton flag for app state listener
  let appStateListenerInitialized = false;

  // Computed properties
  const hasLocationPermission = computed(() => locationPermission.value === 'granted');
  const hasBackgroundLocationPermission = computed(() => 
    backgroundLocationPermission.value === 'granted' || backgroundLocationPermission.value === 'not-needed'
  );
  const needsLocationPermission = computed(() => !hasLocationPermission.value);
  const needsBackgroundLocationPermission = computed(() => 
    hasLocationPermission.value && 
    Capacitor.isNativePlatform() && 
    backgroundLocationPermission.value !== 'granted'
  );
  const canTrackGPS = computed(() => hasLocationPermission.value);
  const canTrackBackgroundGPS = computed(() => hasLocationPermission.value && hasBackgroundLocationPermission.value);

  // Check current permissions
  const checkPermissions = async (): Promise<void> => {
    if (isCheckingPermissions.value) return;
    
    isCheckingPermissions.value = true;
    
    // 🕒 Let UI breathe before blocking it with async ops
    await new Promise(resolve => setTimeout(resolve, 50));
    
    try {
      // Check location permission
      const locationStatus = await Geolocation.checkPermissions();
      locationPermission.value = locationStatus.location || 'prompt';

      // Check background location permission (only on native platforms)
      if (Capacitor.isNativePlatform()) {
        try {
          // Try to get current position to test if background permissions work
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 5000
          });
          
          if (position) {
            // If we get position the background permission is granted
            backgroundLocationPermission.value = 'granted';
          } else {
            backgroundLocationPermission.value = 'prompt';
          }
        } catch (locationError) {
          // If location permission is granted but we can't get position,
          // background permission might be the issue
          if (locationPermission.value === 'granted') {
            backgroundLocationPermission.value = 'denied';
          } else {
            backgroundLocationPermission.value = 'prompt';
          }
        }
      } else {
        backgroundLocationPermission.value = 'not-needed'; // Not available on web
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      // Set default states on error
      locationPermission.value = 'prompt';
      backgroundLocationPermission.value = 'prompt';
    } finally {
      isCheckingPermissions.value = false;
    }
  };

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      // Use requestAnimationFrame to let UI complete paint before opening system dialog
      await new Promise(resolve => {
        if ('requestAnimationFrame' in window) {
          requestAnimationFrame(() => setTimeout(resolve, 30));
        } else {
          setTimeout(resolve, 30);
        }
      });
      
      // Add timeout to prevent hanging (increased to 15 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Permission request timeout after 15 seconds')), 15000);
      });
      
      const status = await Promise.race([
        Geolocation.requestPermissions(),
        timeoutPromise
      ]);
      
      // Update the permission state
      const newPermissionState = status.location || 'denied';
      locationPermission.value = newPermissionState;
      
      const result = locationPermission.value === 'granted';
      return result;
    } catch (error) {
      // Set to denied on any error
      locationPermission.value = 'denied';
      logError('Error requesting location permission', error);
      return false;
    }
  };

  // Request background location permission - now opens settings directly
  const requestBackgroundLocationPermission = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      // First, ensure we have location permission
      if (!hasLocationPermission.value) {
        const locationGranted = await requestLocationPermission();
        if (!locationGranted) {
          return false;
        }
      }

      // Open device settings directly
      try {
        await BackgroundGeolocation.openSettings();
        
        // Set up app state listener to check permissions when user returns
        const appStateListener = await App.addListener('appStateChange', async ({ isActive }: { isActive: boolean }) => {
          if (isActive) {
            // Wait a bit for settings to take effect
            setTimeout(async () => {
              await checkPermissions();
              // Remove the listener after checking
              await appStateListener.remove();
            }, 1000);
          }
        });
        
        return true; // Settings opened successfully
      } catch (settingsError) {
        // Fallback: try alternative method
        try {
          // This might work on some devices
          await BackgroundGeolocation.addWatcher({
            backgroundMessage: "GPS Drawing needs background location access",
            backgroundTitle: "Background Permission Required",
            requestPermissions: true,
            stale: false,
            distanceFilter: 1000
          }, () => {
            // Background permission test callback
          });
          
          // Wait and then remove
          setTimeout(async () => {
            try {
              await BackgroundGeolocation.removeWatcher({ id: 'temp' });
            } catch (removeError) {
              logError('Error removing temp watcher', removeError);
            }
          }, 2000);
          
          return true;
        } catch (fallbackError) {
          logError('Fallback background permission method failed', fallbackError);
          return false;
        }
      }
      
    } catch (error) {
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
        // Fallback: show instructions to user
        alert('Please go to your device settings > Apps > GPS Drawing > Permissions and enable "Allow all the time" for location access.');
      }
    } else {
      // On web, show instructions
      alert('Please enable location permissions in your browser settings.');
    }
  };

  // Initialize permissions and set up app state monitoring
  const initPermissions = async (): Promise<void> => {
    await checkPermissions();
  
    
    // Set up app state listener for permission refresh (singleton)
    if (!appStateListenerInitialized && Capacitor.isNativePlatform()) {
      try {
        appStateListenerInitialized = true;
        await App.addListener('appStateChange', async ({ isActive }: { isActive: boolean }) => {
          if (isActive) {
            // Small delay to let system state settle
            setTimeout(() => {
              checkPermissions();
            }, 500);
          }
        });
      } catch (error) {
        logError('Error setting up app state listener', error);
      }
    }
  };

  // Permission request handlers
  const handleRequestLocationPermission = async (
    addGPSPoint: any,
    addBackgroundGPSPoint: any,
    updateCurrentAccuracy: any,
    canTrackGPS: any,
    canTrackBackgroundGPS: any,
    initBackgroundGPS: any,
    startGPSTracking: any
  ): Promise<void> => {
    // Prevent multiple simultaneous requests
    if (isRequestingPermission.value) {
      return;
    }
    
    // If permission is already granted, no need to request
    if (locationPermission.value === 'granted') {
      return;
    }
    
    isRequestingPermission.value = true;
    
    try {
      const granted = await requestLocationPermission();
      
      if (granted) {
        // Force re-check permissions to ensure state is up to date
        await checkPermissions();
        
        // If permission was granted, try to start GPS tracking
        if (canTrackGPS.value) {
          try {
            if (canTrackBackgroundGPS.value) {
              await initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy);
            } else {
              await startGPSTracking(addGPSPoint);
            }
          } catch (gpsError) {
            logError('Failed to start GPS tracking after permission grant', gpsError);
          }
        }
      }
          } catch (error) {
        logError('Error in handleRequestLocationPermission', error);
        // Re-check permissions to get accurate state
        try {
          await checkPermissions();
        } catch (checkError) {
          logError('Error checking permissions after request error', checkError);
        }
      } finally {
      isRequestingPermission.value = false;
    }
  };

  const handleRequestBackgroundPermission = async (): Promise<void> => {
    isRequestingPermission.value = true;
    try {
      const granted = await requestBackgroundLocationPermission();
      if (granted) {
        // Re-check permissions after granting
        await checkPermissions();
      }
    } catch (error) {
      logError('Error in handleRequestBackgroundPermission', error);
    } finally {
      isRequestingPermission.value = false;
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
    backgroundLocationPermission,
    isCheckingPermissions,
    isRequestingPermission,
    dontShowBackgroundModal,
    
    // Computed properties
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
    
    // Permission handlers
    handleRequestLocationPermission,
    handleRequestBackgroundPermission,
    handleOpenAppSettings,
  };
} 