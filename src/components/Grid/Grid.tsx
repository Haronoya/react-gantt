'use client';

import { memo, forwardRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useGanttContext } from '../../context';
import { GridHeader } from './GridHeader';
import { GridRow } from './GridRow';
import styles from './Grid.module.css';

interface GridProps {
  width: number;
  onScroll?: (e: React.UIEvent) => void;
}

export const Grid = memo(
  forwardRef<HTMLDivElement, GridProps>(function Grid({ width, onScroll }, ref) {
    const { visibleTasks, columns, rowHeight, handleColumnResize } = useGanttContext();

    const parentRef = ref as React.RefObject<HTMLDivElement>;

    const virtualizer = useVirtualizer({
      count: visibleTasks.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => rowHeight,
      overscan: 5,
    });

    const virtualItems = virtualizer.getVirtualItems();
    const totalHeight = virtualizer.getTotalSize();

    return (
      <div className={styles.grid} style={{ width }} role="grid">
        <GridHeader columns={columns} onColumnResize={handleColumnResize} />
        <div
          ref={parentRef}
          className={styles.body}
          onScroll={onScroll}
          role="rowgroup"
        >
          <div
            className={styles.virtualList}
            style={{ height: totalHeight }}
          >
            {virtualItems.map((virtualRow) => {
              const task = visibleTasks[virtualRow.index];
              return (
                <GridRow
                  key={task.id}
                  task={task}
                  columns={columns}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: rowHeight,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  })
);
