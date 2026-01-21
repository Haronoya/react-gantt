'use client';

import { memo, type ReactNode } from 'react';
import type { ColumnDef, NormalizedTask } from '../../types';
import styles from './Grid.module.css';

interface GridCellProps {
  column: ColumnDef;
  task: NormalizedTask;
  onToggleCollapse?: () => void;
}

const ExpandIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg
    className={`${styles.expandIcon} ${collapsed ? styles.collapsed : ''}`}
    viewBox="0 0 10 10"
    fill="currentColor"
  >
    <path d="M2 3L5 6L8 3" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

export const GridCell = memo(function GridCell({
  column,
  task,
  onToggleCollapse,
}: GridCellProps) {
  const alignClass =
    column.align === 'center'
      ? styles.alignCenter
      : column.align === 'right'
        ? styles.alignRight
        : styles.alignLeft;

  // Get cell value
  let value: ReactNode;
  if (typeof column.accessor === 'function') {
    value = column.accessor(task);
  } else {
    value = task[column.accessor as keyof NormalizedTask] as ReactNode;
  }

  // Apply custom renderer if provided
  if (column.render) {
    value = column.render(value, task);
  }

  // Special handling for title column with expand button
  const isTitleColumn = column.id === 'title' || column.accessor === 'title';

  if (isTitleColumn) {
    const indentWidth = task.depth * 20;

    return (
      <div
        className={`${styles.cell} ${alignClass}`}
        style={{ width: column.width }}
      >
        <div className={styles.titleContent}>
          <span className={styles.indent} style={{ width: indentWidth }} />
          {task.hasChildren && (
            <button
              className={styles.expandButton}
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse?.();
              }}
              aria-label={task.collapsed ? '展開' : '折りたたむ'}
              aria-expanded={!task.collapsed}
            >
              <ExpandIcon collapsed={task.collapsed ?? false} />
            </button>
          )}
          {!task.hasChildren && <span style={{ width: 20 }} />}
          <span className={styles.titleText}>{value}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.cell} ${alignClass}`}
      style={{ width: column.width }}
    >
      {value}
    </div>
  );
});
