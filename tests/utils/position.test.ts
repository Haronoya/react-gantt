import { describe, it, expect } from 'vitest';
import {
  timestampToPixel,
  pixelToTimestamp,
  calculateTaskPosition,
  calculateMilestonePosition,
  calculateTimelineWidth,
  isInViewport,
  getVisibleTimeRange,
} from '../../src/utils/position';
import { MS_PER_DAY } from '../../src/constants';

describe('position utilities', () => {
  const viewStart = new Date('2024-01-01T00:00:00Z').getTime();
  const pixelsPerDay = 50;

  describe('timestampToPixel', () => {
    it('should return 0 for timestamp equal to viewStart', () => {
      const result = timestampToPixel(viewStart, viewStart, pixelsPerDay);
      expect(result).toBe(0);
    });

    it('should return correct pixel position for 1 day offset', () => {
      const oneDay = viewStart + MS_PER_DAY;
      const result = timestampToPixel(oneDay, viewStart, pixelsPerDay);
      expect(result).toBe(pixelsPerDay);
    });

    it('should return negative value for timestamp before viewStart', () => {
      const beforeStart = viewStart - MS_PER_DAY;
      const result = timestampToPixel(beforeStart, viewStart, pixelsPerDay);
      expect(result).toBe(-pixelsPerDay);
    });

    it('should handle fractional days', () => {
      const halfDay = viewStart + MS_PER_DAY / 2;
      const result = timestampToPixel(halfDay, viewStart, pixelsPerDay);
      expect(result).toBe(pixelsPerDay / 2);
    });
  });

  describe('pixelToTimestamp', () => {
    it('should return viewStart for pixel 0', () => {
      const result = pixelToTimestamp(0, viewStart, pixelsPerDay);
      expect(result).toBe(viewStart);
    });

    it('should return correct timestamp for pixel offset', () => {
      const result = pixelToTimestamp(pixelsPerDay, viewStart, pixelsPerDay);
      expect(result).toBe(viewStart + MS_PER_DAY);
    });

    it('should be inverse of timestampToPixel', () => {
      const timestamp = viewStart + 2.5 * MS_PER_DAY;
      const pixel = timestampToPixel(timestamp, viewStart, pixelsPerDay);
      const result = pixelToTimestamp(pixel, viewStart, pixelsPerDay);
      expect(result).toBeCloseTo(timestamp, 0);
    });
  });

  describe('calculateTaskPosition', () => {
    const zoomConfig = {
      pixelsPerDay: 50,
      primaryFormat: 'YYYY/MM',
      secondaryFormat: 'D',
      snapMs: MS_PER_DAY,
      primaryUnitDays: 30,
      secondaryUnitDays: 1,
    };
    const rowHeight = 36;

    it('should calculate correct left position', () => {
      const start = viewStart + MS_PER_DAY;
      const end = viewStart + 3 * MS_PER_DAY;
      const result = calculateTaskPosition(start, end, 0, viewStart, zoomConfig, rowHeight);
      expect(result.left).toBe(50);
    });

    it('should calculate correct width', () => {
      const start = viewStart + MS_PER_DAY;
      const end = viewStart + 3 * MS_PER_DAY;
      const result = calculateTaskPosition(start, end, 0, viewStart, zoomConfig, rowHeight);
      expect(result.width).toBe(100); // 2 days * 50 pixels/day
    });

    it('should calculate correct top position for different row indices', () => {
      const start = viewStart;
      const end = viewStart + MS_PER_DAY;

      const row0 = calculateTaskPosition(start, end, 0, viewStart, zoomConfig, rowHeight);
      const row1 = calculateTaskPosition(start, end, 1, viewStart, zoomConfig, rowHeight);
      const row2 = calculateTaskPosition(start, end, 2, viewStart, zoomConfig, rowHeight);

      expect(row1.top - row0.top).toBe(rowHeight);
      expect(row2.top - row1.top).toBe(rowHeight);
    });

    it('should have minimum width of 1px', () => {
      const start = viewStart;
      const end = viewStart; // Same time = 0 duration
      const result = calculateTaskPosition(start, end, 0, viewStart, zoomConfig, rowHeight);
      expect(result.width).toBeGreaterThanOrEqual(1);
    });

    it('should respect barHeightRatio', () => {
      const start = viewStart;
      const end = viewStart + MS_PER_DAY;
      const result1 = calculateTaskPosition(start, end, 0, viewStart, zoomConfig, rowHeight, 0.5);
      const result2 = calculateTaskPosition(start, end, 0, viewStart, zoomConfig, rowHeight, 0.8);

      expect(result1.height).toBe(rowHeight * 0.5);
      expect(result2.height).toBe(rowHeight * 0.8);
    });
  });

  describe('calculateMilestonePosition', () => {
    const zoomConfig = {
      pixelsPerDay: 50,
      primaryFormat: 'YYYY/MM',
      secondaryFormat: 'D',
      snapMs: MS_PER_DAY,
      primaryUnitDays: 30,
      secondaryUnitDays: 1,
    };
    const rowHeight = 36;

    it('should center milestone on timestamp', () => {
      const timestamp = viewStart + MS_PER_DAY;
      const result = calculateMilestonePosition(timestamp, 0, viewStart, zoomConfig, rowHeight);

      // The milestone should be centered at pixel 50
      const centerX = result.left + result.width / 2;
      expect(centerX).toBeCloseTo(50, 0);
    });

    it('should have square dimensions', () => {
      const timestamp = viewStart;
      const result = calculateMilestonePosition(timestamp, 0, viewStart, zoomConfig, rowHeight);
      expect(result.width).toBe(result.height);
    });
  });

  describe('calculateTimelineWidth', () => {
    it('should calculate width based on duration', () => {
      const viewEnd = viewStart + 10 * MS_PER_DAY;
      const result = calculateTimelineWidth(viewStart, viewEnd, pixelsPerDay);
      expect(result).toBe(500); // 10 days * 50 pixels/day
    });

    it('should return 0 for zero duration', () => {
      const result = calculateTimelineWidth(viewStart, viewStart, pixelsPerDay);
      expect(result).toBe(0);
    });

    it('should return 0 for negative duration (viewEnd < viewStart)', () => {
      const viewEnd = viewStart - MS_PER_DAY;
      const result = calculateTimelineWidth(viewStart, viewEnd, pixelsPerDay);
      expect(result).toBe(0);
    });
  });

  describe('isInViewport', () => {
    const viewportLeft = 100;
    const viewportWidth = 500;

    it('should return true for element fully inside viewport', () => {
      const result = isInViewport(200, 100, viewportLeft, viewportWidth);
      expect(result).toBe(true);
    });

    it('should return true for element partially visible on left', () => {
      const result = isInViewport(50, 100, viewportLeft, viewportWidth);
      expect(result).toBe(true);
    });

    it('should return true for element partially visible on right', () => {
      const result = isInViewport(550, 100, viewportLeft, viewportWidth);
      expect(result).toBe(true);
    });

    it('should return false for element completely to the left', () => {
      const result = isInViewport(0, 50, viewportLeft, viewportWidth);
      expect(result).toBe(false);
    });

    it('should return false for element completely to the right', () => {
      const result = isInViewport(700, 50, viewportLeft, viewportWidth);
      expect(result).toBe(false);
    });

    it('should include buffer zone', () => {
      // Element is 50px outside viewport, but buffer is 100px
      const result = isInViewport(0, 50, viewportLeft, viewportWidth, 100);
      expect(result).toBe(true);
    });
  });

  describe('getVisibleTimeRange', () => {
    it('should calculate visible time range from scroll position', () => {
      const scrollLeft = 100;
      const viewportWidth = 500;
      const result = getVisibleTimeRange(scrollLeft, viewportWidth, viewStart, pixelsPerDay);

      expect(result.visibleStart).toBe(pixelToTimestamp(scrollLeft, viewStart, pixelsPerDay));
      expect(result.visibleEnd).toBe(pixelToTimestamp(scrollLeft + viewportWidth, viewStart, pixelsPerDay));
    });

    it('should return correct duration', () => {
      const scrollLeft = 0;
      const viewportWidth = 500; // 10 days at 50px/day
      const result = getVisibleTimeRange(scrollLeft, viewportWidth, viewStart, pixelsPerDay);

      const durationMs = result.visibleEnd - result.visibleStart;
      expect(durationMs).toBeCloseTo(10 * MS_PER_DAY, 0);
    });
  });
});
