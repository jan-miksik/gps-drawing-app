import { CANVAS_CONFIG } from '../constants/gpsConstants';
export var project = function (point, currentBounds, canvasLogicalWidth, canvasLogicalHeight) {
    // If only one point exists (or bounds indicate no range), center it.
    if (currentBounds.minLat === currentBounds.maxLat || currentBounds.minLon === currentBounds.maxLon) {
        return {
            x: (canvasLogicalWidth - 2 * CANVAS_CONFIG.DRAWING_PADDING) / 2 + CANVAS_CONFIG.DRAWING_PADDING,
            y: (canvasLogicalHeight - 2 * CANVAS_CONFIG.DRAWING_PADDING) / 2 + CANVAS_CONFIG.DRAWING_PADDING,
        };
    }
    var latRange = currentBounds.maxLat - currentBounds.minLat;
    var lonRange = currentBounds.maxLon - currentBounds.minLon;
    var drawableWidth = canvasLogicalWidth - 2 * CANVAS_CONFIG.DRAWING_PADDING;
    var drawableHeight = canvasLogicalHeight - 2 * CANVAS_CONFIG.DRAWING_PADDING;
    // Handle potential division by zero if range is extremely small (though bounds check helps)
    var scaleX = lonRange > 1e-9 ? drawableWidth / lonRange : 1;
    var scaleY = latRange > 1e-9 ? drawableHeight / latRange : 1;
    // Use the smaller scale to fit the entire drawing within the drawable area and maintain aspect ratio
    var baseScale = Math.min(scaleX, scaleY);
    // Calculate the center of the bounds in lat/lon
    var centerXLatLon = (currentBounds.minLat + currentBounds.maxLat) / 2;
    var centerYLatLon = (currentBounds.minLon + currentBounds.maxLon) / 2;
    // Calculate the center of the drawable area on canvas
    var canvasCenterX = drawableWidth / 2 + CANVAS_CONFIG.DRAWING_PADDING;
    var canvasCenterY = drawableHeight / 2 + CANVAS_CONFIG.DRAWING_PADDING;
    // Project the point:
    // 1. Get offset from the center of the bounds (in lat/lon units, scaled by baseScale)
    // 2. Add to canvas center
    // Y is inverted because canvas Y increases downwards, latitude increases upwards
    var x = canvasCenterX + (point.lon - centerYLatLon) * baseScale;
    var y = canvasCenterY - (point.lat - centerXLatLon) * baseScale;
    return { x: x, y: y };
};
export var calculateBounds = function (points) {
    if (points.length === 0) {
        return null;
    }
    if (points.length === 1) {
        // For a single point, create a small default bound around it
        var p = points[0];
        var delta = 0.0001; // Small delta for single point bounds
        return {
            minLat: p.lat - delta,
            maxLat: p.lat + delta,
            minLon: p.lon - delta,
            maxLon: p.lon + delta,
        };
    }
    var lats = points.map(function (p) { return p.lat; });
    var lons = points.map(function (p) { return p.lon; });
    return {
        minLat: Math.min.apply(Math, lats),
        maxLat: Math.max.apply(Math, lats),
        minLon: Math.min.apply(Math, lons),
        maxLon: Math.max.apply(Math, lons),
    };
};
export var drawCenterCross = function (ctx, logicalWidth, logicalHeight, scale, dpr) {
    var centerX = logicalWidth / 2;
    var centerY = logicalHeight / 2;
    var crossSize = CANVAS_CONFIG.CROSS_SIZE / scale;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = CANVAS_CONFIG.LINE_WIDTH / (scale * dpr);
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
