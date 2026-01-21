'use client';

import { useMemo } from 'react';
import type { NormalizedTask, ZoomConfig } from '../types';
import {
  calculateTaskPosition,
  calculateMilestonePosition,
  type TaskPosition,
} from '../utils/position';
import { DEFAULT_BAR_HEIGHT_RATIO } from '../constants';

interface UseTaskPositionsOptions {
  tasks: NormalizedTask[];
  zoomConfig: ZoomConfig;
  viewStart: number;
  rowHeight: number;
  barHeightRatio?: number;
}

interface UseTaskPositionsResult {
  positions: Map<string, TaskPosition>;
  getPosition: (taskId: string) => TaskPosition | undefined;
}

/**
 * Hook to calculate and cache task bar positions
 */
export function useTaskPositions({
  tasks,
  zoomConfig,
  viewStart,
  rowHeight,
  barHeightRatio = DEFAULT_BAR_HEIGHT_RATIO,
}: UseTaskPositionsOptions): UseTaskPositionsResult {
  const positions = useMemo(() => {
    const posMap = new Map<string, TaskPosition>();

    // Only process visible tasks
    const visibleTasks = tasks.filter((t) => t.visible);

    visibleTasks.forEach((task) => {
      const isMilestone = task.type === 'milestone' || task.start === task.end;

      const position = isMilestone
        ? calculateMilestonePosition(
            task.start,
            task.visibleIndex,
            viewStart,
            zoomConfig,
            rowHeight,
            barHeightRatio
          )
        : calculateTaskPosition(
            task.start,
            task.end,
            task.visibleIndex,
            viewStart,
            zoomConfig,
            rowHeight,
            barHeightRatio
          );

      posMap.set(task.id, position);
    });

    return posMap;
  }, [tasks, zoomConfig, viewStart, rowHeight, barHeightRatio]);

  const getPosition = useMemo(
    () => (taskId: string) => positions.get(taskId),
    [positions]
  );

  return {
    positions,
    getPosition,
  };
}
