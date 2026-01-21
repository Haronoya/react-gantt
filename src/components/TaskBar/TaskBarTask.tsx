'use client';

import { memo, useCallback } from 'react';
import type { NormalizedTask } from '../../types';
import { useGanttContext } from '../../context';
import styles from './TaskBar.module.css';

interface TaskBarTaskProps {
  task: NormalizedTask;
  left: number;
  width: number;
  top: number;
  height: number;
  isSelected: boolean;
  isDragging: boolean;
}

export const TaskBarTask = memo(function TaskBarTask({
  task,
  left,
  width,
  top,
  height,
  isSelected,
  isDragging,
}: TaskBarTaskProps) {
  const {
    editable,
    handleDragStart,
    handleTaskClick,
    handleTaskDoubleClick,
    handleTooltipEnter,
    handleTooltipLeave,
    handleTooltipMove,
    getDragPreview,
  } = useGanttContext();

  const preview = getDragPreview(task.id);
  const progress = preview?.progress ?? task.progress ?? 0;
  const progressWidth = `${Math.round(progress * 100)}%`;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: 'move' | 'resize-start' | 'resize-end' | 'progress') => {
      if (!editable || e.button !== 0) return;
      e.stopPropagation();
      handleDragStart(task.id, type, e.clientX, e.clientY);
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

  const customStyle = task.style?.color
    ? { backgroundColor: task.style.color }
    : undefined;

  return (
    <div
      className={`${styles.taskBar} ${styles.task} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''} ${task.style?.barClass ?? ''}`}
      style={{
        left,
        width: Math.max(width, 4),
        top,
        height,
        ...customStyle,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleTooltipLeave}
      onMouseMove={handleTooltipMove}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      role="button"
      aria-label={`${task.title}: ${new Date(task.start).toLocaleDateString()} - ${new Date(task.end).toLocaleDateString()}`}
      tabIndex={0}
      data-task-id={task.id}
    >
      {/* Progress fill */}
      {progress > 0 && (
        <div
          className={styles.taskProgress}
          style={{
            width: progressWidth,
            backgroundColor: task.style?.progressColor,
          }}
        />
      )}

      {/* Label */}
      <span className={styles.taskLabel}>{task.title}</span>

      {/* Resize handles */}
      {editable && (
        <>
          <div
            className={`${styles.resizeHandle} ${styles.resizeHandleLeft}`}
            onMouseDown={(e) => handleMouseDown(e, 'resize-start')}
          />
          <div
            className={`${styles.resizeHandle} ${styles.resizeHandleRight}`}
            onMouseDown={(e) => handleMouseDown(e, 'resize-end')}
          />
          {/* Progress handle */}
          <div
            className={styles.progressHandle}
            style={{ left: progressWidth }}
            onMouseDown={(e) => handleMouseDown(e, 'progress')}
          />
        </>
      )}
    </div>
  );
});
