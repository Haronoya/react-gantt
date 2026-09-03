import { describe, it, expect } from 'vitest';
import {
  toTimestamp,
  toDate,
  startOfDay,
  endOfDay,
  addDays,
  addMonths,
  diffInDays,
  isSameDay,
  isWeekend,
  snapToUnit,
  getDateRange,
} from '../../src/utils/date';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

describe('date utilities', () => {
  describe('toTimestamp', () => {
    it('should return timestamp from Date', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      expect(toTimestamp(date)).toBe(date.getTime());
    });

    it('should return number as-is', () => {
      const timestamp = 1705276800000;
      expect(toTimestamp(timestamp)).toBe(timestamp);
    });
  });

  describe('toDate', () => {
    it('should convert timestamp to Date', () => {
      const timestamp = 1705276800000;
      const date = toDate(timestamp);
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBe(timestamp);
    });
  });

  describe('startOfDay', () => {
    it('should return start of day', () => {
      const timestamp = new Date('2024-01-15T15:30:00').getTime();
      const result = startOfDay(timestamp);
      const resultDate = new Date(result);

      expect(resultDate.getHours()).toBe(0);
      expect(resultDate.getMinutes()).toBe(0);
      expect(resultDate.getSeconds()).toBe(0);
      expect(resultDate.getMilliseconds()).toBe(0);
    });
  });

  describe('endOfDay', () => {
    it('should return end of day', () => {
      const timestamp = new Date('2024-01-15T15:30:00').getTime();
      const result = endOfDay(timestamp);
      const resultDate = new Date(result);

      expect(resultDate.getHours()).toBe(23);
      expect(resultDate.getMinutes()).toBe(59);
      expect(resultDate.getSeconds()).toBe(59);
      expect(resultDate.getMilliseconds()).toBe(999);
    });
  });

  describe('addDays', () => {
    it('should add positive days', () => {
      const timestamp = new Date('2024-01-15').getTime();
      const result = addDays(timestamp, 5);
      expect(new Date(result).getDate()).toBe(20);
    });

    it('should subtract with negative days', () => {
      const timestamp = new Date('2024-01-15').getTime();
      const result = addDays(timestamp, -5);
      expect(new Date(result).getDate()).toBe(10);
    });
  });

  describe('addMonths', () => {
    it('should add months', () => {
      const timestamp = new Date('2024-01-15').getTime();
      const result = addMonths(timestamp, 2);
      expect(new Date(result).getMonth()).toBe(2); // March
    });

    it('should handle month overflow', () => {
      const timestamp = new Date('2024-01-31').getTime();
      const result = addMonths(timestamp, 1);
      // Feb doesn't have 31 days, should go to Feb 29 (2024 is leap year)
      const resultDate = new Date(result);
      expect(resultDate.getMonth()).toBe(1); // February
    });
  });

  describe('diffInDays', () => {
    it('should calculate difference in days', () => {
      const start = new Date('2024-01-15').getTime();
      const end = new Date('2024-01-20').getTime();
      expect(diffInDays(start, end)).toBe(5);
    });

    it('should handle negative difference', () => {
      const start = new Date('2024-01-20').getTime();
      const end = new Date('2024-01-15').getTime();
      expect(diffInDays(start, end)).toBe(-5);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const a = new Date('2024-01-15T10:00:00').getTime();
      const b = new Date('2024-01-15T20:00:00').getTime();
      expect(isSameDay(a, b)).toBe(true);
    });

    it('should return false for different days', () => {
      const a = new Date('2024-01-15T10:00:00').getTime();
      const b = new Date('2024-01-16T10:00:00').getTime();
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe('isWeekend', () => {
    it('should return true for Saturday', () => {
      const saturday = new Date('2024-01-13').getTime(); // Saturday
      expect(isWeekend(saturday)).toBe(true);
    });

    it('should return true for Sunday', () => {
      const sunday = new Date('2024-01-14').getTime(); // Sunday
      expect(isWeekend(sunday)).toBe(true);
    });

    it('should return false for weekday', () => {
      const monday = new Date('2024-01-15').getTime(); // Monday
      expect(isWeekend(monday)).toBe(false);
    });
  });

  describe('snapToUnit', () => {
    it('should snap day units to local midnight (not UTC midnight)', () => {
      // 12:00 local + 1ms rounds up to the next local midnight
      const afterNoon = new Date(2024, 0, 15, 12, 0, 0, 1).getTime();
      expect(snapToUnit(afterNoon, MS_PER_DAY)).toBe(new Date(2024, 0, 16).getTime());
      // 03:00 local rounds down to the same local midnight
      const early = new Date(2024, 0, 15, 3).getTime();
      expect(snapToUnit(early, MS_PER_DAY)).toBe(new Date(2024, 0, 15).getTime());
    });

    it('should keep a local-midnight timestamp unchanged when shifted by whole days', () => {
      const midnight = new Date(2024, 0, 15).getTime();
      expect(snapToUnit(midnight + MS_PER_DAY, MS_PER_DAY)).toBe(new Date(2024, 0, 16).getTime());
      expect(snapToUnit(midnight - MS_PER_DAY, MS_PER_DAY)).toBe(new Date(2024, 0, 14).getTime());
    });

    it('should snap hour units to the nearest local hour', () => {
      const t = new Date(2024, 0, 15, 10, 40).getTime();
      expect(snapToUnit(t, 60 * 60 * 1000)).toBe(new Date(2024, 0, 15, 11).getTime());
    });
  });

  describe('getDateRange', () => {
    it('should return range covering all timestamps with padding', () => {
      const timestamps = [
        new Date('2024-01-10').getTime(),
        new Date('2024-01-20').getTime(),
      ];
      const result = getDateRange(timestamps, 7);

      expect(result.start).toBeLessThanOrEqual(timestamps[0]);
      expect(result.end).toBeGreaterThanOrEqual(timestamps[1]);
    });

    it('should return default range for empty array', () => {
      const result = getDateRange([]);
      expect(result.start).toBeLessThan(result.end);
    });
  });
});
