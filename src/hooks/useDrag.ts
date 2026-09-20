'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { NormalizedTask, TaskPatch, ChangeContext, ZoomConfig } from '../types';
import { DRAG_AXIS_LOCK_THRESHOLD, DRAG_THRESHOLD, MS_PER_DAY } from '../constants';
import { snapToUnit } from '../utils/date';

export type DragType = 'move' | 'resize-start' | 'resize-end' | 'progress';

/**
 * Which axis a drag is committed to. A `move` drag starts undecided (`null`) and locks
 * to the axis the pointer travels along first: `'x'` changes the dates only, `'y'`
 * changes the row only. Every other drag type is always `'x'`.
 */
export type DragAxis = 'x' | 'y' | null;

interface DragState {
  taskId: string;
  type: DragType;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  initialStart: number;
  initialEnd: number;
  initialProgress: number;
  initialRowIndex: number;
  initialParentId: string | null | undefined;
  initialResourceId: string | undefined;
  isDragging: boolean;
  targetRowIndex: number;
  axis: DragAxis;
}

interface UseDragOptions {
  tasks: NormalizedTask[];
  zoomConfig: ZoomConfig;
  onTaskChange?: (patch: TaskPatch, context: ChangeContext) => void;
  editable: boolean;
  rowHeight: number;
  /** Enable vertical drag to move between rows */
  enableRowDrag?: boolean;
  /** Callback to get the target parent/resource ID for a row index */
  getRowTarget?: (rowIndex: number) => { parentId?: string | null; resourceId?: string | null };
}

interface DragPreview {
  start: number;
  end: number;
  progress?: number;
  rowIndex?: number;
}

interface UseDragResult {
  dragState: DragState | null;
  getDragPreview: (taskId: string) => DragPreview | null;
  handleDragStart: (
    taskId: string,
    type: DragType,
    clientX: number,
    clientY: number
  ) => void;
  isDragging: boolean;
  /** Current target row index during drag */
  targetRowIndex: number | null;
}

/**
 * After a real drag the browser still dispatches a `click` on the element under the
 * pointer. Swallow that one click (capture phase, before React sees it) so a drop is
 * not also treated as a task/row click. The guard is dropped on the next macrotask in
 * case no click follows (e.g. mouseup outside the window).
 */
function suppressNextClick(): void {
  if (typeof window === 'undefined') return;
  const swallow = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };
  window.addEventListener('click', swallow, true);
  setTimeout(() => window.removeEventListener('click', swallow, true), 0);
}

/**
 * Hook to manage task drag operations (move, resize, progress, row change)
 */
