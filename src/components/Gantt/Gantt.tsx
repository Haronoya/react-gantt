'use client';

import {
  memo,
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import type { GanttProps, NormalizedTask } from '../../types';
import { GanttProvider, type GanttContextValue } from '../../context';
import { useGanttState, useSyncScroll, useDrag, useTooltip, type DragType } from '../../hooks';
import {
  DEFAULT_GRID_WIDTH,
  DEFAULT_MIN_GRID_WIDTH,
  DEFAULT_MAX_GRID_WIDTH,
  DEFAULT_ROW_HEIGHT,
  MS_PER_DAY,
} from '../../constants';
import { Grid } from '../Grid';
import { Timeline } from '../Timeline';
import { Splitter } from '../Splitter';
import { Tooltip } from '../Tooltip';

import '../../styles/index.css';
import styles from './Gantt.module.css';

export const Gantt = memo(function Gantt({
  tasks,
  columns,
  view,
  selection: controlledSelection,
  editable = true,
  rowHeight = DEFAULT_ROW_HEIGHT,
  gridWidth: initialGridWidth = DEFAULT_GRID_WIDTH,
  minGridWidth = DEFAULT_MIN_GRID_WIDTH,
  maxGridWidth = DEFAULT_MAX_GRID_WIDTH,
  showGrid = true,
  fitToContainer = false,
  syncParentDates = false,
  className,
  style,
  locale = 'ja-JP',
  onTaskChange,
  onSelectionChange,
  onTaskClick,
  onTaskDoubleClick,
  onRowClick,
  onScroll,
  onViewChange,
  onColumnResize,
  renderers,
  markers,
  showTaskDeadlines = true,
  deadlineColor,
  onMarkerClick,
  highlightRelatedTasks = false,
  dependencies,
  showDependencies = true,
  highlightDependencies = true,
  onDependencyClick,
  nonWorkingPeriods,
  workingHours,
  showNonWorkingTime = true,
  highlightWeekends = true,
}: GanttProps) {
  // Grid width state
  const [gridWidth, setGridWidth] = useState(initialGridWidth);

  // Container ref for fitToContainer calculation
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Observe container width for fitToContainer
  useEffect(() => {
    if (!fitToContainer || !containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fitToContainer]);

  // Main state management
  const ganttState = useGanttState({
    tasks,
    columns,
    zoom: view?.zoom,
    viewStart: view?.start,
    viewEnd: view?.end,
    selection: controlledSelection,
    rowHeight,
    syncParentDates,
    onTaskChange,
    onSelectionChange,
    onZoomChange: (zoom) => onViewChange?.({ ...view, zoom }),
  });

  // Calculate pixelsPerDay for fitToContainer mode
  const adjustedZoomConfig = useMemo(() => {
    if (!fitToContainer || containerWidth === null) {
      return ganttState.zoomConfig;
    }

    const timelineAvailableWidth = containerWidth - (showGrid ? gridWidth : 0) - 8; // 8px for splitter
    const viewDuration = ganttState.viewEnd - ganttState.viewStart;
    const viewDays = viewDuration / MS_PER_DAY;

    if (viewDays <= 0) return ganttState.zoomConfig;

    // Calculate pixelsPerDay to fit the view exactly
    const calculatedPixelsPerDay = Math.max(1, timelineAvailableWidth / viewDays);

    return {
      ...ganttState.zoomConfig,
      pixelsPerDay: calculatedPixelsPerDay,
    };
  }, [fitToContainer, containerWidth, showGrid, gridWidth, ganttState.zoomConfig, ganttState.viewStart, ganttState.viewEnd]);

  // Synchronized scroll
  const { gridRef, timelineRef, handleGridScroll, handleTimelineScroll } =
    useSyncScroll((scrollTop, scrollLeft) => {
      onScroll?.({ scrollTop, scrollLeft });
    });

  // Drag handling
  const {
    getDragPreview,
    handleDragStart,
    isDragging,
  } = useDrag({
    tasks: ganttState.visibleTasks,
    zoomConfig: adjustedZoomConfig,
    onTaskChange: ganttState.handleTaskChange,
    editable,
  });

  // Tooltip
  const {
    tooltipState,
    handleMouseEnter: handleTooltipEnter,
    handleMouseLeave: handleTooltipLeave,
    handleMouseMove: handleTooltipMove,
  } = useTooltip();

  // Related tasks highlighting
  const relatedIds = useMemo(() => {
    if (!highlightRelatedTasks || ganttState.selection.ids.length === 0) {
      return new Set<string>();
    }

    const related = new Set<string>();

    ganttState.selection.ids.forEach((selectedId) => {
      const selectedTask = ganttState.visibleTasks.find((t) => t.id === selectedId);
      if (!selectedTask) return;

      // Add tasks with same groupId
      if (selectedTask.groupId) {
        ganttState.visibleTasks.forEach((t) => {
          if (t.groupId === selectedTask.groupId && t.id !== selectedId) {
            related.add(t.id);
          }
        });
      }

      // Add explicitly related tasks
      if (selectedTask.relatedTaskIds) {
        selectedTask.relatedTaskIds.forEach((relatedId) => {
          if (relatedId !== selectedId) {
            related.add(relatedId);
          }
        });
      }

      // Check if other tasks reference this task
      ganttState.visibleTasks.forEach((t) => {
        if (t.relatedTaskIds?.includes(selectedId) && t.id !== selectedId) {
          related.add(t.id);
        }
      });
    });

    // Remove selected tasks from related
    ganttState.selection.ids.forEach((id) => related.delete(id));

    return related;
  }, [ganttState.visibleTasks, ganttState.selection.ids, highlightRelatedTasks]);

  const isRelated = useCallback(
    (taskId: string) => relatedIds.has(taskId),
    [relatedIds]
  );

  // Event handlers
  const handleTaskClick = useCallback(
    (task: NormalizedTask, event: ReactMouseEvent) => {
      // Update selection
      ganttState.handleSelectionChange({
        ids: event.ctrlKey || event.metaKey
          ? ganttState.isSelected(task.id)
            ? ganttState.selection.ids.filter((id) => id !== task.id)
            : [...ganttState.selection.ids, task.id]
          : [task.id],
        anchor: task.id,
      });

      onTaskClick?.(task, event);
    },
    [ganttState, onTaskClick]
  );

  const handleTaskDoubleClick = useCallback(
    (task: NormalizedTask, event: ReactMouseEvent) => {
      onTaskDoubleClick?.(task, event);
    },
    [onTaskDoubleClick]
  );

  const handleRowClick = useCallback(
    (task: NormalizedTask, event: ReactMouseEvent) => {
      onRowClick?.(task, event);
    },
    [onRowClick]
  );

  const handleDragStartWrapper = useCallback(
    (taskId: string, type: DragType, clientX: number, clientY: number) => {
      handleDragStart(taskId, type, clientX, clientY);
    },
    [handleDragStart]
  );

  // Context value
  const contextValue = useMemo<GanttContextValue>(
    () => ({
      // Data
      visibleTasks: ganttState.visibleTasks,
      columns: ganttState.columns,

      // View
      zoom: ganttState.zoom,
      zoomConfig: adjustedZoomConfig,
      viewStart: ganttState.viewStart,
      viewEnd: ganttState.viewEnd,
      rowHeight: ganttState.rowHeight,
      locale,

      // State
      selection: ganttState.selection,
      editable,

      // Selection
      isSelected: ganttState.isSelected,
      isRelated,

      // Drag
      isDragging,
      getDragPreview,

      // Actions
      handleTaskChange: ganttState.handleTaskChange,
      handleSelectionChange: ganttState.handleSelectionChange,
      handleToggleCollapse: ganttState.handleToggleCollapse,
      handleDragStart: handleDragStartWrapper,
      handleTaskClick,
      handleTaskDoubleClick,
      handleRowClick,

      // Tooltip
      handleTooltipEnter,
      handleTooltipLeave,
      handleTooltipMove,

      // Column resize
      handleColumnResize: onColumnResize,

      // Renderers
      renderers,
    }),
    [
      ganttState,
      adjustedZoomConfig,
      locale,
      editable,
      isRelated,
      isDragging,
      getDragPreview,
      handleDragStartWrapper,
      handleTaskClick,
      handleTaskDoubleClick,
      handleRowClick,
      handleTooltipEnter,
      handleTooltipLeave,
      handleTooltipMove,
      onColumnResize,
      renderers,
    ]
  );

  return (
    <GanttProvider value={contextValue}>
      <div
        ref={containerRef}
        className={`gantt-root ${styles.gantt} ${isDragging ? styles.dragging : ''} ${className ?? ''}`}
        style={style}
        role="application"
        aria-label="ガントチャート"
      >
        {/* Grid (left panel) */}
        {showGrid && (
          <div className={styles.gridContainer} style={{ width: gridWidth }}>
            <Grid
              ref={gridRef}
              width={gridWidth}
              onScroll={handleGridScroll}
            />
          </div>
        )}

        {/* Splitter */}
        {showGrid && (
          <Splitter
            position={gridWidth}
            minPosition={minGridWidth}
            maxPosition={maxGridWidth}
            onPositionChange={setGridWidth}
          />
        )}

        {/* Timeline (right panel) */}
        <div className={styles.timelineContainer}>
          <Timeline
            ref={timelineRef}
            onScroll={handleTimelineScroll}
            markers={markers}
            showTaskDeadlines={showTaskDeadlines}
            deadlineColor={deadlineColor}
            onMarkerClick={onMarkerClick}
            dependencies={dependencies}
            showDependencies={showDependencies}
            highlightDependencies={highlightDependencies}
            selectedTaskIds={ganttState.selection.ids}
            onDependencyClick={onDependencyClick}
            nonWorkingPeriods={nonWorkingPeriods}
            workingHours={workingHours}
            showNonWorkingTime={showNonWorkingTime}
            highlightWeekends={highlightWeekends}
          />
        </div>

        {/* Tooltip */}
        {tooltipState && (
          <Tooltip
            task={tooltipState.task}
            x={tooltipState.x}
            y={tooltipState.y}
            locale={locale}
            customRenderer={renderers?.tooltip}
          />
        )}
      </div>
    </GanttProvider>
  );
});
