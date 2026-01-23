'use client';

import { memo, useCallback } from 'react';
import type { NormalizedTask, ColumnDef } from '../../types';
import { useGanttContext } from '../../context';
import { GridCell } from './GridCell';
import styles from './Grid.module.css';

interface GridRowProps {
  task: NormalizedTask;
  columns: ColumnDef[];
  isDropTarget?: boolean;
  style?: React.CSSProperties;
}

export const GridRow = memo(function GridRow({ task, columns, isDropTarget = false, style }: GridRowProps) {
  const {
    isSelected,
    handleRowClick,
    handleToggleCollapse,
    handleSelectionChange,
    selection,
    expandIconPosition,
  } = useGanttContext();

  const selected = isSelected(task.id);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Update selection
      handleSelectionChange({
        ids: e.ctrlKey || e.metaKey
          ? selected
            ? selection.ids.filter((id) => id !== task.id)
            : [...selection.ids, task.id]
          : [task.id],
        anchor: task.id,
      });

      handleRowClick(task, e);
    },
    [task, selected, selection, handleSelectionChange, handleRowClick]
  );

  const handleCollapse = useCallback(() => {
    handleToggleCollapse(task.id);
  }, [task.id, handleToggleCollapse]);

  // Build row style from task.rowStyle
  const rowStyle: React.CSSProperties = { ...style };
  if (task.rowStyle?.backgroundColor) {
    rowStyle.backgroundColor = task.rowStyle.backgroundColor;
  }
  if (task.rowStyle?.color) {
    rowStyle.color = task.rowStyle.color;
  }
  if (task.rowStyle?.fontWeight) {
    rowStyle.fontWeight = task.rowStyle.fontWeight;
  }

  const rowClassName = `${styles.row} ${selected ? styles.selected : ''} ${isDropTarget ? styles.dropTarget : ''} ${task.rowStyle?.className ?? ''}`.trim();

  return (
    <div
      className={rowClassName}
      style={rowStyle}
      onClick={handleClick}
      role="row"
      aria-selected={selected}
      data-task-id={task.id}
    >
      {columns.map((column) => (
        <GridCell
          key={column.id}
          column={column}
          task={task}
          onToggleCollapse={column.id === 'title' ? handleCollapse : undefined}
          expandIconPosition={expandIconPosition}
        />
      ))}
    </div>
  );
});
