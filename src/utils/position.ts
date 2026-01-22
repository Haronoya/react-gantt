import { MS_PER_DAY } from '../constants';
import type { ZoomConfig } from '../types';

/**
 * Calculate pixel position from timestamp
 */
export function timestampToPixel(
  timestamp: number,
  viewStart: number,
  pixelsPerDay: number
): number {
  const msPerPixel = MS_PER_DAY / pixelsPerDay;
  return (timestamp - viewStart) / msPerPixel;
}

/**
 * Calculate timestamp from pixel position
 */
export function pixelToTimestamp(
  pixel: number,
  viewStart: number,
  pixelsPerDay: number
): number {
  const msPerPixel = MS_PER_DAY / pixelsPerDay;
  return viewStart + pixel * msPerPixel;
}

/**
 * Calculate task bar position and dimensions
 */
export interface TaskPosition {
  left: number;
  width: number;
  top: number;
  height: number;
}

export function calculateTaskPosition(
  start: number,
  end: number,
  rowIndex: number,
  viewStart: number,
  zoomConfig: ZoomConfig,
  rowHeight: number,
  barHeightRatio = 0.65
): TaskPosition {
  const left = timestampToPixel(start, viewStart, zoomConfig.pixelsPerDay);
  const right = timestampToPixel(end, viewStart, zoomConfig.pixelsPerDay);
  const width = Math.max(right - left, 1); // Minimum 1px width

  const barHeight = rowHeight * barHeightRatio;
  const top = rowIndex * rowHeight + (rowHeight - barHeight) / 2;

  return {
    left,
    width,
    top,
    height: barHeight,
  };
}

/**
 * Calculate milestone position (point in time)
 */
export function calculateMilestonePosition(
  timestamp: number,
  rowIndex: number,
  viewStart: number,
  zoomConfig: ZoomConfig,
  rowHeight: number,
  barHeightRatio = 0.65
): TaskPosition {
  const center = timestampToPixel(timestamp, viewStart, zoomConfig.pixelsPerDay);
  const barHeight = rowHeight * barHeightRatio;
  const size = barHeight;

  return {
    left: center - size / 2,
    width: size,
    top: rowIndex * rowHeight + (rowHeight - barHeight) / 2,
    height: barHeight,
  };
}

/**
 * Calculate total timeline width in pixels
 */
export function calculateTimelineWidth(
  viewStart: number,
  viewEnd: number,
  pixelsPerDay: number
): number {
  // Ensure viewEnd >= viewStart to avoid negative width
  const duration = Math.max(0, viewEnd - viewStart);
  const days = duration / MS_PER_DAY;
  return Math.max(0, days * pixelsPerDay);
}

/**
 * Check if a position is within visible bounds
 */
export function isInViewport(
  left: number,
  width: number,
  viewportLeft: number,
  viewportWidth: number,
  buffer = 0
): boolean {
  const right = left + width;
  const viewportRight = viewportLeft + viewportWidth;
  return right >= viewportLeft - buffer && left <= viewportRight + buffer;
}

/**
 * Get visible time range from scroll position
 */
export function getVisibleTimeRange(
  scrollLeft: number,
  viewportWidth: number,
  viewStart: number,
  pixelsPerDay: number
): { visibleStart: number; visibleEnd: number } {
  const visibleStart = pixelToTimestamp(scrollLeft, viewStart, pixelsPerDay);
  const visibleEnd = pixelToTimestamp(scrollLeft + viewportWidth, viewStart, pixelsPerDay);
  return { visibleStart, visibleEnd };
}
