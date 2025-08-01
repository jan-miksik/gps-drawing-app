import { useDevLogs } from './useDevLogs';
import { useFileOperations } from './useFileOperations';

export function useExportOperations(
  canvasEl: any,
  points: any,
  isAnonymized: any,
  anonymizationOrigin: any,
  showExportModal: any
) {
  const { logInfo, logError } = useDevLogs();
  const { exportCanvasAsImage, exportPoints } = useFileOperations();

  const handleDirectExport = async (): Promise<void> => {
    try {
      if (!canvasEl.value) {
        logError('Canvas element not available for image export');
        return;
      }
      
      await exportCanvasAsImage(canvasEl.value, points.value, isAnonymized.value, anonymizationOrigin.value);
      logInfo('Drawing exported as SVG successfully');
    } catch (error) {
      logError('Failed to export drawing as SVG', error);
    }
  };

  const handleExportImage = async (): Promise<void> => {
    try {
      if (!canvasEl.value) {
        logError('Canvas element not available for image export');
        return;
      }
      
      await exportCanvasAsImage(canvasEl.value, points.value, isAnonymized.value, anonymizationOrigin.value);
      showExportModal.value = false;
      logInfo('Drawing exported as SVG successfully');
    } catch (error) {
      logError('Failed to export drawing as SVG', error);
    }
  };

  const handleExportData = async (coordinateType: 'relative' | 'exact'): Promise<void> => {
    try {
      await exportPoints(points.value, coordinateType, anonymizationOrigin.value);
      showExportModal.value = false;
      logInfo('GPS points exported successfully', { 
        count: points.value.length, 
        coordinateType 
      });
    } catch (error) {
      logError('Failed to export GPS points', error);
    }
  };

  return {
    handleDirectExport,
    handleExportImage,
    handleExportData
  };
} 