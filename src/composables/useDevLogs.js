import { ref } from 'vue';
export var IS_DEV_MODE = false;
export function useDevLogs() {
    var logs = ref([]);
    var isDevLogsVisible = ref(false);
    var logIdCounter = 0;
    var addLog = function (level, message, data) {
        if (!IS_DEV_MODE)
            return;
        var logEntry = {
            id: logIdCounter++,
            timestamp: Date.now(),
            level: level,
            message: message,
            data: data
        };
        logs.value.push(logEntry);
        // Keep only last 100 logs to prevent memory issues
        if (logs.value.length > 100) {
            logs.value = logs.value.slice(-100);
        }
        // Also log to console for development
        if (level === 'error') {
            console.error(message, data);
        }
        else if (level === 'warn') {
            console.warn(message, data);
        }
        else {
            console.log(message, data);
        }
    };
    var logInfo = function (message, data) {
        addLog('info', message, data);
    };
    var logWarn = function (message, data) {
        addLog('warn', message, data);
    };
    var logError = function (message, data) {
        addLog('error', message, data);
    };
    var clearLogs = function () {
        logs.value = [];
    };
    var showDevLogs = function () {
        isDevLogsVisible.value = true;
    };
    var hideDevLogs = function () {
        isDevLogsVisible.value = false;
    };
    var formatLogTime = function (timestamp) {
        var date = new Date(timestamp);
        var timeStr = date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        var ms = ('000' + date.getMilliseconds()).slice(-3);
        return "".concat(timeStr, ".").concat(ms);
    };
    return {
        logs: logs,
        isDevLogsVisible: isDevLogsVisible,
        logInfo: logInfo,
        logWarn: logWarn,
        logError: logError,
        clearLogs: clearLogs,
        showDevLogs: showDevLogs,
        hideDevLogs: hideDevLogs,
        formatLogTime: formatLogTime
    };
}
