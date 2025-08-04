import { ref } from 'vue';

interface LogEntry {
  id: number;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export const IS_DEV_MODE = false;

export function useDevLogs() {
  const logs = ref<LogEntry[]>([]);
  const isDevLogsVisible = ref(false);
  let logIdCounter = 0;

  const addLog = (level: 'info' | 'warn' | 'error', message: string, data?: any): void => {
    if (!IS_DEV_MODE) return;
    
    const logEntry: LogEntry = {
      id: logIdCounter++,
      timestamp: Date.now(),
      level,
      message,
      data
    };
    
    logs.value.push(logEntry);
    
    // Keep only last 100 logs to prevent memory issues
    if (logs.value.length > 100) {
      logs.value = logs.value.slice(-100);
    }
    
    // Also log to console for development
    if (level === 'error') {
      console.error(message, data);
    } else if (level === 'warn') {
      console.warn(message, data);
    } else {
      console.log(message, data);
    }
  };

  const logInfo = (message: string, data?: any): void => {
    addLog('info', message, data);
  };

  const logWarn = (message: string, data?: any): void => {
    addLog('warn', message, data);
  };

  const logError = (message: string, data?: any): void => {
    addLog('error', message, data);
  };

  const clearLogs = (): void => {
    logs.value = [];
  };

  const showDevLogs = (): void => {
    isDevLogsVisible.value = true;
  };

  const hideDevLogs = (): void => {
    isDevLogsVisible.value = false;
  };

  const formatLogTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const ms = ('000' + date.getMilliseconds()).slice(-3);
    return `${timeStr}.${ms}`;
  };

  return {
    logs,
    isDevLogsVisible,
    logInfo,
    logWarn,
    logError,
    clearLogs,
    showDevLogs,
    hideDevLogs,
    formatLogTime
  };
} 