export function useDrag({
  tasks,
  zoomConfig,
  onTaskChange,
  editable,
  rowHeight,
  enableRowDrag = true,
  getRowTarget,
}: UseDragOptions): UseDragResult {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  // Keep ref in sync with state for event handlers
  useEffect(() => {
    dragRef.current = dragState;
  }, [dragState]);

  const msPerPixel = MS_PER_DAY / zoomConfig.pixelsPerDay;
  const snapMs = zoomConfig.snapMs;

  const snap = useCallback(
    (ms: number): number => snapToUnit(ms, snapMs),
    [snapMs]
  );

  const handleDragStart = useCallback(
    (taskId: string, type: DragType, clientX: number, clientY: number) => {
      if (!editable) return;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Find the task's current row index
      const rowIndex = tasks.findIndex((t) => t.id === taskId);

      setDragState({
        taskId,
        type,
        startX: clientX,
        startY: clientY,
        currentX: clientX,
        currentY: clientY,
        initialStart: task.start,
        initialEnd: task.end,
        initialProgress: task.progress ?? 0,
        initialRowIndex: rowIndex,
        initialParentId: task.parentId,
        initialResourceId: task.resourceId,
        isDragging: false,
        targetRowIndex: rowIndex,
        // Only a plain move can turn into a row change; everything else is time-only
        axis: type === 'move' && enableRowDrag ? null : 'x',
      });
    },
    [tasks, editable, enableRowDrag]
  );

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    setDragState((prev) => {
      if (!prev) return null;

      const deltaX = Math.abs(clientX - prev.startX);
      const deltaY = Math.abs(clientY - prev.startY);
      const isDragging = prev.isDragging || deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD;

      // Lock the axis once the pointer has clearly travelled in one direction. After that a
      // horizontal drag never changes rows (pointer drift into the next row is ignored) and a
      // vertical drag never changes dates.
      let axis = prev.axis;
      if (axis === null && Math.max(deltaX, deltaY) >= DRAG_AXIS_LOCK_THRESHOLD) {
        axis = deltaY > deltaX ? 'y' : 'x';
      }

      // Calculate target row based on vertical movement (only for row-locked moves)
      let targetRowIndex = prev.targetRowIndex;
      if (axis === 'y' && tasks.length > 0) {
        const verticalDelta = clientY - prev.startY;
        const rowDelta = Math.round(verticalDelta / rowHeight);
        targetRowIndex = prev.initialRowIndex + rowDelta;
        // Clamp to valid row range (ensure non-negative even with empty array)
        targetRowIndex = Math.max(0, Math.min(Math.max(0, tasks.length - 1), targetRowIndex));
      }

      return {
        ...prev,
        currentX: clientX,
        currentY: clientY,
        isDragging,
        targetRowIndex,
        axis,
      };
    });
  }, [rowHeight, tasks.length]);

  const handleDragEnd = useCallback(() => {
    const state = dragRef.current;

    if (state?.isDragging) {
      suppressNextClick();
    }

    // A drag that never settled on an axis (tiny wobble) changes nothing
    if (!state || !state.isDragging || !onTaskChange || state.axis === null) {
      setDragState(null);
      return;
    }

    const deltaX = state.currentX - state.startX;
    const deltaMs = deltaX * msPerPixel;

    let newStart = state.initialStart;
    let newEnd = state.initialEnd;
    let newProgress = state.initialProgress;

    switch (state.type) {
      case 'move':
        // Row-locked moves keep their dates
        if (state.axis === 'x') {
          newStart = snap(state.initialStart + deltaMs);
          newEnd = snap(state.initialEnd + deltaMs);
        }
        break;

      case 'resize-start':
        newStart = snap(state.initialStart + deltaMs);
        // Ensure minimum duration of 1 snap unit
        newStart = Math.min(newStart, state.initialEnd - snapMs);
        break;

      case 'resize-end':
        newEnd = snap(state.initialEnd + deltaMs);
        // Ensure minimum duration of 1 snap unit
        newEnd = Math.max(newEnd, state.initialStart + snapMs);
        break;

      case 'progress': {
        const task = tasks.find((t) => t.id === state.taskId);
        if (task) {
          const taskDuration = task.end - task.start;
          // Avoid division by zero for zero-duration tasks
          if (taskDuration > 0) {
            const taskWidth = taskDuration / msPerPixel;
            const progressDelta = deltaX / taskWidth;
            newProgress = Math.max(0, Math.min(1, state.initialProgress + progressDelta));
          }
        }
        break;
      }
    }

    // Check for row change (only for row-locked moves)
    const hasRowChange = state.axis === 'y' && state.targetRowIndex !== state.initialRowIndex;

    // Get target parent/resource for the new row
    let targetParentId: string | null | undefined = state.initialParentId;
    let targetResourceId: string | undefined = state.initialResourceId;

    if (hasRowChange && getRowTarget) {
      const target = getRowTarget(state.targetRowIndex);
      if (target.parentId !== undefined) {
        targetParentId = target.parentId;
      }
      if (target.resourceId !== undefined) {
        targetResourceId = target.resourceId ?? undefined;
      }
    }

    // Only fire change if something actually changed
    const hasTimeChange =
      newStart !== state.initialStart ||
      newEnd !== state.initialEnd ||
      newProgress !== state.initialProgress;

    const hasParentChange = targetParentId !== state.initialParentId;
    const hasResourceChange = targetResourceId !== state.initialResourceId;

    if (hasTimeChange || hasParentChange || hasResourceChange || hasRowChange) {
      const changes: TaskPatch['changes'] = {};
      const previousValues: TaskPatch['previousValues'] = {};

      if (newStart !== state.initialStart) {
        changes.start = newStart;
        previousValues.start = state.initialStart;
      }

      if (newEnd !== state.initialEnd) {
        changes.end = newEnd;
        previousValues.end = state.initialEnd;
      }

      if (newProgress !== state.initialProgress) {
        changes.progress = newProgress;
        previousValues.progress = state.initialProgress;
      }

      if (hasParentChange) {
        changes.parentId = targetParentId;
        previousValues.parentId = state.initialParentId;
      }

      if (hasResourceChange) {
        changes.resourceId = targetResourceId;
        previousValues.resourceId = state.initialResourceId;
      }

      const contextType: ChangeContext['type'] =
        hasRowChange
          ? 'drag-row-change'
          : state.type === 'move'
            ? 'drag-move'
            : state.type === 'resize-start'
              ? 'drag-resize-start'
              : state.type === 'resize-end'
                ? 'drag-resize-end'
                : 'progress';

      const context: ChangeContext = { type: contextType };

      if (hasRowChange) {
        context.targetRowIndex = state.targetRowIndex;
        context.targetParentId = targetParentId;
        context.targetResourceId = targetResourceId;
      }

      onTaskChange(
        {
          id: state.taskId,
          changes,
          previousValues,
        },
        context
      );
    }

    setDragState(null);
  }, [tasks, onTaskChange, msPerPixel, snap, snapMs, getRowTarget]);

  const getDragPreview = useCallback(
    (taskId: string): DragPreview | null => {
      if (!dragState || dragState.taskId !== taskId || !dragState.isDragging) {
        return null;
      }

      const deltaX = dragState.currentX - dragState.startX;
      const deltaMs = deltaX * msPerPixel;

      switch (dragState.type) {
        case 'move':
          if (dragState.axis === 'x') {
            return {
              start: snap(dragState.initialStart + deltaMs),
              end: snap(dragState.initialEnd + deltaMs),
            };
          }
          // Row-locked (or undecided): the bar keeps its dates and only follows the row
          return {
            start: dragState.initialStart,
            end: dragState.initialEnd,
            rowIndex: dragState.axis === 'y' ? dragState.targetRowIndex : undefined,
          };

        case 'resize-start':
          return {
            start: Math.min(
              snap(dragState.initialStart + deltaMs),
              dragState.initialEnd - snapMs
            ),
            end: dragState.initialEnd,
          };

        case 'resize-end':
          return {
            start: dragState.initialStart,
            end: Math.max(
              snap(dragState.initialEnd + deltaMs),
              dragState.initialStart + snapMs
            ),
          };

        case 'progress': {
          const task = tasks.find((t) => t.id === taskId);
          if (task) {
            const taskDuration = task.end - task.start;
            // Avoid division by zero for zero-duration tasks
            if (taskDuration > 0) {
              const taskWidth = taskDuration / msPerPixel;
              const progressDelta = deltaX / taskWidth;
              const newProgress = Math.max(
                0,
                Math.min(1, dragState.initialProgress + progressDelta)
              );
              return {
                start: dragState.initialStart,
                end: dragState.initialEnd,
                progress: newProgress,
              };
            }
          }
          return null;
        }

        default:
          return null;
      }
    },
    [dragState, tasks, msPerPixel, snap, snapMs]
  );

  // Attach global listeners when dragging
  useEffect(() => {
    if (!dragState) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDragState(null);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dragState, handleDragMove, handleDragEnd]);

  return {
    dragState,
    getDragPreview,
    handleDragStart,
    isDragging: dragState?.isDragging ?? false,
    // Only a row-locked drag has a drop target to highlight
    targetRowIndex:
      dragState?.isDragging && dragState.axis === 'y' ? dragState.targetRowIndex : null,
  };
}
