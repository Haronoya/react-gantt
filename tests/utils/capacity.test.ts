import { describe, it, expect } from 'vitest';
import {
  calculateCapacity,
  getCapacityStatusClass,
  getCapacityColor,
} from '../../src/utils/capacity';
import type { NormalizedTask } from '../../src/types/task';
import type { NonWorkingPeriod } from '../../src/types/nonWorkingTime';

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

describe('capacity utilities', () => {
  const createTask = (
    id: string,
    resourceId: string,
    start: number,
    end: number
  ): NormalizedTask => ({
    id,
    title: `Task ${id}`,
    start,
    end,
    resourceId,
    depth: 0,
    hasChildren: false,
    visible: true,
    visibleIndex: 0,
  });

  describe('calculateCapacity', () => {
    const viewStart = 0;
    const viewEnd = MS_PER_DAY; // 1 day = 24 hours

    it('should return 0 utilization for resource with no tasks', () => {
      const tasks: NormalizedTask[] = [];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd);

      expect(result.utilization).toBe(0);
      expect(result.allocatedHours).toBe(0);
      expect(result.availableHours).toBe(24);
      expect(result.overloaded).toBe(false);
    });

    it('should calculate correct utilization for single task', () => {
      const tasks = [
        createTask('t1', 'r1', 0, 12 * MS_PER_HOUR), // 12 hours
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd);

      expect(result.utilization).toBeCloseTo(0.5, 2);
      expect(result.allocatedHours).toBe(12);
      expect(result.availableHours).toBe(24);
      expect(result.overloaded).toBe(false);
    });

    it('should calculate 100% utilization for fully allocated', () => {
      const tasks = [
        createTask('t1', 'r1', 0, MS_PER_DAY), // Full day
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd);

      expect(result.utilization).toBeCloseTo(1, 2);
      expect(result.overloaded).toBe(false);
    });

    it('should detect overload when utilization > 100%', () => {
      const tasks = [
        createTask('t1', 'r1', 0, MS_PER_DAY), // Full day
        createTask('t2', 'r1', 0, 12 * MS_PER_HOUR), // Additional 12 hours (overlapping)
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd);

      expect(result.utilization).toBeGreaterThan(1);
      expect(result.overloaded).toBe(true);
    });

    it('should only count tasks for the specified resource', () => {
      const tasks = [
        createTask('t1', 'r1', 0, 12 * MS_PER_HOUR),
        createTask('t2', 'r2', 0, 12 * MS_PER_HOUR), // Different resource
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd);

      expect(result.allocatedHours).toBe(12);
    });

    it('should only count task time within view range', () => {
      const tasks = [
        createTask('t1', 'r1', -12 * MS_PER_HOUR, 12 * MS_PER_HOUR), // Starts before view
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd);

      expect(result.allocatedHours).toBe(12); // Only the part within view
    });

    it('should exclude non-working periods from available time', () => {
      const tasks = [
        createTask('t1', 'r1', 0, 12 * MS_PER_HOUR),
      ];
      const nonWorkingPeriods: NonWorkingPeriod[] = [
        { id: 'nw1', start: 12 * MS_PER_HOUR, end: MS_PER_DAY }, // 12 hours off
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd, nonWorkingPeriods);

      expect(result.availableHours).toBe(12); // 24 - 12 non-working
      expect(result.utilization).toBeCloseTo(1, 2); // 12/12 = 100%
    });

    it('should only consider non-working periods for the resource', () => {
      const tasks = [
        createTask('t1', 'r1', 0, 12 * MS_PER_HOUR),
      ];
      const nonWorkingPeriods: NonWorkingPeriod[] = [
        { id: 'nw1', start: 12 * MS_PER_HOUR, end: MS_PER_DAY, resourceId: 'r2' }, // Different resource
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd, nonWorkingPeriods);

      expect(result.availableHours).toBe(24); // Non-working period doesn't apply
    });

    it('should apply global non-working periods (no resourceId)', () => {
      const tasks = [
        createTask('t1', 'r1', 0, 6 * MS_PER_HOUR),
      ];
      const nonWorkingPeriods: NonWorkingPeriod[] = [
        { id: 'nw1', start: 12 * MS_PER_HOUR, end: MS_PER_DAY }, // Global - applies to all
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd, nonWorkingPeriods);

      expect(result.availableHours).toBe(12);
    });

    it('should cap utilization at 200%', () => {
      const tasks = [
        createTask('t1', 'r1', 0, MS_PER_DAY),
        createTask('t2', 'r1', 0, MS_PER_DAY),
        createTask('t3', 'r1', 0, MS_PER_DAY), // 300% theoretical
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd);

      expect(result.utilization).toBe(2); // Capped at 200%
    });

    it('should handle zero available time', () => {
      const tasks = [
        createTask('t1', 'r1', 0, 12 * MS_PER_HOUR),
      ];
      const nonWorkingPeriods: NonWorkingPeriod[] = [
        { id: 'nw1', start: 0, end: MS_PER_DAY }, // Entire period is non-working
      ];
      const result = calculateCapacity('r1', tasks, viewStart, viewEnd, nonWorkingPeriods);

      expect(result.utilization).toBe(0);
      expect(result.availableHours).toBe(0);
    });
  });

  describe('getCapacityStatusClass', () => {
    it('should return normal for low utilization', () => {
      expect(getCapacityStatusClass(0.5)).toBe('capacity-normal');
      expect(getCapacityStatusClass(0.79)).toBe('capacity-normal');
    });

    it('should return warning for utilization at threshold', () => {
      expect(getCapacityStatusClass(0.8)).toBe('capacity-warning');
      expect(getCapacityStatusClass(0.9)).toBe('capacity-warning');
    });

    it('should return critical for utilization at 100%+', () => {
      expect(getCapacityStatusClass(1.0)).toBe('capacity-critical');
      expect(getCapacityStatusClass(1.5)).toBe('capacity-critical');
    });

    it('should respect custom thresholds', () => {
      expect(getCapacityStatusClass(0.6, 0.5, 0.7)).toBe('capacity-warning');
      expect(getCapacityStatusClass(0.6, 0.7, 0.9)).toBe('capacity-normal');
    });
  });

  describe('getCapacityColor', () => {
    it('should return normal color for low utilization', () => {
      expect(getCapacityColor(0.5)).toBe('var(--gantt-capacity-normal)');
    });

    it('should return warning color for medium utilization', () => {
      expect(getCapacityColor(0.85)).toBe('var(--gantt-capacity-warning)');
    });

    it('should return critical color for high utilization', () => {
      expect(getCapacityColor(1.0)).toBe('var(--gantt-capacity-critical)');
      expect(getCapacityColor(1.5)).toBe('var(--gantt-capacity-critical)');
    });

    it('should respect custom thresholds', () => {
      expect(getCapacityColor(0.6, 0.5, 0.7)).toBe('var(--gantt-capacity-warning)');
      expect(getCapacityColor(0.6, 0.7, 0.9)).toBe('var(--gantt-capacity-normal)');
    });
  });
});
