'use client';

import { memo, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { NormalizedTask, TooltipRendererProps } from '../../types';
import { formatDate } from '../../utils/date';
import styles from './Tooltip.module.css';

interface TooltipProps {
  task: NormalizedTask;
  x: number;
  y: number;
  locale?: string;
  customRenderer?: React.ComponentType<TooltipRendererProps>;
}

const OFFSET_X = 12;
const OFFSET_Y = 12;

export const Tooltip = memo(function Tooltip({
  task,
  x,
  y,
  locale = 'ja-JP',
  customRenderer: CustomRenderer,
}: TooltipProps) {
  const position = useMemo(() => {
    // Adjust position to keep tooltip in viewport
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    let left = x + OFFSET_X;
    let top = y + OFFSET_Y;

    // Rough estimates for tooltip size
    const tooltipWidth = 200;
    const tooltipHeight = 80;

    if (left + tooltipWidth > viewportWidth) {
      left = x - tooltipWidth - OFFSET_X;
    }

    if (top + tooltipHeight > viewportHeight) {
      top = y - tooltipHeight - OFFSET_Y;
    }

    return { left, top };
  }, [x, y]);

  const dateFormat: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const content = CustomRenderer ? (
    <CustomRenderer task={task} position={{ x, y }} />
  ) : (
    <>
      <div className={styles.title}>{task.title}</div>
      <div className={styles.dates}>
        {formatDate(task.start, dateFormat, locale)} - {formatDate(task.end, dateFormat, locale)}
      </div>
      {task.progress !== undefined && task.progress > 0 && (
        <div className={styles.progress}>進捗: {Math.round(task.progress * 100)}%</div>
      )}
    </>
  );

  // Only render in browser
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={styles.tooltip}
      style={{
        left: position.left,
        top: position.top,
      }}
      role="tooltip"
    >
      {content}
    </div>,
    document.body
  );
});
