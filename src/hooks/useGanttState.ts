'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import type {
  Task,
  NormalizedTask,
  ZoomLevel,
  ZoomConfig,
  SelectionState,
  TaskPatch,
  ChangeContext,
  ColumnDef,
} from '../types';
import { normalizeTasks, flattenVisibleTasks } from '../utils/tree';
import { getDateRange } from '../utils/date';
import { ZOOM_CONFIGS, DEFAULT_ZOOM, DEFAULT_COLUMNS, DEFAULT_ROW_HEIGHT } from '../constants';

interface UseGanttStateOptions {
  tasks: Task[];
  columns?: ColumnDef[];
  zoom?: ZoomLevel;
  viewStart?: number;
  viewEnd?: number;
  selection?: SelectionState;
  rowHeight?: number;
  /** Sync parent task dates with children (parent spans all children) */
  syncParentDates?: boolean;
  onTaskChange?: (patch: TaskPatch, context: ChangeContext) => void;
  onSelectionChange?: (selection: SelectionState) => void;
  onZoomChange?: (zoom: ZoomLevel) => void;
}

interface UseGanttStateResult {
  // Normalized data
  normalizedTasks: NormalizedTask[];
  visibleTasks: NormalizedTask[];

  // View state
  zoom: ZoomLevel;
  zoomConfig: ZoomConfig;
  viewStart: number;
  viewEnd: number;
  rowHeight: number;
  columns: ColumnDef[];

  // Selection
  selection: SelectionState;
  isSelected: (taskId: string) => boolean;

  // Actions
  setZoom: (zoom: ZoomLevel) => void;
  setViewRange: (start: number, end: number) => void;
  handleTaskChange: (patch: TaskPatch, context: ChangeContext) => void;
  handleSelectionChange: (selection: SelectionState) => void;
  handleToggleCollapse: (taskId: string) => void;
}

/**
 * Main hook that orchestrates all Gantt state
 */
export function useGanttState(options: UseGanttStateOptions): UseGanttStateResult {
  const {
    tasks,
    columns = DEFAULT_COLUMNS,
    zoom: controlledZoom,
    viewStart: controlledViewStart,
    viewEnd: controlledViewEnd,
    selection: controlledSelection,
    rowHeight = DEFAULT_ROW_HEIGHT,
    syncParentDates = false,
    onTaskChange,
    onSelectionChange,
    onZoomChange,
  } = options;

  // Internal state (for uncontrolled mode)
  const [internalZoom, setInternalZoom] = useState<ZoomLevel>(DEFAULT_ZOOM);
  const [internalSelection, setInternalSelection] = useState<SelectionState>({ ids: [] });
  const [viewRange, setViewRangeState] = useState<{ start: number; end: number } | null>(null);

  // Determine if controlled or uncontrolled
  const zoom = controlledZoom ?? internalZoom;
  const selection = controlledSelection ?? internalSelection;

  // Get zoom config
  const zoomConfig = useMemo(() => ZOOM_CONFIGS[zoom], [zoom]);

  // Normalize tasks
  const normalizedTasks = useMemo(
    () => normalizeTasks(tasks, { syncParentDates }),
    [tasks, syncParentDates]
  );

  // Get visible tasks (not hidden by collapsed parents)
  const visibleTasks = useMemo(
    () => flattenVisibleTasks(normalizedTasks),
    [normalizedTasks]
  );

  // Calculate view range from tasks if not set
  const calculatedViewRange = useMemo(() => {
    // Use controlled view range if provided
    if (controlledViewStart !== undefined && controlledViewEnd !== undefined) {
      return { start: controlledViewStart, end: controlledViewEnd };
    }
    if (controlledViewStart !== undefined) {
      const timestamps = normalizedTasks.flatMap((t) => [t.start, t.end]);
      const range = getDateRange(timestamps, 14);
      return { start: controlledViewStart, end: range.end };
    }
    if (controlledViewEnd !== undefined) {
      const timestamps = normalizedTasks.flatMap((t) => [t.start, t.end]);
      const range = getDateRange(timestamps, 14);
      return { start: range.start, end: controlledViewEnd };
    }

    if (viewRange) return viewRange;

    const timestamps = normalizedTasks.flatMap((t) => [t.start, t.end]);
    return getDateRange(timestamps, 14); // 2 weeks padding
  }, [normalizedTasks, viewRange, controlledViewStart, controlledViewEnd]);

  const { start: viewStart, end: viewEnd } = calculatedViewRange;

  // Selection helpers
  const selectedSet = useMemo(() => new Set(selection.ids), [selection.ids]);
  const isSelected = useCallback((taskId: string) => selectedSet.has(taskId), [selectedSet]);

  // Actions
  const setZoom = useCallback(
    (newZoom: ZoomLevel) => {
      if (controlledZoom === undefined) {
        setInternalZoom(newZoom);
      }
      onZoomChange?.(newZoom);
    },
    [controlledZoom, onZoomChange]
  );

  const setViewRange = useCallback((start: number, end: number) => {
    setViewRangeState({ start, end });
  }, []);

  const handleTaskChange = useCallback(
    (patch: TaskPatch, context: ChangeContext) => {
      onTaskChange?.(patch, context);
    },
    [onTaskChange]
  );

  const handleSelectionChange = useCallback(
    (newSelection: SelectionState) => {
      if (controlledSelection === undefined) {
        setInternalSelection(newSelection);
      }
      onSelectionChange?.(newSelection);
    },
    [controlledSelection, onSelectionChange]
  );

  const handleToggleCollapse = useCallback(
    (taskId: string) => {
      const task = normalizedTasks.find((t) => t.id === taskId);
      if (!task || !task.hasChildren) return;

      handleTaskChange(
        {
          id: taskId,
          changes: { collapsed: !task.collapsed },
          previousValues: { collapsed: task.collapsed },
        },
        { type: 'collapse' }
      );
    },
    [normalizedTasks, handleTaskChange]
  );

  // Auto-adjust view range when tasks change significantly
  useEffect(() => {
    if (tasks.length > 0 && viewRange === null) {
      const timestamps = normalizedTasks.flatMap((t) => [t.start, t.end]);
      const range = getDateRange(timestamps, 14);
      setViewRangeState(range);
    }
  }, [tasks.length, normalizedTasks, viewRange]);

  return {
    // Data
    normalizedTasks,
    visibleTasks,

    // View
    zoom,
    zoomConfig,
    viewStart,
    viewEnd,
    rowHeight,
    columns,

    // Selection
    selection,
    isSelected,

    // Actions
    setZoom,
    setViewRange,
    handleTaskChange,
    handleSelectionChange,
    handleToggleCollapse,
  };
}
