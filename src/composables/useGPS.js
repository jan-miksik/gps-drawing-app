import { ref, computed } from 'vue';
import { GPS_CONFIG } from '../constants/gpsConstants';
import { calculateDistance, smoothGPSPoints } from '../utils/gpsUtils';
import { useDevLogs } from './useDevLogs';
var logInfo = useDevLogs().logInfo;
export function useGPS() {
    // GPS state
    var currentLat = ref(0);
    var currentLon = ref(0);
    var currentAccuracy = ref(null);
    var gpsSignalQuality = ref('unknown');
    var isGPSActive = ref(false);
    // Internal state
    var watchId = null;
    // Computed properties
    var isTracking = computed(function () { return isGPSActive.value && watchId !== null; });
    // const startGPSTracking = async (onPointAdded: (point: Point) => void): Promise<void> => {
    //   if (!Capacitor.isNativePlatform()) {
    //     console.warn('GPS tracking is optimized for native platforms');
    //   }
    //   try {
    //     // Check permissions first
    //     const permissionStatus = await Geolocation.checkPermissions();
    //     if (permissionStatus.location !== 'granted' && permissionStatus.coarseLocation !== 'granted') {
    //       const requestStatus = await Geolocation.requestPermissions();
    //       if (requestStatus.location !== 'granted' && requestStatus.coarseLocation !== 'granted') {
    //         console.error('Location permission denied.');
    //         return;
    //       }
    //     }
    //     logInfo('Starting enhanced GPS tracking for lock screen support');
    //     // Enhanced GPS tracking with better lock screen support
    //     watchId = await Geolocation.watchPosition(
    //       {
    //         enableHighAccuracy: true,
    //         timeout: GPS_CONFIG.value.TIMEOUT,
    //         maximumAge: GPS_CONFIG.value.MAXIMUM_AGE
    //       },
    //       (position, err) => {
    //         if (err) {
    //           console.error('GPS Error:', err.message, err.code);
    //           gpsSignalQuality.value = 'unknown';
    //         } else if (position) {
    //           processGPSPosition(position, onPointAdded);
    //         }
    //       }
    //     );
    //     isGPSActive.value = true;
    //     logInfo('GPS tracking started successfully');
    //   } catch (error: any) {
    //     console.error('Failed to start GPS tracking:', error.message || error);
    //     logInfo('GPS tracking failed to start', error);
    //   }
    // };
    // const processGPSPosition = (position: GPSPosition, onPointAdded: (point: Point) => void): void => {
    //   const accuracy = position.coords.accuracy || 999;
    //   currentAccuracy.value = accuracy;
    //   gpsSignalQuality.value = getSignalQuality(accuracy);
    //   // Log GPS metadata for debugging
    //   console.log('GPS Position:', {
    //     lat: position.coords.latitude,
    //     lon: position.coords.longitude,
    //     accuracy: accuracy,
    //     speed: position.coords.speed || 'unknown',
    //     heading: position.coords.heading || 'unknown',
    //     quality: gpsSignalQuality.value
    //   });
    //   // Filter out low-accuracy points
    //   if (accuracy > GPS_CONFIG.value.ACCURACY_THRESHOLD) {
    //     console.warn(`Skipping low-accuracy GPS point: ${accuracy.toFixed(1)}m (threshold: ${GPS_CONFIG.value.ACCURACY_THRESHOLD}m)`);
    //     return;
    //   }
    //   // Round coordinates to specified precision
    //   const { lat, lon } = roundCoordinates(position.coords.latitude, position.coords.longitude);
    //   const timestamp = Date.now();
    //   // Always update current position for display
    //   currentLat.value = lat;
    //   currentLon.value = lon;
    //   // Create new point
    //   const newPoint: Point = { lat, lon, timestamp, accuracy };
    //   onPointAdded(newPoint);
    // };
    // const stopGPSTracking = (): void => {
    //   if (watchId) {
    //     Geolocation.clearWatch({ id: watchId });
    //     watchId = null;
    //     isGPSActive.value = false;
    //     logInfo('GPS tracking stopped');
    //   }
    // };
    // Note: Capacitor handles cleanup automatically when app terminates
    // No manual cleanup needed for app state listeners or GPS watchers
    var shouldAddPoint = function (points, newPoint) {
        if (points.length === 0) {
            console.log('Adding first GPS point');
            return true;
        }
        var lastPoint = points[points.length - 1];
        var distance = calculateDistance(lastPoint.lat, lastPoint.lon, newPoint.lat, newPoint.lon);
        var timeDiff = newPoint.timestamp - lastPoint.timestamp;
        var accuracy = (newPoint === null || newPoint === void 0 ? void 0 : newPoint.accuracy) || 999;
        // Check accuracy threshold
        if (accuracy > GPS_CONFIG.value.ACCURACY_THRESHOLD) {
            return false;
        }
        // Check distance threshold
        if (distance < GPS_CONFIG.value.DISTANCE_THRESHOLD) {
            console.log("Skipping point - too close: ".concat(distance.toFixed(1), "m (threshold: ").concat(GPS_CONFIG.value.DISTANCE_THRESHOLD, "m)"));
            return false;
        }
        // Check time interval
        if (timeDiff < GPS_CONFIG.value.MIN_TIME_INTERVAL) {
            console.log("Skipping point - too soon: ".concat(timeDiff, "ms (threshold: ").concat(GPS_CONFIG.value.MIN_TIME_INTERVAL, "ms)"));
            return false;
        }
        console.log("Adding GPS point - distance: ".concat(distance.toFixed(1), "m, time: ").concat(timeDiff, "ms"));
        return true;
    };
    var processNewPoint = function (newPoint) {
        logInfo('processNewPoint', newPoint);
        return smoothGPSPoints(newPoint);
    };
    return {
        // State
        currentLat: currentLat,
        currentLon: currentLon,
        currentAccuracy: currentAccuracy,
        gpsSignalQuality: gpsSignalQuality,
        isGPSActive: isGPSActive,
        // Computed
        isTracking: isTracking,
        // Methods
        // startGPSTracking,
        // stopGPSTracking,
        shouldAddPoint: shouldAddPoint,
        processNewPoint: processNewPoint,
    };
}
