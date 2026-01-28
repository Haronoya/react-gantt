'use client';

import { memo, useMemo, useCallback } from 'react';
import { useGanttContext } from '../../context';
import type { ZoomLevel } from '../../types';
import {
  startOfHour,
  startOfDay,
  startOfWeek,
  startOfMonth,
  addDays,
  formatDate,
  formatTime,
  isWeekend,
  MS_PER_HOUR,
} from '../../utils/date';
import { timestampToPixel } from '../../utils/position';
import { MS_PER_DAY } from '../../constants';
import styles from './Timeline.module.css';

interface TimelineHeaderProps {
  scrollLeft: number;
  viewportWidth: number;
}

interface HeaderCell {
  key: string;
  left: number;
  width: number;
  label: string;
  isWeekend?: boolean;
  /** Start timestamp of this cell */
  start: number;
  /** End timestamp of this cell */
  end: number;
}

export const TimelineHeader = memo(function TimelineHeader({
  scrollLeft,
  viewportWidth,
}: TimelineHeaderProps) {
  const { zoomConfig, viewStart, viewEnd, zoom, locale, handleViewChange } = useGanttContext();

  const { primaryCells, secondaryCells } = useMemo(() => {
    const primary: HeaderCell[] = [];
    const secondary: HeaderCell[] = [];

    const { pixelsPerDay } = zoomConfig;
    const buffer = zoom === 'hour' ? pixelsPerDay : pixelsPerDay * 7; // Buffer for smooth scrolling

    // Calculate visible range with buffer
    const visibleStartPx = Math.max(0, scrollLeft - buffer);
    const visibleEndPx = scrollLeft + viewportWidth + buffer;

    // Generate primary cells based on zoom level
    let currentPrimary: number;

    if (zoom === 'hour') {
      // For hour zoom, primary is days
      currentPrimary = startOfDay(viewStart);
    } else if (zoom === 'month') {
      // For month zoom, use years
      const date = new Date(viewStart);
      date.setMonth(0, 1);
      date.setHours(0, 0, 0, 0);
      currentPrimary = date.getTime();
    } else {
      // For day/week zoom, use months
      currentPrimary = startOfMonth(viewStart);
    }

    while (currentPrimary < viewEnd) {
      const left = timestampToPixel(currentPrimary, viewStart, pixelsPerDay);

      let nextPrimary: number;
      let label: string;

      if (zoom === 'hour') {
        // Day units for hour zoom
        nextPrimary = currentPrimary + MS_PER_DAY;
        label = formatDate(currentPrimary, { month: 'short', day: 'numeric', weekday: 'short' }, locale);
      } else if (zoom === 'month') {
        // Year units
        const date = new Date(currentPrimary);
        nextPrimary = new Date(date.getFullYear() + 1, 0, 1).getTime();
        label = formatDate(currentPrimary, { year: 'numeric' }, locale);
      } else {
        // Month units
        const date = new Date(currentPrimary);
        nextPrimary = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
        label = formatDate(currentPrimary, { year: 'numeric', month: 'short' }, locale);
      }

      const width = timestampToPixel(nextPrimary, viewStart, pixelsPerDay) - left;

      // Only add if visible
      if (left + width >= visibleStartPx && left <= visibleEndPx) {
        primary.push({
          key: `primary-${currentPrimary}`,
          left,
          width,
          label,
          start: currentPrimary,
          end: nextPrimary,
        });
      }

      currentPrimary = nextPrimary;
    }

    // Generate secondary cells based on zoom level
    let currentSecondary: number;

    if (zoom === 'hour') {
      currentSecondary = startOfHour(viewStart);
    } else if (zoom === 'day') {
      currentSecondary = startOfDay(viewStart);
    } else if (zoom === 'week') {
      currentSecondary = startOfWeek(viewStart);
    } else {
      currentSecondary = startOfMonth(viewStart);
    }

    while (currentSecondary < viewEnd) {
      const left = timestampToPixel(currentSecondary, viewStart, pixelsPerDay);

      let nextSecondary: number;
      let label: string;
      let weekend = false;

      if (zoom === 'hour') {
        // Hour units
        nextSecondary = currentSecondary + MS_PER_HOUR;
        label = formatTime(currentSecondary, locale);
      } else if (zoom === 'day') {
        nextSecondary = currentSecondary + MS_PER_DAY;
        label = formatDate(currentSecondary, { day: 'numeric' }, locale);
        weekend = isWeekend(currentSecondary);
      } else if (zoom === 'week') {
        nextSecondary = addDays(currentSecondary, 7);
        const weekNum = Math.ceil(
          (new Date(currentSecondary).getDate() +
            new Date(new Date(currentSecondary).getFullYear(), new Date(currentSecondary).getMonth(), 1).getDay()) /
            7
        );
        label = `W${weekNum}`;
      } else {
        const date = new Date(currentSecondary);
        nextSecondary = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();
        label = formatDate(currentSecondary, { month: 'short' }, locale);
      }

      const width = timestampToPixel(nextSecondary, viewStart, pixelsPerDay) - left;

      // Only add if visible
      if (left + width >= visibleStartPx && left <= visibleEndPx) {
        secondary.push({
          key: `secondary-${currentSecondary}`,
          left,
          width,
          label,
          isWeekend: weekend,
          start: currentSecondary,
          end: nextSecondary,
        });
      }

      currentSecondary = nextSecondary;
    }

    return { primaryCells: primary, secondaryCells: secondary };
  }, [zoomConfig, viewStart, viewEnd, zoom, scrollLeft, viewportWidth, locale]);

  // Handle secondary cell click - zoom in to the clicked period
  const handleSecondaryCellClick = useCallback(
    (cell: HeaderCell) => {
      if (!handleViewChange) return;

      // Determine new zoom level based on current zoom
      let newZoom: ZoomLevel;
      if (zoom === 'day') {
        // Day -> Hour (show 1 day)
        newZoom = 'hour';
      } else if (zoom === 'week') {
        // Week -> Day (show 1 week)
        newZoom = 'day';
      } else if (zoom === 'month') {
        // Month -> Day (show 1 month)
        newZoom = 'day';
      } else {
        // Hour level - no further zoom
        return;
      }

      handleViewChange({
        zoom: newZoom,
        start: cell.start,
        end: cell.end,
      });
    },
    [zoom, handleViewChange]
  );

  return (
    <div className={styles.header}>
      {/* Primary row (days/months/years) */}
      <div className={styles.headerRow}>
        <div
          style={{
            position: 'relative',
            transform: `translateX(-${scrollLeft}px)`,
          }}
        >
          {primaryCells.map((cell) => (
            <div
              key={cell.key}
              className={`${styles.headerCell} ${styles.headerCellPrimary}`}
              style={{
                position: 'absolute',
                left: cell.left,
                width: cell.width,
              }}
            >
              {cell.label}
            </div>
          ))}
        </div>
      </div>

      {/* Secondary row (hours/days/weeks/months) */}
      <div className={styles.headerRow}>
        <div
          style={{
            position: 'relative',
            transform: `translateX(-${scrollLeft}px)`,
          }}
        >
          {secondaryCells.map((cell) => (
            <div
              key={cell.key}
              className={`${styles.headerCell} ${styles.headerCellSecondary} ${cell.isWeekend ? styles.headerCellWeekend : ''} ${zoom !== 'hour' && handleViewChange ? styles.headerCellClickable : ''}`}
              style={{
                position: 'absolute',
                left: cell.left,
                width: cell.width,
              }}
              onClick={zoom !== 'hour' && handleViewChange ? () => handleSecondaryCellClick(cell) : undefined}
            >
              {cell.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
