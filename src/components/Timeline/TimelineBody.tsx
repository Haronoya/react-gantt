'use client';

import { memo, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useGanttContext } from '../../context';
import { TaskBar } from '../TaskBar';
import { useTaskPositions } from '../../hooks';
import {
  timestampToPixel,
  calculateTimelineWidth,
} from '../../utils/position';
import {
  startOfDay,
  startOfHour,
  addDays,
  addHours,
  isWeekend,
} from '../../utils/date';
import { MS_PER_DAY } from '../../constants';
import styles from './Timeline.module.css';

interface TimelineBodyProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll?: (e: React.UIEvent) => void;
}

export const TimelineBody = memo(function TimelineBody({
  scrollRef,
  onScroll,
}: TimelineBodyProps) {
  const {
    visibleTasks,
    zoomConfig,
    viewStart,
    viewEnd,
    rowHeight,
    isSelected,
    isDragging,
    getDragPreview,
    zoom,
  } = useGanttContext();

  // Calculate task positions
  const { positions } = useTaskPositions({
    tasks: visibleTasks,
    zoomConfig,
    viewStart,
    rowHeight,
  });

  // Virtual row rendering
  const virtualizer = useVirtualizer({
    count: visibleTasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Calculate timeline dimensions
  const timelineWidth = calculateTimelineWidth(viewStart, viewEnd, zoomConfig.pixelsPerDay);
  const totalHeight = virtualizer.getTotalSize();

  // Generate grid lines
  const gridLines = useMemo(() => {
    const lines: { left: number; strong: boolean }[] = [];

    if (zoom === 'hour') {
      // Hour zoom: lines for each hour, strong lines at day boundaries
      let current = startOfHour(viewStart);
      while (current <= viewEnd) {
        const left = timestampToPixel(current, viewStart, zoomConfig.pixelsPerDay);
        // Only add lines within visible bounds (left >= 0)
        if (left >= 0) {
          const date = new Date(current);
          const isDayStart = date.getHours() === 0;
          lines.push({ left, strong: isDayStart });
        }
        current = addHours(current, 1);
      }
    } else {
      // Day/Week/Month zoom
      let current = startOfDay(viewStart);
      while (current <= viewEnd) {
        const left = timestampToPixel(current, viewStart, zoomConfig.pixelsPerDay);
        // Only add lines within visible bounds (left >= 0)
        if (left >= 0) {
          const date = new Date(current);
          const isMonthStart = date.getDate() === 1;
          const isWeekStart = date.getDay() === 1; // Monday

          // Determine if this is a strong line
          const strong =
            zoom === 'day'
              ? isWeekStart
              : zoom === 'week'
                ? isMonthStart
                : isMonthStart && date.getMonth() % 3 === 0;

          if (zoom === 'day' || isWeekStart || isMonthStart) {
            lines.push({ left, strong });
          }
        }
        current = addDays(current, zoom === 'day' ? 1 : 7);
      }
    }

    return lines;
  }, [viewStart, viewEnd, zoomConfig.pixelsPerDay, zoom]);

  // Generate weekend columns (only for day zoom)
  const weekendColumns = useMemo(() => {
    if (zoom !== 'day') return [];

    const columns: { left: number; width: number }[] = [];
    let current = startOfDay(viewStart);

    while (current < viewEnd) {
      if (isWeekend(current)) {
        const left = timestampToPixel(current, viewStart, zoomConfig.pixelsPerDay);
        const width = zoomConfig.pixelsPerDay;
        columns.push({ left, width });
      }
      current = addDays(current, 1);
    }

    return columns;
  }, [viewStart, viewEnd, zoomConfig.pixelsPerDay, zoom]);

  // Today line position
  const todayLine = useMemo(() => {
    const now = Date.now();
    if (now >= viewStart && now <= viewEnd) {
      return timestampToPixel(now, viewStart, zoomConfig.pixelsPerDay);
    }
    return null;
  }, [viewStart, viewEnd, zoomConfig.pixelsPerDay]);

  return (
    <div
      ref={scrollRef}
      className={styles.body}
      onScroll={onScroll}
    >
      <div
        className={styles.canvas}
        style={{
          width: timelineWidth,
          height: totalHeight,
        }}
      >
        {/* Grid lines */}
        <div className={styles.gridLines}>
          {gridLines.map((line, i) => (
            <div
              key={i}
              className={`${styles.gridLine} ${line.strong ? styles.gridLineStrong : ''}`}
              style={{ left: line.left }}
            />
          ))}
        </div>

        {/* Weekend columns */}
        {weekendColumns.map((col, i) => (
          <div
            key={`weekend-${i}`}
            className={styles.weekendColumn}
            style={{ left: col.left, width: col.width }}
          />
        ))}

        {/* Today line */}
        {todayLine !== null && (
          <div className={styles.todayLine} style={{ left: todayLine }} />
        )}

        {/* Row backgrounds */}
        {virtualItems.map((virtualRow) => (
          <div
            key={`row-bg-${virtualRow.index}`}
            className={styles.rowBackground}
            style={{
              top: virtualRow.start,
              height: rowHeight,
              width: timelineWidth,
            }}
          />
        ))}

        {/* Task bars */}
        <div className={styles.tasksContainer}>
          {virtualItems.map((virtualRow) => {
            const task = visibleTasks[virtualRow.index];
            const position = positions.get(task.id);
            if (!position) return null;

            // Skip tasks that are completely outside the view range
            const taskStart = task.start;
            const taskEnd = task.end;
            if (taskEnd < viewStart || taskStart > viewEnd) {
              return null;
            }

            // Apply drag preview if dragging
            const preview = getDragPreview(task.id);
            let { left, width } = position;

            if (preview) {
              left = timestampToPixel(preview.start, viewStart, zoomConfig.pixelsPerDay);
              width =
                (preview.end - preview.start) / MS_PER_DAY * zoomConfig.pixelsPerDay;
            }

            // Clip task bar to view bounds
            const clippedLeft = Math.max(0, left);
            const rightEdge = left + width;
            const clippedRight = Math.min(timelineWidth, rightEdge);
            const clippedWidth = Math.max(0, clippedRight - clippedLeft);

            // Skip if completely clipped
            if (clippedWidth <= 0) return null;

            return (
              <TaskBar
                key={task.id}
                task={task}
                left={left}
                width={width}
                top={virtualRow.start + (rowHeight - position.height) / 2}
                height={position.height}
                isSelected={isSelected(task.id)}
                isDragging={isDragging && getDragPreview(task.id) !== null}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});
