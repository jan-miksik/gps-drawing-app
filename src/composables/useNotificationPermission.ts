import { ref, computed } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { PushNotifications } from '@capacitor/push-notifications';
import { useDevLogs } from './useDevLogs';

const { logInfo, logWarn, logError } = useDevLogs();

export function useNotificationPermission() {
  const notificationPermission = ref<'granted' | 'denied' | 'prompt' | 'not-needed'>('not-needed');
  const isRequestingNotificationPermission = ref(false);
  const needsNotificationPermission = ref(false);

  const checkIfNeedsNotificationPermission = async (): Promise<void> => {
    if (Capacitor.getPlatform() !== 'android') {
      needsNotificationPermission.value = false;
      logInfo('Not Android platform, notification permission not needed');
      return;
    }
    try {
      const info = await Device.getInfo();
      const osVersion = parseInt(info.osVersion);
      needsNotificationPermission.value = osVersion >= 13; // Android 13 = API 33
      logInfo('Device info checked', { 
        platform: Capacitor.getPlatform(),
        osVersion: info.osVersion,
        parsedVersion: osVersion,
        needsPermission: needsNotificationPermission.value
      });
    } catch (error) {
      logError('Error getting device info', error);
      needsNotificationPermission.value = false;
    }
  };

  const checkNotificationPermission = async (): Promise<void> => {
    await checkIfNeedsNotificationPermission();
    
    if (!needsNotificationPermission.value) {
      notificationPermission.value = 'not-needed';
      logInfo('Notification permission not needed on this platform');
      return;
    }

    try {
      const result = await PushNotifications.checkPermissions();
      notificationPermission.value = result.receive === 'granted' ? 'granted' : 'denied';
      logInfo('Notification permission status checked', { 
        status: notificationPermission.value,
        platform: Capacitor.getPlatform(),
        needsPermission: needsNotificationPermission.value
      });
    } catch (error) {
      logError('Error checking notification permission', error);
      notificationPermission.value = 'denied';
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    await checkIfNeedsNotificationPermission();
    
    if (!needsNotificationPermission.value) {
      logInfo('Notification permission not needed on this platform');
      return true;
    }

    if (notificationPermission.value === 'granted') {
      logInfo('Notification permission already granted');
      return true;
    }

    isRequestingNotificationPermission.value = true;
    
    logInfo('Showing notification permission request dialog...');

    try {
      const result = await PushNotifications.requestPermissions();
      const granted = result.receive === 'granted';
      
      notificationPermission.value = granted ? 'granted' : 'denied';
      
      if (granted) {
        logInfo('Notification permission granted');
      } else {
        logWarn('Notification permission denied - background GPS may not work properly');
      }
      
      return granted;
    } catch (error) {
      logError('Error requesting notification permission', error);
      notificationPermission.value = 'denied';
      return false;
    } finally {
      isRequestingNotificationPermission.value = false;
    }
  };

  const hasNotificationPermission = computed(() => {
    return notificationPermission.value === 'granted' || !needsNotificationPermission.value;
  });

  return {
    // State
    notificationPermission,
    isRequestingNotificationPermission,
    needsNotificationPermission,
    
    // Computed
    hasNotificationPermission,
    
    // Methods
    checkNotificationPermission,
    requestNotificationPermission,
  };
} 