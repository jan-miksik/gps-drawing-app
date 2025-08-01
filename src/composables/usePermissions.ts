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

  // Check background geolocation permission specifically
  const checkBackgroundGeolocationPermission = async (): Promise<'granted' | 'denied' | 'prompt' | 'not-needed'> => {
    if (!Capacitor.isNativePlatform()) {
      return 'not-needed';
    }

    try {
      // Test by trying to add a watcher without requesting permissions
      const testWatcherId = await BackgroundGeolocation.addWatcher({
        backgroundMessage: "Testing background permission",
        backgroundTitle: "Permission Test",
        requestPermissions: false, // Don't request, just test
        stale: false,
        distanceFilter: 1000
      }, (location, error) => {
        // This callback won't be called during the test
        log('Test watcher callback (should not be called):', { location: !!location, error });
      });
      
      // If we get here, background permission is granted
      log('Background geolocation permission: granted');
      
      // Clean up the test watcher
      try {
        await BackgroundGeolocation.removeWatcher({ id: testWatcherId });
        log('Test watcher removed successfully');
      } catch (removeError) {
        log('Error removing test watcher:', removeError);
      }
      
      return 'granted';
      
    } catch (backgroundError: any) {
      log('Background geolocation test failed:', backgroundError);
      
      // Check specific error codes
      if (backgroundError.code === 'NOT_AUTHORIZED' || backgroundError.message?.includes('permission')) {
        log('Background geolocation permission: denied');
        return 'denied';
      } else {
        log('Background geolocation permission: prompt needed');
        return 'prompt';
      }
    }
  };

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
            
            // Use the dedicated background geolocation permission checker
            backgroundLocationPermission.value = await checkBackgroundGeolocationPermission();
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
    
    // Load background modal preference
    const savedPreference = localStorage.getItem('dontShowBackgroundModal');
    if (savedPreference === 'true') {
      dontShowBackgroundModal.value = true;
    }
    
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
    console.log('🔄 handleRequestLocationPermission called');
    console.log('Current state - isRequesting:', isRequestingPermission.value, 'permission:', locationPermission.value);
    
    // Prevent multiple simultaneous requests
    if (isRequestingPermission.value) {
      console.log('⏸️ Permission request already in progress, skipping...');
      return;
    }
    
    // If permission is already granted, no need to request
    if (locationPermission.value === 'granted') {
      console.log('✅ Permission already granted, no need to request');
      return;
    }
    
    isRequestingPermission.value = true;
    console.log('🔄 Set isRequestingPermission to true, starting request...');
    
    try {
      console.log('📱 Calling requestLocationPermission...');
      const granted = await requestLocationPermission();
      console.log('📱 Location permission result:', granted);
      console.log('📱 New permission state:', locationPermission.value);
      
      if (granted) {
        console.log('✅ Location permission granted successfully');
        
        // Force re-check permissions to ensure state is up to date
        console.log('🔄 Re-checking permissions after grant...');
        await checkPermissions();
        console.log('✅ Permissions re-checked, final state:', locationPermission.value);
        
        // If permission was granted, try to start GPS tracking
        if (canTrackGPS.value) {
          try {
            if (canTrackBackgroundGPS.value) {
              await initBackgroundGPS(addBackgroundGPSPoint, updateCurrentAccuracy);
              console.log('🛰️ Background GPS tracking started');
            } else {
              await startGPSTracking(addGPSPoint);
              console.log('📍 Foreground GPS tracking started');
            }
          } catch (gpsError) {
            console.error('❌ Failed to start GPS tracking after permission grant:', gpsError);
          }
        }
      } else {
        console.log('❌ Location permission denied by user');
        console.log('❌ Permission denied, final state:', locationPermission.value);
        
        // If permission was denied, offer to open settings
        if (locationPermission.value === 'denied') {
          console.log('💡 Permission permanently denied, should show settings option');
        }
      }
    } catch (error) {
      console.error('❌ Error in handleRequestLocationPermission:', error);
      
      // Re-check permissions to get accurate state
      try {
        await checkPermissions();
      } catch (checkError) {
        console.error('❌ Error checking permissions after request error:', checkError);
      }
    } finally {
      isRequestingPermission.value = false;
      console.log('✅ Set isRequestingPermission to false, request completed');
    }
  };

  const handleRequestBackgroundPermission = async (): Promise<void> => {
    console.log('handleRequestBackgroundPermission called');
    isRequestingPermission.value = true;
    try {
      console.log('Calling requestBackgroundLocationPermission...');
      const granted = await requestBackgroundLocationPermission();
      console.log('Background permission result:', granted);
      if (granted) {
        console.log('Background location permission granted');
        // Re-check permissions after granting
        await checkPermissions();
      } else {
        console.log('Background location permission denied');
      }
    } catch (error) {
      console.error('Error in handleRequestBackgroundPermission:', error);
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
      console.error('Error opening app settings:', error);
    }
  };

  // Settings modal handlers
  const handleSettingsRequestLocation = async (
    addGPSPoint: any,
    addBackgroundGPSPoint: any,
    updateCurrentAccuracy: any,
    canTrackGPS: any,
    canTrackBackgroundGPS: any,
    initBackgroundGPS: any,
    startGPSTracking: any
  ): Promise<void> => {
    await handleRequestLocationPermission(
      addGPSPoint,
      addBackgroundGPSPoint,
      updateCurrentAccuracy,
      canTrackGPS,
      canTrackBackgroundGPS,
      initBackgroundGPS,
      startGPSTracking
    );
  };

  const handleSettingsRequestBackground = async (): Promise<void> => {
    await handleRequestBackgroundPermission();
  };

  const handleSettingsOpenSettings = async (): Promise<void> => {
    await handleOpenAppSettings();
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
    checkBackgroundGeolocationPermission,
    requestLocationPermission,
    requestBackgroundLocationPermission,
    openAppSettings,
    initPermissions,
    
    // Permission handlers
    handleRequestLocationPermission,
    handleRequestBackgroundPermission,
    handleOpenAppSettings,
    handleSettingsRequestLocation,
    handleSettingsRequestBackground,
    handleSettingsOpenSettings,
  };
} 