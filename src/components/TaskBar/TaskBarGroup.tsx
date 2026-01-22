'use client';

import { memo, useCallback } from 'react';
import type { NormalizedTask } from '../../types';
import { useGanttContext } from '../../context';
import styles from './TaskBar.module.css';

interface TaskBarGroupProps {
  task: NormalizedTask;
  left: number;
  width: number;
  top: number;
  height: number;
  isSelected: boolean;
  isDragging: boolean;
  isRelated?: boolean;
}

export const TaskBarGroup = memo(function TaskBarGroup({
  task,
  left,
  width,
  top,
  height,
  isSelected,
  isDragging,
  isRelated = false,
}: TaskBarGroupProps) {
  const {
    handleTaskClick,
    handleTaskDoubleClick,
    handleTooltipEnter,
    handleTooltipLeave,
    handleTooltipMove,
    handleToggleCollapse,
  } = useGanttContext();

  const progress = task.progress ?? 0;
  const progressWidth = `${Math.round(progress * 100)}%`;

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
      // Toggle collapse on double click for groups
      handleToggleCollapse(task.id);
      handleTaskDoubleClick(task, e);
    },
    [task, handleToggleCollapse, handleTaskDoubleClick]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      handleTooltipEnter(task, e);
    },
    [task, handleTooltipEnter]
  );

  const customStyle = task.style?.color
    ? { backgroundColor: task.style.color }
    : undefined;

  // Groups have a smaller height
  const groupHeight = height * 0.5;
  const groupTop = top + (height - groupHeight) / 2;

  return (
    <div
      className={`${styles.taskBar} ${styles.group} ${isSelected ? styles.selected : ''} ${isRelated ? styles.related : ''} ${isDragging ? styles.dragging : ''} ${task.style?.barClass ?? ''}`}
      style={{
        left,
        width: Math.max(width, 4),
        top: groupTop,
        height: groupHeight,
        ...customStyle,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleTooltipLeave}
      onMouseMove={handleTooltipMove}
      role="button"
      aria-label={`グループ: ${task.title}`}
      aria-expanded={!task.collapsed}
      tabIndex={0}
      data-task-id={task.id}
    >
      {/* Progress fill */}
      {progress > 0 && (
        <div
          className={styles.groupProgress}
          style={{
            width: progressWidth,
            backgroundColor: task.style?.progressColor,
          }}
        />
      )}

      {/* Label */}
      <span className={styles.taskLabel}>{task.title}</span>
    </div>
  );
});
