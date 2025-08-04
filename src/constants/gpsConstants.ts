import { ref } from 'vue';

// Default values for GPS configuration
export const DEFAULT_GPS_CONFIG = {
  ACCURACY_THRESHOLD: 20, // meters - reject points with worse accuracy
  DISTANCE_THRESHOLD: 10, // meters - minimum distance to add new point
  SMOOTHING_WINDOW: 3, // number of points to average for smoothing
  TIMEOUT: 15000, // 15 seconds timeout for GPS updates
  // MAXIMUM_AGE: 10000, // Accept cached positions up to 10 seconds old
  MIN_TIME_INTERVAL: 5000, // Minimum 5 seconds between GPS points
  POINTS_PRECISION: 5, // Decimal precision for coordinates
} as const;

// Default values for Canvas configuration
export const DEFAULT_CANVAS_CONFIG = {
  DRAWING_PADDING: 40, // In logical pixels
  CURRENT_POSITION_DOT_SIZE: 10,
  CROSS_SIZE: 20, // Size of center cross when no points
  LINE_WIDTH: 2,
  ZOOM_FACTOR: 0.05, // Reduced from 0.1 to 0.05 for slower zoom
  PINCH_ZOOM_SENSITIVITY: 1, // Sensitivity multiplier for pinch-to-zoom (lower = slower)
  MIN_SCALE: 0.01,
  MAX_SCALE: 100,
  DEFAULT_SCALE: 0.85, // Default scale when resetting view
} as const;

// Reactive GPS configuration
export const GPS_CONFIG = ref<{
  ACCURACY_THRESHOLD: number;
  DISTANCE_THRESHOLD: number;
  SMOOTHING_WINDOW: number;
  TIMEOUT: number;
  // MAXIMUM_AGE: number;
  MIN_TIME_INTERVAL: number;
  POINTS_PRECISION: number;
}>({ ...DEFAULT_GPS_CONFIG });

// Reactive Canvas configuration
export const CANVAS_CONFIG = ref<{
  DRAWING_PADDING: number;
  CURRENT_POSITION_DOT_SIZE: number;
  CROSS_SIZE: number;
  LINE_WIDTH: number;
  ZOOM_FACTOR: number;
  PINCH_ZOOM_SENSITIVITY: number;
  MIN_SCALE: number;
  MAX_SCALE: number;
  DEFAULT_SCALE: number;
}>({ ...DEFAULT_CANVAS_CONFIG });

// Static file configuration (doesn't need to be reactive)
export const FILE_CONFIG = {
  FILE_NAME: 'gps_points.json',
} as const;

// Function to reset configurations to defaults
export const resetConfigsToDefaults = (): void => {
  GPS_CONFIG.value = { ...DEFAULT_GPS_CONFIG };
  CANVAS_CONFIG.value = { ...DEFAULT_CANVAS_CONFIG };
};

// Function to update GPS configuration
export const updateGPSConfig = (newConfig: Partial<{
  ACCURACY_THRESHOLD: number;
  DISTANCE_THRESHOLD: number;
  SMOOTHING_WINDOW: number;
  TIMEOUT: number;
  // MAXIMUM_AGE: number;
  MIN_TIME_INTERVAL: number;
  POINTS_PRECISION: number;
}>): void => {
  GPS_CONFIG.value = { ...GPS_CONFIG.value, ...newConfig };
};

// Function to update Canvas configuration
export const updateCanvasConfig = (newConfig: Partial<{
  DRAWING_PADDING: number;
  CURRENT_POSITION_DOT_SIZE: number;
  CROSS_SIZE: number;
  LINE_WIDTH: number;
  ZOOM_FACTOR: number;
  PINCH_ZOOM_SENSITIVITY: number;
  MIN_SCALE: number;
  MAX_SCALE: number;
  DEFAULT_SCALE: number;
}>): void => {
  CANVAS_CONFIG.value = { ...CANVAS_CONFIG.value, ...newConfig };
}; 