import type { Point, Bounds } from '../types/gps';
import { CANVAS_CONFIG } from '../constants/gpsConstants';

export const project = (
  point: { lat: number; lon: number },
  currentBounds: Bounds,
  canvasLogicalWidth: number,
  canvasLogicalHeight: number
): { x: number; y: number } => {
  // If only one point exists (or bounds indicate no range), center it.
  if (currentBounds.minLat === currentBounds.maxLat || currentBounds.minLon === currentBounds.maxLon) {
    return {
        x: (canvasLogicalWidth - 2 * CANVAS_CONFIG.value.DRAWING_PADDING) / 2 + CANVAS_CONFIG.value.DRAWING_PADDING,
  y: (canvasLogicalHeight - 2 * CANVAS_CONFIG.value.DRAWING_PADDING) / 2 + CANVAS_CONFIG.value.DRAWING_PADDING,
    };
  }

  const latRange = currentBounds.maxLat - currentBounds.minLat;
  const lonRange = currentBounds.maxLon - currentBounds.minLon;

  const drawableWidth = canvasLogicalWidth - 2 * CANVAS_CONFIG.value.DRAWING_PADDING;
  const drawableHeight = canvasLogicalHeight - 2 * CANVAS_CONFIG.value.DRAWING_PADDING;

  // Handle potential division by zero if range is extremely small (though bounds check helps)
  const scaleX = lonRange > 1e-9 ? drawableWidth / lonRange : 1;
  const scaleY = latRange > 1e-9 ? drawableHeight / latRange : 1;

  // Use the smaller scale to fit the entire drawing within the drawable area and maintain aspect ratio
  const baseScale = Math.min(scaleX, scaleY);

  // Calculate the center of the bounds in lat/lon
  const centerXLatLon = (currentBounds.minLat + currentBounds.maxLat) / 2;
  const centerYLatLon = (currentBounds.minLon + currentBounds.maxLon) / 2;

  // Calculate the center of the drawable area on canvas
  const canvasCenterX = drawableWidth / 2 + CANVAS_CONFIG.value.DRAWING_PADDING;
  const canvasCenterY = drawableHeight / 2 + CANVAS_CONFIG.value.DRAWING_PADDING;

  // Project the point:
  // 1. Get offset from the center of the bounds (in lat/lon units, scaled by baseScale)
  // 2. Add to canvas center
  // Y is inverted because canvas Y increases downwards, latitude increases upwards
  const x = canvasCenterX + (point.lon - centerYLatLon) * baseScale;
  const y = canvasCenterY - (point.lat - centerXLatLon) * baseScale;

  return { x, y };
};

export const calculateBounds = (points: Point[]): Bounds | null => {
  if (points.length === 0) {
    return null;
  }
  
  if (points.length === 1) {
    // For a single point, create a small default bound around it
    const p = points[0];
    const delta = 0.0001; // Small delta for single point bounds
    return {
      minLat: p.lat - delta,
      maxLat: p.lat + delta,
      minLon: p.lon - delta,
      maxLon: p.lon + delta,
    };
  }

  const lats = points.map(p => p.lat);
  const lons = points.map(p => p.lon);

  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
  };
};

export const drawCenterCross = (
  ctx: CanvasRenderingContext2D,
  logicalWidth: number,
  logicalHeight: number,
  scale: number,
  dpr: number
): void => {
  const centerX = logicalWidth / 2;
  const centerY = logicalHeight / 2;
  const crossSize = CANVAS_CONFIG.value.CROSS_SIZE / scale;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = CANVAS_CONFIG.value.LINE_WIDTH / (scale * dpr);
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  // Horizontal line
  ctx.moveTo(centerX - crossSize, centerY);
  ctx.lineTo(centerX + crossSize, centerY);
  // Vertical line
  ctx.moveTo(centerX, centerY - crossSize);
  ctx.lineTo(centerX, centerY + crossSize);
  ctx.stroke();
}; 