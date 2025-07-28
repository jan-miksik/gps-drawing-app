import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import type { Point, AnonymizationOrigin } from '../types/gps';
import { FILE_CONFIG } from '../constants/gpsConstants';
import { anonymizePoints, getDistanceFromOrigin } from '../utils/coordinateUtils';

export function useFileOperations() {
  const savePointsToFile = async (points: Point[], append = false): Promise<void> => {
    try {
      let dataToSave: Point[];
      
      if (append) {
        // Load existing points and append new ones
        const existing = await loadPointsFromFile();
        dataToSave = [...existing, ...points];
      } else {
        // Replace all points
        dataToSave = points;
      }
      
      await Filesystem.writeFile({
        path: FILE_CONFIG.FILE_NAME,
        data: JSON.stringify(dataToSave),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
    } catch (e) {
      console.error('Failed to save GPS points to file', e);
    }
  };

  const loadPointsFromFile = async (): Promise<Point[]> => {
    try {
      const result = await Filesystem.readFile({
        path: FILE_CONFIG.FILE_NAME,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      
      const dataString = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
      return JSON.parse(dataString);
    } catch (e) {
      console.warn('No saved file found. Starting fresh.', e);
      return [];
    }
  };

  const exportPoints = async (
    points: Point[], 
    isAnonymized: boolean, 
    anonymizationOrigin: AnonymizationOrigin | null
  ): Promise<void> => {
    try {
      if (points.length === 0) {
        alert('No GPS points to export');
        return;
      }

      const currentTime = new Date();
      const timestamp = currentTime.toISOString().replace(/[:.]/g, '-').split('T')[0];
      
      const displayPoints = isAnonymized && anonymizationOrigin 
        ? anonymizePoints(points, anonymizationOrigin) 
        : points;

      const dataToExport = {
        exportDate: currentTime.toISOString(),
        totalPoints: points.length,
        isAnonymized,
        ...(isAnonymized && anonymizationOrigin && {
          anonymizationOrigin,
          note: "Coordinates are anonymized - showing relative distances from first point"
        }),
        points: displayPoints.map((point, index) => ({
          index: index + 1,
          ...(!isAnonymized && {
            latitude: point.lat,
            longitude: point.lon
          }),
          ...(isAnonymized && anonymizationOrigin && {
            distanceFromOrigin: getDistanceFromOrigin(point, anonymizationOrigin, isAnonymized)
          }),
          timestamp: point.timestamp,
          time: new Date(point.timestamp).toISOString(),
          accuracy: point.accuracy !== undefined ? point.accuracy : null
        }))
      };

      const exportData = JSON.stringify(dataToExport, null, 2);
      const suffix = isAnonymized ? '_anonymized' : '';
      const fileName = `gps_export${suffix}_${timestamp}.json`;

      // Try external storage first, fallback to documents directory
      try {
        await Filesystem.writeFile({
          path: fileName,
          data: exportData,
          directory: Directory.ExternalStorage,
          encoding: Encoding.UTF8,
        });
        
        const exportType = isAnonymized ? 'anonymized' : 'real GPS';
        alert(`✅ Exported ${points.length} ${exportType} points to Downloads/${fileName}`);
      } catch (externalError) {
        console.warn('External storage failed, trying Documents:', externalError);
        
        await Filesystem.writeFile({
          path: fileName,
          data: exportData,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });
        
        const exportType = isAnonymized ? 'anonymized' : 'real GPS';
        alert(`✅ Exported ${points.length} ${exportType} points to Documents/${fileName}`);
      }
      
    } catch (error: any) {
      console.error('Export failed:', error);
      
      if (error.message?.includes('permission')) {
        alert('❌ Export failed: Storage permission denied. Please check app permissions.');
      } else if (error.message?.includes('space')) {
        alert('❌ Export failed: Not enough storage space.');
      } else {
        alert(`❌ Export failed: ${error.message || 'Unknown error'}. Check console for details.`);
      }
    }
  };

  const clearAllData = async (): Promise<void> => {
    try {
      await Filesystem.deleteFile({
        path: FILE_CONFIG.FILE_NAME,
        directory: Directory.Data,
      });
    } catch (e) {
      console.warn('No file to delete or delete failed:', e);
    }
  };

  return {
    savePointsToFile,
    loadPointsFromFile,
    exportPoints,
    clearAllData
  };
} 