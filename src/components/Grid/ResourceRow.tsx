'use client';

import { memo, type MouseEvent, type CSSProperties } from 'react';
import type { Resource } from '../../types/resource';
import styles from './Grid.module.css';

interface ResourceRowProps {
  /** The resource to display */
  resource: Resource;
  /** Whether this is a drop target during drag */
  isDropTarget?: boolean;
  /** Whether the row is selected */
  isSelected?: boolean;
  /** Inline styles */
  style?: CSSProperties;
  /** Click handler */
  onClick?: (resource: Resource, event: MouseEvent) => void;
  /** Double-click handler */
  onDoubleClick?: (resource: Resource, event: MouseEvent) => void;
}

export const ResourceRow = memo(function ResourceRow({
  resource,
  isDropTarget = false,
  isSelected = false,
  style,
  onClick,
  onDoubleClick,
}: ResourceRowProps) {
  return (
    <div
      className={`${styles.row} ${isSelected ? styles.rowSelected : ''} ${isDropTarget ? styles.dropTarget : ''}`}
      style={{
        ...style,
        backgroundColor: resource.color,
      }}
      onClick={(e) => onClick?.(resource, e)}
      onDoubleClick={(e) => onDoubleClick?.(resource, e)}
      role="row"
      aria-selected={isSelected}
      data-resource-id={resource.id}
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
