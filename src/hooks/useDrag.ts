'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { NormalizedTask, TaskPatch, ChangeContext, ZoomConfig } from '../types';
import { DRAG_THRESHOLD, MS_PER_DAY } from '../constants';
import { snapToUnit } from '../utils/date';

export type DragType = 'move' | 'resize-start' | 'resize-end' | 'progress';

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
  isDragging: boolean;
}

interface UseDragOptions {
  tasks: NormalizedTask[];
  zoomConfig: ZoomConfig;
  onTaskChange?: (patch: TaskPatch, context: ChangeContext) => void;
  editable: boolean;
}

interface DragPreview {
  start: number;
  end: number;
  progress?: number;
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
}

/**
 * Hook to manage task drag operations (move, resize, progress)
 */
export function useDrag({
  tasks,
  zoomConfig,
  onTaskChange,
  editable,
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
        isDragging: false,
      });
    },
    [tasks, editable]
  );

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    setDragState((prev) => {
      if (!prev) return null;

      const deltaX = Math.abs(clientX - prev.startX);
      const deltaY = Math.abs(clientY - prev.startY);
      const isDragging = prev.isDragging || deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD;

      return {
        ...prev,
        currentX: clientX,
        currentY: clientY,
        isDragging,
      };
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    const state = dragRef.current;

    if (!state || !state.isDragging || !onTaskChange) {
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
        newStart = snap(state.initialStart + deltaMs);
        newEnd = snap(state.initialEnd + deltaMs);
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
          const taskWidth = (task.end - task.start) / msPerPixel;
          const progressDelta = deltaX / taskWidth;
          newProgress = Math.max(0, Math.min(1, state.initialProgress + progressDelta));
        }
        break;
      }
    }

    // Only fire change if something actually changed
    const hasChange =
      newStart !== state.initialStart ||
      newEnd !== state.initialEnd ||
      newProgress !== state.initialProgress;

    if (hasChange) {
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

      const contextType: ChangeContext['type'] =
        state.type === 'move'
          ? 'drag-move'
          : state.type === 'resize-start'
            ? 'drag-resize-start'
            : state.type === 'resize-end'
              ? 'drag-resize-end'
              : 'progress';

      onTaskChange(
        {
          id: state.taskId,
          changes,
          previousValues,
        },
        { type: contextType }
      );
    }

    setDragState(null);
  }, [tasks, onTaskChange, msPerPixel, snap, snapMs]);

  const getDragPreview = useCallback(
    (taskId: string): DragPreview | null => {
      if (!dragState || dragState.taskId !== taskId || !dragState.isDragging) {
        return null;
      }

      const deltaX = dragState.currentX - dragState.startX;
      const deltaMs = deltaX * msPerPixel;

      switch (dragState.type) {
        case 'move':
          return {
            start: snap(dragState.initialStart + deltaMs),
            end: snap(dragState.initialEnd + deltaMs),
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
            const taskWidth = (task.end - task.start) / msPerPixel;
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
  };
}
