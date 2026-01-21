'use client';

import { memo } from 'react';
import type { NormalizedTask } from '../../types';
import { TaskBarTask } from './TaskBarTask';
import { TaskBarMilestone } from './TaskBarMilestone';
import { TaskBarGroup } from './TaskBarGroup';

interface TaskBarProps {
  task: NormalizedTask;
  left: number;
  width: number;
  top: number;
  height: number;
  isSelected: boolean;
  isDragging: boolean;
}

export const TaskBar = memo(function TaskBar(props: TaskBarProps) {
  const { task } = props;

  // Determine task type
  const isMilestone = task.type === 'milestone' || task.start === task.end;
  const isGroup = task.type === 'group';

  if (isMilestone) {
    return <TaskBarMilestone {...props} />;
  }

  if (isGroup) {
    return <TaskBarGroup {...props} />;
  }

  return <TaskBarTask {...props} />;
});
