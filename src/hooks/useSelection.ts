'use client';

import { useCallback, useMemo } from 'react';
import type { SelectionState, NormalizedTask } from '../types';

interface UseSelectionOptions {
  tasks: NormalizedTask[];
  selection: SelectionState;
  onSelectionChange?: (selection: SelectionState) => void;
}

interface UseSelectionResult {
  selectedIds: Set<string>;
  isSelected: (taskId: string) => boolean;
  handleSelect: (taskId: string, event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => void;
  selectAll: () => void;
  clearSelection: () => void;
  selectRange: (fromId: string, toId: string) => void;
}

/**
 * Hook to manage task selection state
 */
export function useSelection({
  tasks,
  selection,
  onSelectionChange,
}: UseSelectionOptions): UseSelectionResult {
  const selectedIds = useMemo(() => new Set(selection.ids), [selection.ids]);

  const isSelected = useCallback(
    (taskId: string) => selectedIds.has(taskId),
    [selectedIds]
  );

  const handleSelect = useCallback(
    (
      taskId: string,
      event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }
    ) => {
      if (!onSelectionChange) return;

      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      if (isShift && selection.anchor) {
        // Range selection
        const visibleTasks = tasks.filter((t) => t.visible);
        const anchorIndex = visibleTasks.findIndex((t) => t.id === selection.anchor);
        const currentIndex = visibleTasks.findIndex((t) => t.id === taskId);

        if (anchorIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(anchorIndex, currentIndex);
          const end = Math.max(anchorIndex, currentIndex);
          const rangeIds = visibleTasks.slice(start, end + 1).map((t) => t.id);

          onSelectionChange({
            ids: rangeIds,
            anchor: selection.anchor,
          });
        }
      } else if (isCtrl) {
        // Toggle selection
        const newIds = isSelected(taskId)
          ? selection.ids.filter((id) => id !== taskId)
          : [...selection.ids, taskId];

        onSelectionChange({
          ids: newIds,
          anchor: taskId,
        });
      } else {
        // Single selection
        onSelectionChange({
          ids: [taskId],
          anchor: taskId,
        });
      }
    },
    [tasks, selection, isSelected, onSelectionChange]
  );

  const selectAll = useCallback(() => {
    if (!onSelectionChange) return;

    const visibleIds = tasks.filter((t) => t.visible).map((t) => t.id);
    onSelectionChange({
      ids: visibleIds,
      anchor: visibleIds[0],
    });
  }, [tasks, onSelectionChange]);

  const clearSelection = useCallback(() => {
    onSelectionChange?.({ ids: [] });
  }, [onSelectionChange]);

  const selectRange = useCallback(
    (fromId: string, toId: string) => {
      if (!onSelectionChange) return;

      const visibleTasks = tasks.filter((t) => t.visible);
      const fromIndex = visibleTasks.findIndex((t) => t.id === fromId);
      const toIndex = visibleTasks.findIndex((t) => t.id === toId);

      if (fromIndex !== -1 && toIndex !== -1) {
        const start = Math.min(fromIndex, toIndex);
        const end = Math.max(fromIndex, toIndex);
        const rangeIds = visibleTasks.slice(start, end + 1).map((t) => t.id);

        onSelectionChange({
          ids: rangeIds,
          anchor: fromId,
        });
      }
    },
    [tasks, onSelectionChange]
  );

  return {
    selectedIds,
    isSelected,
    handleSelect,
    selectAll,
    clearSelection,
    selectRange,
  };
}
