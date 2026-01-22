'use client';

import { memo, useMemo } from 'react';
import type { NonWorkingPeriod, WorkingHours } from '../../types/nonWorkingTime';
import type { ZoomConfig } from '../../types/view';
import { timestampToPixel } from '../../utils/position';
import { startOfDay, addDays } from '../../utils/date';
import { MS_PER_DAY } from '../../constants';

interface NonWorkingTimeLayerProps {
  periods?: NonWorkingPeriod[];
  workingHours?: WorkingHours;
  viewStart: number;
  viewEnd: number;
  zoomConfig: ZoomConfig;
  containerHeight: number;
  highlightWeekends?: boolean;
}

interface ExpandedPeriod {
  start: number;
  end: number;
  type?: string;
  color?: string;
}

/**
 * Parse time string "HH:mm" to minutes from midnight
 */
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Expand recurring patterns within the view range
 */
function expandRecurringPeriod(
  period: NonWorkingPeriod,
  viewStart: number,
  viewEnd: number,
  result: ExpandedPeriod[]
): void {
  if (!period.recurring) return;

  const { type, daysOfWeek } = period.recurring;

  if (type === 'weekly' && daysOfWeek) {
    let current = startOfDay(viewStart);
    while (current < viewEnd) {
      const dayOfWeek = new Date(current).getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        result.push({
          start: current,
          end: addDays(current, 1),
          type: period.type,
          color: period.color,
        });
      }
      current = addDays(current, 1);
    }
  }
}

export const NonWorkingTimeLayer = memo(function NonWorkingTimeLayer({
  periods = [],
  workingHours,
  viewStart,
  viewEnd,
  zoomConfig,
  containerHeight,
  highlightWeekends = true,
}: NonWorkingTimeLayerProps) {
  // Expand all periods including weekends and working hours
  const expandedPeriods = useMemo(() => {
    const result: ExpandedPeriod[] = [];

    // Handle weekends and working hours
    if (workingHours || highlightWeekends) {
      const workingDays = workingHours?.daysOfWeek || [1, 2, 3, 4, 5]; // Mon-Fri default
      const nonWorkingDays = [0, 1, 2, 3, 4, 5, 6].filter(
        (d) => !workingDays.includes(d)
      );

      let current = startOfDay(viewStart);
      while (current < viewEnd) {
        const dayOfWeek = new Date(current).getDay();

        // Non-working days (weekends by default)
        if (highlightWeekends && nonWorkingDays.includes(dayOfWeek)) {
          result.push({
            start: current,
            end: addDays(current, 1),
            type: 'holiday',
          });
        } else if (workingHours) {
          // Non-working hours on working days
          const startMinutes = parseTime(workingHours.start);
          const endMinutes = parseTime(workingHours.end);

          // Before work hours
          if (startMinutes > 0) {
            result.push({
              start: current,
              end: current + startMinutes * 60 * 1000,
              type: 'break',
            });
          }

          // After work hours
          if (endMinutes < 24 * 60) {
            result.push({
              start: current + endMinutes * 60 * 1000,
              end: addDays(current, 1),
              type: 'break',
            });
          }
        }

        current = addDays(current, 1);
      }
    }

    // Add explicit non-working periods
    periods.forEach((period) => {
      if (period.recurring) {
        expandRecurringPeriod(period, viewStart, viewEnd, result);
      } else if (period.start < viewEnd && period.end > viewStart) {
        result.push({
          start: Math.max(period.start, viewStart),
          end: Math.min(period.end, viewEnd),
          type: period.type,
          color: period.color,
        });
      }
    });

    return result;
  }, [periods, workingHours, viewStart, viewEnd, highlightWeekends]);

  if (expandedPeriods.length === 0) {
    return null;
  }

  return (
    <div
      className="gantt-non-working-time-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 'var(--gantt-z-grid)',
      }}
    >
      {expandedPeriods.map((period, i) => {
        const left = timestampToPixel(
          period.start,
          viewStart,
          zoomConfig.pixelsPerDay
        );
        const width =
          ((period.end - period.start) / MS_PER_DAY) * zoomConfig.pixelsPerDay;

        // Skip if outside view
        if (left + width < 0 || left > (viewEnd - viewStart) / MS_PER_DAY * zoomConfig.pixelsPerDay) {
          return null;
        }

        const backgroundColor =
          period.color ||
          `var(--gantt-nonworking-${period.type || 'default'})`;

        return (
          <div
            key={`nwt-${i}`}
            className={`gantt-non-working-period ${period.type || ''}`}
            style={{
              position: 'absolute',
              left: Math.max(0, left),
              width: width,
              top: 0,
              height: containerHeight,
              backgroundColor,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
});
