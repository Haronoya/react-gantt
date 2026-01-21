'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import type { ColumnDef } from '../../types';
import styles from './Grid.module.css';

interface GridHeaderProps {
  columns: ColumnDef[];
  onColumnResize?: (columnId: string, width: number) => void;
}

export const GridHeader = memo(function GridHeader({ columns, onColumnResize }: GridHeaderProps) {
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const columnRef = useRef<ColumnDef | null>(null);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, column: ColumnDef) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingColumn(column.id);
      startXRef.current = e.clientX;
      startWidthRef.current = column.width;
      columnRef.current = column;
    },
    []
  );

  useEffect(() => {
    if (!resizingColumn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const column = columnRef.current;
      if (!column) return;

      const minWidth = column.minWidth ?? 50;
      const maxWidth = column.maxWidth ?? 500;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + delta));

      onColumnResize?.(column.id, newWidth);
    };

    const handleMouseUp = () => {
      setResizingColumn(null);
      columnRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumn, onColumnResize]);

  return (
    <div className={styles.header} role="row">
      {columns.map((column) => {
        const alignClass =
          column.align === 'center'
            ? styles.alignCenter
            : column.align === 'right'
              ? styles.alignRight
              : styles.alignLeft;

        return (
          <div
            key={column.id}
            className={`${styles.headerCell} ${alignClass}`}
            style={{ width: column.width }}
            role="columnheader"
          >
            <span className={styles.headerCellText}>{column.title}</span>
            {column.resizable !== false && (
              <div
                className={`${styles.columnResizer} ${resizingColumn === column.id ? styles.columnResizerActive : ''}`}
                onMouseDown={(e) => handleResizeStart(e, column)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
