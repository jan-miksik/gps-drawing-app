import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { Point, AnonymizationOrigin } from '../types/gps';
import { FILE_CONFIG } from '../constants/gpsConstants';
import { anonymizePoints } from '../utils/coordinateUtils';
import { project, calculateBounds } from '../utils/canvasUtils';

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
    coordinateType: 'relative' | 'exact',
    anonymizationOrigin: AnonymizationOrigin | null
  ): Promise<void> => {
    try {
      if (points.length === 0) {
        alert('No GPS points to export');
        return;
      }

      const currentTime = new Date();
      const timestamp = currentTime.toISOString().replace(/[:.]/g, '-').split('T')[0];
      
      const isAnonymized = coordinateType === 'relative';
      const displayPoints = isAnonymized && anonymizationOrigin 
        ? anonymizePoints(points, anonymizationOrigin) 
        : points;

      const dataToExport = {
        exportDate: currentTime.toISOString(),
        totalPoints: points.length,
        coordinateType,
        isAnonymized,
        ...(isAnonymized && anonymizationOrigin && {
          note: "Coordinates are anonymized - showing relative x,y coordinates from first point"
        }),
        points: displayPoints.map((point, index) => ({
          index: index + 1,
          ...(!isAnonymized && {
            latitude: point.lat,
            longitude: point.lon
          }),
          ...(isAnonymized && {
            x: point.lon, // Relative x coordinate (longitude offset - horizontal)
            y: point.lat  // Relative y coordinate (latitude offset - vertical)
          }),
          timestamp: point.timestamp,
          time: new Date(point.timestamp).toISOString(),
          accuracy: point.accuracy !== undefined ? point.accuracy : null
        }))
      };

      const exportData = JSON.stringify(dataToExport, null, 2);
      const suffix = isAnonymized ? '_anonymized' : '_exact';
      const fileName = `gps_export${suffix}_${timestamp}.json`;

      // Try multiple export methods for data
      await tryMultipleExportMethods(fileName, exportData, 'application/json', points.length, isAnonymized);
      
    } catch (error: any) {
      console.error('Data export failed:', error);
      handleExportError(error);
    }
  };

  const exportCanvasAsImage = async (
    canvas: HTMLCanvasElement, 
    points: Point[], 
    isAnonymized: boolean, 
    anonymizationOrigin: AnonymizationOrigin | null
  ): Promise<void> => {
    try {
      const currentTime = new Date();
      const timestamp = currentTime.toISOString().replace(/[:.]/g, '-').split('T')[0];
      const fileName = `gps_drawing_${timestamp}.svg`;

      // Generate SVG content
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = canvas.width / dpr;
      const logicalHeight = canvas.height / dpr;

      const svgContent = generateSVGFromCanvas(canvas, ctx, logicalWidth, logicalHeight, dpr, points, isAnonymized, anonymizationOrigin);
      const mimeType = 'image/svg+xml';

      // Try multiple export methods for SVG
      await tryMultipleExportMethods(fileName, svgContent, mimeType, points.length, isAnonymized);
      
    } catch (error: any) {
      console.error('SVG export failed:', error);
      handleExportError(error);
    }
  };

  const tryMultipleExportMethods = async (
    fileName: string,
    content: string,
    mimeType: string,
    pointCount: number,
    isAnonymized: boolean
  ): Promise<void> => {
    // Method 1: Try Capacitor Share plugin (includes Web Share API with cancellation handling)
    if (await tryCapacitorShare(fileName, content, pointCount, isAnonymized)) {
      return;
    }

    // Method 2: Try Web Share API with URL
    if (await tryWebShareWithURL(content, mimeType, pointCount, isAnonymized)) {
      return;
    }

    // Method 3: Try download link (fallback for web)
    if (await tryDownloadLink(fileName, content, mimeType)) {
      return;
    }

    // Method 4: Save to filesystem (final fallback)
    await saveToFilesystem(fileName, content, pointCount, isAnonymized);
  };

  const tryCapacitorShare = async (
    fileName: string,
    content: string,
    pointCount: number,
    isAnonymized: boolean
  ): Promise<boolean> => {
    try {
      // Check if Capacitor Share is available
      if (typeof Share === 'undefined' || !Share.share) {
        console.log('Capacitor Share not available');
        return false;
      }

      // Create blob and file for sharing (don't save to filesystem yet)
      const blob = new Blob([content], { type: 'image/svg+xml' });
      const file = new File([blob], fileName, { type: 'image/svg+xml' });

      // Try Web Share API first (it has better cancellation handling)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'GPS Drawing',
            text: `GPS Drawing (${isAnonymized ? 'anonymized' : 'exact'}) - ${pointCount} points`,
            files: [file]
          });
          console.log('Successfully shared via Web Share API');
          return true;
        } catch (shareError: any) {
          if (shareError.name === 'AbortError') {
            console.log('User cancelled share');
            return true; // Consider this a success since user chose to cancel
          }
          console.warn('Web Share failed, falling back to Capacitor Share:', shareError);
        }
      }

      // For Capacitor Share, we need to save the file temporarily
      // But we'll use a unique timestamp to avoid conflicts and clean up immediately
      const timestamp = Date.now();
      const tempPath = `temp_${timestamp}_${fileName}`;
      
      await Filesystem.writeFile({
        path: tempPath,
        data: content,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      // Get the file URI
      const fileUri = await Filesystem.getUri({
        directory: Directory.Cache,
        path: tempPath
      });

      try {
        // Share using Capacitor
        await Share.share({
          title: 'GPS Drawing',
          text: `GPS Drawing (${isAnonymized ? 'anonymized' : 'exact'}) - ${pointCount} points`,
          url: fileUri.uri,
          dialogTitle: 'Share GPS Drawing'
        });

        console.log('Successfully shared via Capacitor Share');
        return true;
      } catch (shareError: any) {
        console.log('User cancelled Capacitor Share or share failed');
        // Even if cancelled, we consider it a success since user chose to cancel
        return true;
      } finally {
        // Always clean up temp file, regardless of success or cancellation
        try {
          await Filesystem.deleteFile({
            path: tempPath,
            directory: Directory.Cache,
          });
          console.log('Temporary file cleaned up');
        } catch (cleanupError) {
          console.warn('Failed to clean up temp file:', cleanupError);
        }
      }
    } catch (error: any) {
      console.warn('Capacitor Share failed:', error);
      return false;
    }
  };

  // const tryWebShareWithFile = async (
  //   fileName: string,
  //   content: string,
  //   mimeType: string,
  //   pointCount: number,
  //   isAnonymized: boolean
  // ): Promise<boolean> => {
  //   try {
  //     if (!navigator.share || !navigator.canShare) {
  //       console.log('Web Share API not available');
  //       return false;
  //     }

  //     // Create blob and file
  //     const blob = new Blob([content], { type: mimeType });
  //     const file = new File([blob], fileName, { type: mimeType });

  //     if (!navigator.canShare({ files: [file] })) {
  //       console.log('Web Share API cannot share this file type');
  //       return false;
  //     }

  //     await navigator.share({
  //       title: 'GPS Drawing',
  //       text: `GPS Drawing (${isAnonymized ? 'anonymized' : 'exact'}) - ${pointCount} points`,
  //       files: [file]
  //     });

  //     console.log('Successfully shared via Web Share API with File');
  //     return true;
  //   } catch (error: any) {
  //     if (error.name === 'AbortError') {
  //       console.log('User cancelled share');
  //       return true; // Consider this a success since user chose to cancel
  //     }
  //     console.warn('Web Share with File failed:', error);
  //     return false;
  //   }
  // };

  const tryWebShareWithURL = async (
    content: string,
    mimeType: string,
    pointCount: number,
    isAnonymized: boolean
  ): Promise<boolean> => {
    try {
      if (!navigator.share) {
        console.log('Web Share API not available');
        return false;
      }

      // Create a blob URL for sharing
      const blob = new Blob([content], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      await navigator.share({
        title: 'GPS Drawing',
        text: `GPS Drawing (${isAnonymized ? 'anonymized' : 'exact'}) - ${pointCount} points`,
        url: blobUrl
      });

      // Clean up blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);

      console.log('Successfully shared via Web Share API with URL');
      return true;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('User cancelled share');
        return true;
      }
      console.warn('Web Share with URL failed:', error);
      return false;
    }
  };

  const tryDownloadLink = async (
    fileName: string,
    content: string,
    mimeType: string
  ): Promise<boolean> => {
    try {
      // This method works in browsers
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      alert(`✅ Drawing downloaded as ${fileName}`);
      console.log('Successfully downloaded via download link');
      return true;
    } catch (error) {
      console.warn('Download link method failed:', error);
      return false;
    }
  };

  const saveToFilesystem = async (
    fileName: string,
    content: string,
    pointCount: number,
    isAnonymized: boolean
  ): Promise<void> => {
    const dataToWrite = content;
    const encoding = Encoding.UTF8;

    try {
      await Filesystem.writeFile({
        path: fileName,
        data: dataToWrite,
        directory: Directory.ExternalStorage,
        encoding: encoding,
      });
      
      const exportType = isAnonymized ? 'anonymized' : 'exact';
      alert(`✅ Drawing exported to Downloads/${fileName} (${exportType}, ${pointCount} points)`);
    } catch (externalError) {
      console.warn('External storage failed, trying Documents:', externalError);
      
              await Filesystem.writeFile({
          path: fileName,
          data: dataToWrite,
          directory: Directory.Documents,
          encoding: encoding,
        });
      
      const exportType = isAnonymized ? 'anonymized' : 'exact';
      alert(`✅ Drawing exported to Documents/${fileName} (${exportType}, ${pointCount} points)`);
    }
  };

  const handleExportError = (error: any): void => {
    if (error.message?.includes('permission')) {
      alert('❌ Export failed: Storage permission denied. Please check app permissions.');
    } else if (error.message?.includes('space')) {
      alert('❌ Export failed: Not enough storage space.');
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      alert('❌ Export failed: Network error. Please check your connection.');
    } else {
      alert(`❌ Export failed: ${error.message || 'Unknown error'}. Check console for details.`);
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

  const generateSVGFromCanvas = (
    _canvas: HTMLCanvasElement, 
    _ctx: CanvasRenderingContext2D, 
    logicalWidth: number, 
    logicalHeight: number, 
    _dpr: number,
    points: Point[],
    isAnonymized: boolean,
    anonymizationOrigin: AnonymizationOrigin | null
  ): string => {
    // Create SVG header optimized for Google Drive preview
    const svgHeader = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${logicalWidth}" height="${logicalHeight}" viewBox="0 0 ${logicalWidth} ${logicalHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <style type="text/css">
      .gps-path { stroke: #ffffff; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
      .gps-point { fill: #ffffff; }
    </style>
  </defs>
  <rect width="${logicalWidth}" height="${logicalHeight}" fill="#000000"/>`;

    // Get display points (anonymized if needed)
    const displayPoints = isAnonymized && anonymizationOrigin 
      ? anonymizePoints(points, anonymizationOrigin) 
      : points;

    // Calculate bounds for projection
    const bounds = calculateBounds(displayPoints);

    // Generate SVG path from points
    let pathElement = '';
    let lastPointElement = '';

    if (displayPoints.length > 0 && bounds) {
      // Create path for the GPS track
      if (displayPoints.length > 1) {
        const pathData = displayPoints.map((point, index) => {
          const { x, y } = project(point, bounds, logicalWidth, logicalHeight);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
        
        pathElement = `<path d="${pathData}" class="gps-path"/>`;
      }

      // Create circle only for the last point
      if (displayPoints.length > 0) {
        const lastPoint = displayPoints[displayPoints.length - 1];
        const { x, y } = project(lastPoint, bounds, logicalWidth, logicalHeight);
        lastPointElement = `<circle cx="${x}" cy="${y}" r="4" class="gps-point"/>`;
      }
    }

    // Complete SVG content with minimal metadata for better preview
    const svgContent = `${svgHeader}
  
  <!-- GPS Path -->
  ${pathElement}
  
  <!-- Last GPS Point -->
  ${lastPointElement}
  
  <!-- Metadata for preview systems -->
  <metadata>
    <title>GPS Drawing</title>
    <description>GPS movement visualization with ${displayPoints.length} points</description>
  </metadata>
</svg>`;

    return svgContent;
  };

  return {
    savePointsToFile,
    loadPointsFromFile,
    exportPoints,
    exportCanvasAsImage,
    clearAllData
  };
}