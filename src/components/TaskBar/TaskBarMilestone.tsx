'use client';

import { memo, useCallback } from 'react';
import type { NormalizedTask } from '../../types';
import { useGanttContext } from '../../context';
import styles from './TaskBar.module.css';

interface TaskBarMilestoneProps {
  task: NormalizedTask;
  left: number;
  width: number;
  top: number;
  height: number;
  isSelected: boolean;
  isDragging: boolean;
  isRelated?: boolean;
}

export const TaskBarMilestone = memo(function TaskBarMilestone({
  task,
  left,
  width,
  top,
  height,
  isSelected,
  isDragging,
  isRelated = false,
}: TaskBarMilestoneProps) {
  const {
    editable,
    handleDragStart,
    handleTaskClick,
    handleTaskDoubleClick,
    handleTooltipEnter,
    handleTooltipLeave,
    handleTooltipMove,
  } = useGanttContext();

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!editable || e.button !== 0) return;
      e.stopPropagation();
      handleDragStart(task.id, 'move', e.clientX, e.clientY);
    },
    [task.id, editable, handleDragStart]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleTaskClick(task, e);
    },
    [task, handleTaskClick]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleTaskDoubleClick(task, e);
    },
    [task, handleTaskDoubleClick]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      handleTooltipEnter(task, e);
    },
    [task, handleTooltipEnter]
  );

  const diamondStyle = task.style?.color
    ? { backgroundColor: task.style.color, borderColor: task.style.color }
    : undefined;

  return (
    <div
      className={`${styles.taskBar} ${styles.milestone} ${isSelected ? styles.selected : ''} ${isRelated ? styles.related : ''} ${isDragging ? styles.dragging : ''} ${task.style?.barClass ?? ''}`}
      style={{
        left,
        width,
        top,
        height,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleTooltipLeave}
      onMouseMove={handleTooltipMove}
      onMouseDown={handleMouseDown}
      role="button"
      aria-label={`マイルストーン: ${task.title} (${new Date(task.start).toLocaleDateString()})`}
      tabIndex={0}
      data-task-id={task.id}
    >
      <div className={styles.milestoneDiamond} style={diamondStyle} />
    </div>
  );
});
