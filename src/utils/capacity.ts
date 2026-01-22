import type { NormalizedTask } from '../types/task';
import type { NonWorkingPeriod } from '../types/nonWorkingTime';
import type { CapacityInfo } from '../types/capacity';

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Calculate capacity utilization for a resource within a time range
 */
export function calculateCapacity(
  resourceId: string,
  tasks: NormalizedTask[],
  viewStart: number,
  viewEnd: number,
  nonWorkingPeriods?: NonWorkingPeriod[]
): CapacityInfo {
  // Filter tasks for this resource
  const resourceTasks = tasks.filter((t) => t.resourceId === resourceId);

  // Calculate allocated time within view
  let allocatedMs = 0;
  resourceTasks.forEach((task) => {
    const start = Math.max(task.start, viewStart);
    const end = Math.min(task.end, viewEnd);
    if (end > start) {
      allocatedMs += end - start;
    }
  });

  // Calculate available time (excluding non-working periods)
  let availableMs = viewEnd - viewStart;
  if (nonWorkingPeriods) {
    nonWorkingPeriods
      .filter((p) => !p.resourceId || p.resourceId === resourceId)
      .forEach((period) => {
        const start = Math.max(period.start, viewStart);
        const end = Math.min(period.end, viewEnd);
        if (end > start) {
          availableMs -= end - start;
        }
      });
  }

  // Calculate utilization
  const utilization = availableMs > 0 ? allocatedMs / availableMs : 0;

  return {
    resourceId,
    utilization: Math.min(utilization, 2), // Cap at 200%
    allocatedHours: allocatedMs / MS_PER_HOUR,
    availableHours: availableMs / MS_PER_HOUR,
    overloaded: utilization > 1,
  };
}

/**
 * Get CSS class name for capacity status
 */
export function getCapacityStatusClass(
  utilization: number,
  warningThreshold = 0.8,
  criticalThreshold = 1.0
): string {
  if (utilization >= criticalThreshold) {
    return 'capacity-critical';
  }
  if (utilization >= warningThreshold) {
    return 'capacity-warning';
  }
  return 'capacity-normal';
}

/**
 * Get color for capacity status
 */
export function getCapacityColor(
  utilization: number,
  warningThreshold = 0.8,
  criticalThreshold = 1.0
): string {
  if (utilization >= criticalThreshold) {
    return 'var(--gantt-capacity-critical)';
  }
  if (utilization >= warningThreshold) {
    return 'var(--gantt-capacity-warning)';
  }
  return 'var(--gantt-capacity-normal)';
}
