'use client';

import { memo, useMemo, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useGanttContext } from '../../context';
import { TaskBar } from '../TaskBar';
import { useTaskPositions } from '../../hooks';
import { GlobalMarkerLayer, TaskDeadlineMarker } from '../Markers';
import { DependencyLayer } from '../Dependencies';
import { NonWorkingTimeLayer } from '../NonWorkingTime';
import type { Marker } from '../../types/marker';
import type { Dependency } from '../../types/dependency';
import type { NonWorkingPeriod, WorkingHours } from '../../types/nonWorkingTime';
import {
  timestampToPixel,
  calculateTimelineWidth,
  calculateTaskPosition,
  calculateMilestonePosition,
  type TaskPosition,
} from '../../utils/position';
import {
  startOfDay,
  startOfHour,
  addDays,
  addHours,
  isWeekend,
} from '../../utils/date';
import { MS_PER_DAY, DEFAULT_BAR_HEIGHT_RATIO } from '../../constants';
import styles from './Timeline.module.css';

interface TimelineBodyProps {
  scrollRef: React.RefObject<HTMLDivElement>;
  onScroll?: (e: React.UIEvent) => void;
  markers?: Marker[];
  showTaskDeadlines?: boolean;
  deadlineColor?: string;
  onMarkerClick?: (marker: Marker, event: ReactMouseEvent) => void;
  dependencies?: Dependency[];
  showDependencies?: boolean;
  highlightDependencies?: boolean;
  selectedTaskIds?: string[];
  onDependencyClick?: (dependency: Dependency, event: ReactMouseEvent) => void;
  nonWorkingPeriods?: NonWorkingPeriod[];
  workingHours?: WorkingHours;
  showNonWorkingTime?: boolean;
  highlightWeekends?: boolean;
}

