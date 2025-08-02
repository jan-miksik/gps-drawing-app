var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { ref } from 'vue';
// Default values for GPS configuration
export var DEFAULT_GPS_CONFIG = {
    ACCURACY_THRESHOLD: 20, // meters - reject points with worse accuracy
    DISTANCE_THRESHOLD: 10, // meters - minimum distance to add new point
    SMOOTHING_WINDOW: 3, // number of points to average for smoothing
    TIMEOUT: 15000, // 15 seconds timeout for GPS updates
    // MAXIMUM_AGE: 10000, // Accept cached positions up to 10 seconds old
    MIN_TIME_INTERVAL: 5000, // Minimum 5 seconds between GPS points
    POINTS_PRECISION: 5, // Decimal precision for coordinates
};
// Default values for Canvas configuration
export var DEFAULT_CANVAS_CONFIG = {
    DRAWING_PADDING: 40, // In logical pixels
    CURRENT_POSITION_DOT_SIZE: 10,
    CROSS_SIZE: 20, // Size of center cross when no points
    LINE_WIDTH: 2,
    ZOOM_FACTOR: 0.05, // Reduced from 0.1 to 0.05 for slower zoom
    PINCH_ZOOM_SENSITIVITY: 1, // Sensitivity multiplier for pinch-to-zoom (lower = slower)
    MIN_SCALE: 0.01,
    MAX_SCALE: 100,
};
// Reactive GPS configuration
export var GPS_CONFIG = ref(__assign({}, DEFAULT_GPS_CONFIG));
// Reactive Canvas configuration
export var CANVAS_CONFIG = ref(__assign({}, DEFAULT_CANVAS_CONFIG));
// Static file configuration (doesn't need to be reactive)
export var FILE_CONFIG = {
    FILE_NAME: 'gps_points.json',
};
// Function to reset configurations to defaults
export var resetConfigsToDefaults = function () {
    GPS_CONFIG.value = __assign({}, DEFAULT_GPS_CONFIG);
    CANVAS_CONFIG.value = __assign({}, DEFAULT_CANVAS_CONFIG);
};
// Function to update GPS configuration
export var updateGPSConfig = function (newConfig) {
    GPS_CONFIG.value = __assign(__assign({}, GPS_CONFIG.value), newConfig);
};
// Function to update Canvas configuration
export var updateCanvasConfig = function (newConfig) {
    CANVAS_CONFIG.value = __assign(__assign({}, CANVAS_CONFIG.value), newConfig);
};
