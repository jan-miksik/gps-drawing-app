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
    // Note: Capacitor handles cleanup automatically when app terminates
    // No manual cleanup needed for app state listeners or GPS watchers
    var shouldAddPoint = function (points, newPoint) {
        var accuracy = (newPoint === null || newPoint === void 0 ? void 0 : newPoint.accuracy) || 999;
        // Check accuracy threshold for all points (including first point)
        if (accuracy > GPS_CONFIG.value.ACCURACY_THRESHOLD) {
            return false;
        }
        if (points.length === 0) {
            return true;
        }
        var lastPoint = points[points.length - 1];
        var distance = calculateDistance(lastPoint.lat, lastPoint.lon, newPoint.lat, newPoint.lon);
        var timeDiff = newPoint.timestamp - lastPoint.timestamp;
        // Check distance threshold
        if (distance < GPS_CONFIG.value.DISTANCE_THRESHOLD) {
            return false;
        }
        // Check time interval
        if (timeDiff < GPS_CONFIG.value.MIN_TIME_INTERVAL) {
            return false;
        }
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
