'use client';

import { memo, forwardRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useGanttContext } from '../../context';
import { GridHeader } from './GridHeader';
import { GridRow } from './GridRow';
import { ResourceRow } from './ResourceRow';
import { ResourceGroupRow } from './ResourceGroupRow';
import styles from './Grid.module.css';

interface GridProps {
  width: number;
  onScroll?: (e: React.UIEvent) => void;
}

export const Grid = memo(
  forwardRef<HTMLDivElement, GridProps>(function Grid({ width, onScroll }, ref) {
    const {
      visibleTasks,
      columns,
      rowHeight,
      handleColumnResize,
      isDragging,
      targetRowIndex,
      resourceMode,
      resourceRows,
      toggleResourceGroup,
    } = useGanttContext();

    const parentRef = ref as React.RefObject<HTMLDivElement>;

    // Determine row count based on mode
    const rowCount = resourceMode ? resourceRows.length : visibleTasks.length;

    // Variable row height for stacked tasks in resource mode
    const getRowHeight = useCallback(
      (index: number) => {
        if (!resourceMode) return rowHeight;
        const row = resourceRows[index];
        if (!row || row.isGroupHeader) return rowHeight;
        const stackLevels = row.stackLevels || 1;
        return rowHeight * stackLevels;
      },
      [resourceMode, resourceRows, rowHeight]
    );

    const virtualizer = useVirtualizer({
      count: rowCount,
      getScrollElement: () => parentRef.current,
      estimateSize: getRowHeight,
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
            {resourceMode ? (
              // Resource mode: render resource rows with variable height
              virtualItems.map((virtualRow) => {
                const resourceRow = resourceRows[virtualRow.index];
                const isDropTarget = isDragging && targetRowIndex === virtualRow.index;
                const rowStyle = {
                  position: 'absolute' as const,
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                };

                if (resourceRow.isGroupHeader) {
                  return (
                    <ResourceGroupRow
                      key={`group-${resourceRow.groupName}`}
                      groupName={resourceRow.groupName || ''}
                      onToggle={() => toggleResourceGroup(resourceRow.groupName || '')}
                      style={rowStyle}
                    />
                  );
                }

                if (resourceRow.resource) {
                  return (
                    <ResourceRow
                      key={resourceRow.resource.id}
                      resource={resourceRow.resource}
                      isDropTarget={isDropTarget}
                      style={rowStyle}
                    />
                  );
                }

                return null;
              })
            ) : (
              // Task mode: render task rows
              virtualItems.map((virtualRow) => {
                const task = visibleTasks[virtualRow.index];
                const isDropTarget = isDragging && targetRowIndex === virtualRow.index;
                return (
                  <GridRow
                    key={task.id}
                    task={task}
                    columns={columns}
                    isDropTarget={isDropTarget}
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
              })
            )}
          </div>
        </div>
      </div>
    );
  })
);
