'use client';

import { memo, useCallback, useMemo } from 'react';
import type { NormalizedTask } from '../../types';
import { useGanttContext } from '../../context';
import styles from './TaskBar.module.css';

// Generate pattern background based on segment pattern type
function getPatternStyle(pattern: string | undefined, color: string): React.CSSProperties {
  switch (pattern) {
    case 'striped':
      return {
        backgroundColor: color,
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 3px,
          rgba(255,255,255,0.2) 3px,
          rgba(255,255,255,0.2) 6px
        )`,
      };
    case 'dotted':
      return {
        backgroundColor: color,
        backgroundImage: `radial-gradient(
          circle at 2px 2px,
          rgba(255,255,255,0.25) 1px,
          transparent 1px
        )`,
        backgroundSize: '6px 6px',
      };
    default:
      return { backgroundColor: color };
  }
}

interface TaskBarTaskProps {
  task: NormalizedTask;
  left: number;
  width: number;
  top: number;
  height: number;
  isSelected: boolean;
  isDragging: boolean;
  isRelated?: boolean;
}

export const TaskBarTask = memo(function TaskBarTask({
  task,
  left,
  width,
  top,
  height,
  isSelected,
  isDragging,
  isRelated = false,
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

  // Calculate segment positions if segments exist
  const segmentData = useMemo(() => {
    if (!task.segments || task.segments.length === 0) {
      return null;
    }

    const totalDuration = task.end - task.start;
    if (totalDuration <= 0) return null;

    let currentOffset = 0;
    return task.segments.map((segment) => {
      const segmentWidth = (segment.duration / totalDuration) * width;
      const segmentLeft = currentOffset;
      currentOffset += segmentWidth;

      return {
        ...segment,
        left: segmentLeft,
        width: segmentWidth,
      };
    });
  }, [task.segments, task.start, task.end, width]);

  // Render segmented task bar
  if (segmentData) {
    return (
      <div
        className={`${styles.taskBar} ${styles.task} ${styles.segmented} ${isSelected ? styles.selected : ''} ${isRelated ? styles.related : ''} ${isDragging ? styles.dragging : ''} ${task.style?.barClass ?? ''}`}
        style={{
          left,
          width: Math.max(width, 4),
          top,
          height,
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
        {/* Segment fills */}
        {segmentData.map((segment, index) => {
          const segmentColor = segment.color ?? task.style?.color ?? 'var(--gantt-task-bg)';
          const patternStyle = getPatternStyle(segment.pattern, segmentColor);

          return (
            <div
              key={segment.id}
              className={`${styles.segment} ${index === 0 ? styles.segmentFirst : ''} ${index === segmentData.length - 1 ? styles.segmentLast : ''}`}
              style={{
                position: 'absolute',
                left: segment.left,
                width: Math.max(segment.width, 1),
                top: 0,
                bottom: 0,
                ...patternStyle,
              }}
              title={segment.label}
            />
          );
        })}

        {/* Progress overlay */}
        {progress > 0 && (
          <div
            className={styles.taskProgressOverlay}
            style={{
              width: progressWidth,
              backgroundColor: task.style?.progressColor ?? 'rgba(0, 0, 0, 0.2)',
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
            <div
              className={styles.progressHandle}
              style={{ left: progressWidth }}
              onMouseDown={(e) => handleMouseDown(e, 'progress')}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${styles.taskBar} ${styles.task} ${isSelected ? styles.selected : ''} ${isRelated ? styles.related : ''} ${isDragging ? styles.dragging : ''} ${task.style?.barClass ?? ''}`}
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
