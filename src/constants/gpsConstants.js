export var GPS_CONFIG = {
    ACCURACY_THRESHOLD: 20, // meters - reject points with worse accuracy
    DISTANCE_THRESHOLD: 10, // meters - minimum distance to add new point
    SMOOTHING_WINDOW: 3, // number of points to average for smoothing
    TIMEOUT: 5000, // Reduced timeout for faster updates
    MAXIMUM_AGE: 1000, // Collect every 1 second
    POINTS_PRECISION: 5, // Decimal precision for coordinates
};
export var CANVAS_CONFIG = {
    DRAWING_PADDING: 40, // In logical pixels
    CURRENT_POSITION_DOT_SIZE: 10,
    CROSS_SIZE: 20, // Size of center cross when no points
    LINE_WIDTH: 2,
    ZOOM_FACTOR: 0.1,
    MIN_SCALE: 0.1,
    MAX_SCALE: 10,
};
export var FILE_CONFIG = {
    FILE_NAME: 'gps_points.json',
};
