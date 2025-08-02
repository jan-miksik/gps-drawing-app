import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { PushNotifications } from '@capacitor/push-notifications';
import { useDevLogs } from './useDevLogs';

const { logInfo, logError } = useDevLogs();

const notificationPermission = ref<'granted' | 'denied' | 'prompt' | 'not-needed' | 'prompt-with-rationale' | null>(null);

export function useNotificationPermission() {
  const isRequestingNotificationPermission = ref(false);

  const checkIfNeedsNotificationPermission = async (): Promise<boolean | null> => {
    if (Capacitor.getPlatform() !== 'android') {
      notificationPermission.value = 'not-needed';
      logInfo('Not Android platform, notification permission not needed');
      return false;
    }
    try {
      const info = await Device.getInfo();
      const osVersion = parseInt(info.osVersion);
      return osVersion >= 13; // Android 13 = API 33
    } catch (error) {
      logError('Error getting device info', error);
      return null;
    }
  };

  const checkNotificationPermission = async (): Promise<boolean> => {
    const needsNotificationPermission = await checkIfNeedsNotificationPermission();
    
    if (needsNotificationPermission === false) {
      notificationPermission.value = 'not-needed';
      return true;
    }

    try {
      const result = await PushNotifications.checkPermissions();
      notificationPermission.value = result.receive;
      return result.receive === 'granted';
    } catch (error) {
      logError('Error checking notification permission', error);
      alert(JSON.stringify(error));
      // notificationPermission.value = 'denied';
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    isRequestingNotificationPermission.value = true;
    try {
      const result = await PushNotifications.requestPermissions();
      const granted = result.receive === 'granted';
      notificationPermission.value = granted ? 'granted' : 'denied';
      return granted;
    } catch (error) {
      logError('Error requesting notification permission', error);
      notificationPermission.value = 'denied';
      return false;
    } finally {
      isRequestingNotificationPermission.value = false;
    }
  };

  return {
    // State
    notificationPermission,
    isRequestingNotificationPermission,
    
    // Methods
    checkNotificationPermission,
    requestNotificationPermission,
  };
} 