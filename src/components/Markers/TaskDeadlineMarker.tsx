import { type MouseEvent as ReactMouseEvent, useMemo } from 'react';
import type { NormalizedTask } from '../../types/task';
import type { Marker } from '../../types/marker';
import type { ZoomConfig } from '../../types/view';
import { MarkerLine } from './MarkerLine';

interface TaskDeadlineMarkerProps {
  task: NormalizedTask;
  viewStart: number;
  viewEnd: number;
  zoomConfig: ZoomConfig;
  rowTop: number;
  rowHeight: number;
  deadlineColor?: string;
  onMarkerClick?: (marker: Marker, event: ReactMouseEvent) => void;
}

export function TaskDeadlineMarker({
  task,
  viewStart,
  viewEnd,
  zoomConfig,
  rowTop,
  rowHeight,
  deadlineColor,
  onMarkerClick,
}: TaskDeadlineMarkerProps) {
  const marker = useMemo((): Marker | null => {
    if (task.deadline === undefined) {
      return null;
    }

    const isOverdue = task.end > task.deadline;
    const color = deadlineColor ?? (isOverdue ? 'var(--gantt-deadline-overdue)' : 'var(--gantt-deadline-color)');

    return {
      id: `deadline-${task.id}`,
      timestamp: task.deadline,
      label: isOverdue ? 'Overdue' : 'Deadline',
      color,
      style: 'dashed',
      width: 2,
      showLabel: false,
      labelPosition: 'top',
    };
  }, [task.id, task.deadline, task.end, deadlineColor]);

  if (!marker) {
    return null;
  }

  return (
    <MarkerLine
      marker={marker}
      viewStart={viewStart}
      viewEnd={viewEnd}
      zoomConfig={zoomConfig}
      top={rowTop}
      height={rowHeight}
      onClick={onMarkerClick}
    />
  );
}
