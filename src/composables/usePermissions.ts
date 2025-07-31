import { ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { Capacitor } from '@capacitor/core';
import { registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

// Debug toggle for production builds
const DEBUG = false;

const log = (...args: any[]) => {
  if (DEBUG) console.log('[Permissions]', ...args);
};

export interface PermissionStatus {
  location: 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale';
  backgroundLocation: 'granted' | 'denied' | 'prompt' | 'not-needed';
}

export function usePermissions() {
  const locationPermission = ref<'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'>('prompt');
  const backgroundLocationPermission = ref<'granted' | 'denied' | 'prompt' | 'not-needed'>('not-needed');
  const isCheckingPermissions = ref(false);
  
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
      log('Checking permissions...');
      
      // Check location permission
      const locationStatus = await Geolocation.checkPermissions();
      locationPermission.value = locationStatus.location || 'prompt';
      log('Location permission status:', locationPermission.value);

      // Check background location permission (only on native platforms)
      if (Capacitor.isNativePlatform()) {
        try {
          // Try to get current position to test if background permissions work
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 5000
          });
          
          if (position) {
            log('Location access working, checking background...');
            
            // For background permission, we'll use a simple approach:
            // If we can get location and the app is working, assume background is available
            // The actual background permission will be tested when we try to use it
            backgroundLocationPermission.value = 'granted';
          } else {
            backgroundLocationPermission.value = 'prompt';
          }
        } catch (locationError) {
          log('Location test failed:', locationError);
          
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

      log('Final permission status:', {
        location: locationPermission.value,
        backgroundLocation: backgroundLocationPermission.value
      });
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
      log('🔄 Requesting location permission...');
      log('📊 Current permission state before request:', locationPermission.value);
      
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
      
      log('📱 Calling Geolocation.requestPermissions()...');
      const status = await Promise.race([
        Geolocation.requestPermissions(),
        timeoutPromise
      ]);
      log('✅ Permission request completed:', status);
      log('📊 Status.location:', status.location);
      
      // Update the permission state
      const newPermissionState = status.location || 'denied';
      locationPermission.value = newPermissionState;
      log('🔄 Updated locationPermission.value to:', locationPermission.value);
      
      const result = locationPermission.value === 'granted';
      log('📊 Returning result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error requesting location permission:', error);
      
      // Set to denied on any error
      locationPermission.value = 'denied';
      log('🔄 Set locationPermission.value to denied due to error');
      
      // Log specific error details
      if (error instanceof Error) {
        console.error('❌ Error details:', error.message);
        if (error.message.includes('timeout')) {
          log('⏰ Permission request timed out - user may have taken too long to respond');
        }
      }
      
      return false;
    }
  };

  // Request background location permission - now opens settings directly
  const requestBackgroundLocationPermission = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) {
      console.warn('Background location is not available on web platform');
      return false;
    }

    try {
      console.log('Opening device settings for background location permission...');
      
      // First, ensure we have location permission
      if (!hasLocationPermission.value) {
        console.log('Location permission not granted, requesting first...');
        const locationGranted = await requestLocationPermission();
        if (!locationGranted) {
          console.log('Location permission denied, cannot request background permission');
          return false;
        }
      }

      // Open device settings directly
      try {
        await BackgroundGeolocation.openSettings();
        console.log('Settings opened successfully');
        
        // Set up app state listener to check permissions when user returns
        const appStateListener = await App.addListener('appStateChange', async ({ isActive }: { isActive: boolean }) => {
          if (isActive) {
            console.log('App became active, checking permissions...');
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
        console.error('Error opening settings:', settingsError);
        
        // Fallback: try alternative method
        try {
          // This might work on some devices
          await BackgroundGeolocation.addWatcher({
            backgroundMessage: "GPS Drawing needs background location access",
            backgroundTitle: "Background Permission Required",
            requestPermissions: true,
            stale: false,
            distanceFilter: 1000
          }, (location, error) => {
            console.log('Background permission attempt:', { location: !!location, error });
          });
          
          // Wait and then remove
          setTimeout(async () => {
            try {
              await BackgroundGeolocation.removeWatcher({ id: 'temp' });
            } catch (removeError) {
              console.log('Error removing temp watcher:', removeError);
            }
          }, 2000);
          
          return true;
        } catch (fallbackError) {
          console.error('Fallback method also failed:', fallbackError);
          return false;
        }
      }
      
    } catch (error) {
      console.error('Error requesting background location permission:', error);
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
            log('App became active, refreshing permissions...');
            // Small delay to let system state settle
            setTimeout(() => {
              checkPermissions();
            }, 500);
          }
        });
      } catch (error) {
        console.error('Error setting up app state listener:', error);
      }
    }
  };

  return {
    // State
    locationPermission,
    backgroundLocationPermission,
    isCheckingPermissions,
    
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
  };
} 