export const TimelineBody = memo(function TimelineBody({
  scrollRef,
  onScroll,
  markers,
  showTaskDeadlines = true,
  deadlineColor,
  onMarkerClick,
  dependencies,
  showDependencies = true,
  highlightDependencies = true,
  selectedTaskIds = [],
  onDependencyClick,
  nonWorkingPeriods,
  workingHours,
  showNonWorkingTime = true,
  highlightWeekends = true,
}: TimelineBodyProps) {
  const {
    visibleTasks,
    zoomConfig,
    viewStart,
    viewEnd,
    rowHeight,
    isSelected,
    isRelated,
    isDragging,
    getDragPreview,
    targetRowIndex,
    zoom,
    resourceMode,
    resourceRows,
    getTasksForResource,
  } = useGanttContext();

  // Calculate task positions for task mode
  const { positions: taskModePositions } = useTaskPositions({
    tasks: visibleTasks,
    zoomConfig,
    viewStart,
    rowHeight,
  });

  // Calculate cumulative row tops for variable height rows in resource mode
  const rowTops = useMemo(() => {
    if (!resourceMode) return new Map<number, number>();
    const tops = new Map<number, number>();
    let cumulativeTop = 0;
    resourceRows.forEach((row, index) => {
      tops.set(index, cumulativeTop);
      const stackLevels = row.stackLevels || 1;
      const currentRowHeight = row.isGroupHeader ? rowHeight : rowHeight * stackLevels;
      cumulativeTop += currentRowHeight;
    });
    return tops;
  }, [resourceMode, resourceRows, rowHeight]);

  // Calculate positions for resource mode (tasks positioned based on resource row index)
  // Also handles stacking of overlapping tasks within the same resource row
  // Task bar height remains constant, row height expands to accommodate stacking
  const resourceModePositions = useMemo(() => {
    if (!resourceMode) return new Map<string, TaskPosition>();

    const posMap = new Map<string, TaskPosition>();
    const barHeight = rowHeight * DEFAULT_BAR_HEIGHT_RATIO;

    resourceRows.forEach((resourceRow, rowIndex) => {
      if (resourceRow.isGroupHeader || !resourceRow.resource) return;

      const resourceTasks = getTasksForResource(resourceRow.resource.id);

      // Sort tasks by start time for stacking calculation
      const sortedTasks = [...resourceTasks].sort((a, b) => a.start - b.start);

      // Calculate stack level for each task (for overlapping tasks)
      const taskLevels = new Map<string, number>();
      const endTimes: number[] = []; // End time of each level

      sortedTasks.forEach((task) => {
        // Find the first available level (where task doesn't overlap)
        let level = 0;
        for (let i = 0; i < endTimes.length; i++) {
          if (endTimes[i] <= task.start) {
            level = i;
            endTimes[i] = task.end;
            break;
          }
          level = i + 1;
        }
        if (level >= endTimes.length) {
          endTimes.push(task.end);
        } else {
          endTimes[level] = task.end;
        }
        taskLevels.set(task.id, level);
      });

      // Get row top from cumulative tops
      const rowTop = rowTops.get(rowIndex) || 0;
      // Offset from top of row to center the bar vertically in its lane
      const laneOffset = (rowHeight - barHeight) / 2;

      resourceTasks.forEach((task) => {
        const isMilestone = task.type === 'milestone' || task.start === task.end;
        const level = taskLevels.get(task.id) || 0;

        if (isMilestone) {
          const basePos = calculateMilestonePosition(
            task.start,
            rowIndex,
            viewStart,
            zoomConfig,
            rowHeight,
            DEFAULT_BAR_HEIGHT_RATIO
          );
          // Position in the stacked lane, bar height remains constant
          posMap.set(task.id, {
            ...basePos,
            top: rowTop + laneOffset + level * rowHeight,
            height: barHeight,
          });
        } else {
          const basePos = calculateTaskPosition(
            task.start,
            task.end,
            rowIndex,
            viewStart,
            zoomConfig,
            rowHeight,
            DEFAULT_BAR_HEIGHT_RATIO
          );
          // Position in the stacked lane, bar height remains constant
          posMap.set(task.id, {
            ...basePos,
            top: rowTop + laneOffset + level * rowHeight,
            height: barHeight,
          });
        }
      });
    });

    return posMap;
  }, [resourceMode, resourceRows, getTasksForResource, viewStart, zoomConfig, rowHeight, rowTops]);

  // Use the appropriate positions based on mode
  const positions = resourceMode ? resourceModePositions : taskModePositions;

  // Determine row count based on mode
  const rowCount = resourceMode ? resourceRows.length : visibleTasks.length;

  // Calculate row height for each row (resource mode may have variable heights due to stacking)
  const getRowHeight = useCallback(
    (index: number) => {
      if (!resourceMode) return rowHeight;
      const row = resourceRows[index];
      if (!row || row.isGroupHeader) return rowHeight;
      const stackLevels = row.stackLevels || 1;
      return rowHeight * stackLevels;
    },
    [resourceMode, resourceRows, rowHeight]
  );

  // Generate a key based on stack levels for cache invalidation
  const getRowKey = useCallback(
    (index: number) => {
      if (!resourceMode) return `task-${index}`;
      const row = resourceRows[index];
      if (!row) return `row-${index}`;
      if (row.isGroupHeader) return `group-${row.groupName}`;
      return `resource-${row.resource?.id}-${row.stackLevels || 1}`;
    },
    [resourceMode, resourceRows]
  );

  // Virtual row rendering
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: getRowHeight,
    getItemKey: getRowKey,
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
        {/* Non-working time layer (background) */}
        {showNonWorkingTime && (
          <NonWorkingTimeLayer
            periods={nonWorkingPeriods}
            workingHours={workingHours}
            viewStart={viewStart}
            viewEnd={viewEnd}
            zoomConfig={zoomConfig}
            containerHeight={totalHeight}
            highlightWeekends={highlightWeekends}
            resourceMode={resourceMode}
            resourceRowInfos={resourceMode ? virtualItems.map((v) => ({
              id: resourceRows[v.index]?.resource?.id || '',
              top: v.start,
              height: rowHeight,
            })).filter(r => r.id !== '') : undefined}
          />
        )}

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
        {virtualItems.map((virtualRow) => {
          const isDropTarget = isDragging && targetRowIndex === virtualRow.index;
          // Check if this is a group header row in resource mode
          const isGroupHeader = resourceMode && resourceRows[virtualRow.index]?.isGroupHeader;
          return (
            <div
              key={`row-bg-${virtualRow.index}`}
              className={`${styles.rowBackground} ${isDropTarget ? styles.dropTarget : ''} ${isGroupHeader ? styles.groupHeaderBackground : ''}`}
              style={{
                top: virtualRow.start,
                height: virtualRow.size,
                width: timelineWidth,
              }}
            />
          );
        })}

        {/* Resource group bars (only in resource mode) */}
        {resourceMode && (
          <div className={styles.groupBarsContainer}>
            {virtualItems.map((virtualRow) => {
              const resourceRow = resourceRows[virtualRow.index];
              if (!resourceRow?.isGroupHeader) return null;

              // Skip if no period data
              if (resourceRow.groupStart === undefined || resourceRow.groupEnd === undefined) {
                return null;
              }

              // Skip if outside view range
              if (resourceRow.groupEnd < viewStart || resourceRow.groupStart > viewEnd) {
                return null;
              }

              const left = timestampToPixel(resourceRow.groupStart, viewStart, zoomConfig.pixelsPerDay);
              const width = (resourceRow.groupEnd - resourceRow.groupStart) / MS_PER_DAY * zoomConfig.pixelsPerDay;
              const barHeight = rowHeight * 0.4;
              const top = virtualRow.start + (rowHeight - barHeight) / 2;

              return (
                <div
                  key={`group-bar-${resourceRow.groupName}`}
                  className={styles.resourceGroupBar}
                  style={{
                    left: Math.max(0, left),
                    width: Math.min(width, timelineWidth - Math.max(0, left)),
                    top,
                    height: barHeight,
                  }}
                >
                  <span className={styles.resourceGroupBarLabel}>{resourceRow.groupName}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Task bars */}
        <div className={styles.tasksContainer}>
          {resourceMode ? (
            // Resource mode: render tasks for each resource row
            virtualItems.map((virtualRow) => {
              const resourceRow = resourceRows[virtualRow.index];
              if (!resourceRow || resourceRow.isGroupHeader || !resourceRow.resource) {
                return null;
              }

              const resourceTasks = getTasksForResource(resourceRow.resource.id);

              return resourceTasks.map((task) => {
                const position = positions.get(task.id);
                if (!position) return null;

                // Skip tasks outside view range
                if (task.end < viewStart || task.start > viewEnd) {
                  return null;
                }

                // Apply drag preview if dragging
                const preview = getDragPreview(task.id);
                let left = position.left;
                let width = position.width;

                if (preview) {
                  left = timestampToPixel(preview.start, viewStart, zoomConfig.pixelsPerDay);
                  width = (preview.end - preview.start) / MS_PER_DAY * zoomConfig.pixelsPerDay;
                }

                // Clip task bar to view bounds
                const clippedLeft = Math.max(0, left);
                const rightEdge = left + width;
                const clippedRight = Math.min(timelineWidth, rightEdge);
                const clippedWidth = Math.max(0, clippedRight - clippedLeft);

                if (clippedWidth <= 0) return null;

                return (
                  <TaskBar
                    key={task.id}
                    task={task}
                    left={left}
                    width={width}
                    top={position.top}
                    height={position.height}
                    isSelected={isSelected(task.id)}
                    isRelated={isRelated(task.id)}
                    isDragging={isDragging && getDragPreview(task.id) !== null}
                  />
                );
              });
            })
          ) : (
            // Task mode: one task per row
            virtualItems.map((virtualRow) => {
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
                  isRelated={isRelated(task.id)}
                  isDragging={isDragging && getDragPreview(task.id) !== null}
                />
              );
            })
          )}
        </div>

        {/* Task deadline markers */}
        {showTaskDeadlines && (
          <div className={styles.deadlineMarkerLayer}>
            {resourceMode ? (
              // Resource mode: render deadline markers for tasks in each resource row
              virtualItems.map((virtualRow) => {
                const resourceRow = resourceRows[virtualRow.index];
                if (!resourceRow || resourceRow.isGroupHeader || !resourceRow.resource) {
                  return null;
                }

                const resourceTasks = getTasksForResource(resourceRow.resource.id);
                return resourceTasks.map((task) => {
                  if (!task.deadline) return null;
                  return (
                    <TaskDeadlineMarker
                      key={`deadline-${task.id}`}
                      task={task}
                      viewStart={viewStart}
                      viewEnd={viewEnd}
                      zoomConfig={zoomConfig}
                      rowTop={virtualRow.start}
                      rowHeight={rowHeight}
                      deadlineColor={deadlineColor}
                      onMarkerClick={onMarkerClick}
                    />
                  );
                });
              })
            ) : (
              // Task mode: one deadline marker per row
              virtualItems.map((virtualRow) => {
                const task = visibleTasks[virtualRow.index];
                if (!task?.deadline) return null;

                return (
                  <TaskDeadlineMarker
                    key={`deadline-${task.id}`}
                    task={task}
                    viewStart={viewStart}
                    viewEnd={viewEnd}
                    zoomConfig={zoomConfig}
                    rowTop={virtualRow.start}
                    rowHeight={rowHeight}
                    deadlineColor={deadlineColor}
                    onMarkerClick={onMarkerClick}
                  />
                );
              })
            )}
          </div>
        )}

        {/* Global markers */}
        {markers && markers.length > 0 && (
          <GlobalMarkerLayer
            markers={markers}
            viewStart={viewStart}
            viewEnd={viewEnd}
            zoomConfig={zoomConfig}
            containerHeight={totalHeight}
            headerHeight={0}
            onMarkerClick={onMarkerClick}
          />
        )}

        {/* Dependency lines */}
        {showDependencies && dependencies && dependencies.length > 0 && (
          <DependencyLayer
            dependencies={dependencies}
            positions={positions}
            selectedTaskIds={selectedTaskIds}
            highlightDependencies={highlightDependencies}
            onDependencyClick={onDependencyClick}
          />
        )}
      </div>
    </div>
  );
});
