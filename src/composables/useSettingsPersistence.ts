import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { DEFAULT_GPS_CONFIG, DEFAULT_CANVAS_CONFIG } from '../constants/gpsConstants';

interface Settings {
  ACCURACY_THRESHOLD: number;
  DISTANCE_THRESHOLD: number;
  MIN_TIME_INTERVAL: number;
  SMOOTHING_WINDOW: number;
  PINCH_ZOOM_SENSITIVITY: number;
  MIN_SCALE: number;
  MAX_SCALE: number;
  LINE_WIDTH: number;
}

const SETTINGS_FILE_NAME = 'app_settings.json';

export function useSettingsPersistence() {
  const saveSettings = async (settings: Settings): Promise<void> => {
    try {
      await Filesystem.writeFile({
        path: SETTINGS_FILE_NAME,
        data: JSON.stringify(settings),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const loadSettings = async (): Promise<Settings | null> => {
    try {
      const result = await Filesystem.readFile({
        path: SETTINGS_FILE_NAME,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      
      const dataString = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
      const loadedSettings = JSON.parse(dataString);
      
      // Validate that all required settings are present
      const defaultSettings: Settings = {
        ACCURACY_THRESHOLD: DEFAULT_GPS_CONFIG.ACCURACY_THRESHOLD,
        DISTANCE_THRESHOLD: DEFAULT_GPS_CONFIG.DISTANCE_THRESHOLD,
        MIN_TIME_INTERVAL: DEFAULT_GPS_CONFIG.MIN_TIME_INTERVAL / 1000, // Convert from ms to seconds for UI
        SMOOTHING_WINDOW: DEFAULT_GPS_CONFIG.SMOOTHING_WINDOW,
        PINCH_ZOOM_SENSITIVITY: DEFAULT_CANVAS_CONFIG.PINCH_ZOOM_SENSITIVITY,
        MIN_SCALE: DEFAULT_CANVAS_CONFIG.MIN_SCALE,
        MAX_SCALE: DEFAULT_CANVAS_CONFIG.MAX_SCALE,
        LINE_WIDTH: DEFAULT_CANVAS_CONFIG.LINE_WIDTH,
      };

      // Merge with defaults to ensure all settings are present
      const validatedSettings = { ...defaultSettings, ...loadedSettings };
      
      return validatedSettings;
    } catch (error) {
      console.warn('No saved settings found, using defaults:', error);
      return null;
    }
  };

  const resetSettings = async (): Promise<void> => {
    try {
      await Filesystem.deleteFile({
        path: SETTINGS_FILE_NAME,
        directory: Directory.Data,
      });
    } catch (error) {
      console.warn('No settings file to delete or delete failed:', error);
    }
  };

  return {
    saveSettings,
    loadSettings,
    resetSettings,
  };
}
