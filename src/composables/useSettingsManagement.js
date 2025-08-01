import { useDevLogs } from './useDevLogs';
import { updateGPSConfig, updateCanvasConfig } from '../constants/gpsConstants';
export function useSettingsManagement(settings, redrawCanvas) {
    var logInfo = useDevLogs().logInfo;
    var handleSettingsSave = function (newSettings) {
        // Update GPS config
        updateGPSConfig({
            ACCURACY_THRESHOLD: newSettings.ACCURACY_THRESHOLD,
            DISTANCE_THRESHOLD: newSettings.DISTANCE_THRESHOLD,
            MIN_TIME_INTERVAL: newSettings.MIN_TIME_INTERVAL * 1000, // Convert back to milliseconds
        });
        // Update Canvas config
        updateCanvasConfig({
            PINCH_ZOOM_SENSITIVITY: newSettings.PINCH_ZOOM_SENSITIVITY,
            MIN_SCALE: newSettings.MIN_SCALE,
            MAX_SCALE: newSettings.MAX_SCALE,
            LINE_WIDTH: newSettings.LINE_WIDTH,
        });
        // Also update the settings ref for the modal
        Object.assign(settings.value, newSettings);
        // Redraw canvas to apply visual changes immediately
        redrawCanvas();
        logInfo('Settings updated', newSettings);
    };
    return {
        handleSettingsSave: handleSettingsSave
    };
}
