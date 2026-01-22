'use client';

import { memo, type MouseEvent } from 'react';
import type { Resource } from '../../types/resource';
import styles from './Grid.module.css';

interface ResourceRowProps {
  /** The resource to display */
  resource: Resource;
  /** Row height in pixels */
  rowHeight: number;
  /** Top offset in pixels */
  top: number;
  /** Width of the grid */
  width: number;
  /** Depth in hierarchy (for indentation) */
  depth: number;
  /** Whether the row is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: (resource: Resource, event: MouseEvent) => void;
  /** Double-click handler */
  onDoubleClick?: (resource: Resource, event: MouseEvent) => void;
}

export const ResourceRow = memo(function ResourceRow({
  resource,
  rowHeight,
  top,
  width,
  depth,
  isSelected = false,
  onClick,
  onDoubleClick,
}: ResourceRowProps) {
  const indentWidth = 20;

  return (
    <div
      className={`${styles.row} ${isSelected ? styles.rowSelected : ''}`}
      style={{
        position: 'absolute',
        top,
        left: 0,
        width,
        height: rowHeight,
        paddingLeft: depth * indentWidth,
        backgroundColor: resource.color,
      }}
      onClick={(e) => onClick?.(resource, e)}
      onDoubleClick={(e) => onDoubleClick?.(resource, e)}
      role="row"
      aria-selected={isSelected}
    >
      <div className={styles.resourceCell}>
        <span className={styles.resourceName}>{resource.name}</span>
        {resource.code && (
          <span className={styles.resourceCode}>{resource.code}</span>
        )}
      </div>
    </div>
  );
});
