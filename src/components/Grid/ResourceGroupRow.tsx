'use client';

import { memo, type MouseEvent } from 'react';
import styles from './Grid.module.css';

interface ResourceGroupRowProps {
  /** Group name */
  groupName: string;
  /** Row height in pixels */
  rowHeight: number;
  /** Top offset in pixels */
  top: number;
  /** Width of the grid */
  width: number;
  /** Whether the group is collapsed */
  isCollapsed: boolean;
  /** Toggle collapse handler */
  onToggleCollapse?: (groupName: string, event: MouseEvent) => void;
}

export const ResourceGroupRow = memo(function ResourceGroupRow({
  groupName,
  rowHeight,
  top,
  width,
  isCollapsed,
  onToggleCollapse,
}: ResourceGroupRowProps) {
  return (
    <div
      className={`${styles.row} ${styles.groupRow}`}
      style={{
        position: 'absolute',
        top,
        left: 0,
        width,
        height: rowHeight,
      }}
      role="row"
    >
      <button
        className={styles.expandButton}
        onClick={(e) => onToggleCollapse?.(groupName, e)}
        aria-expanded={!isCollapsed}
        aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
      >
        <span
          className={`${styles.expandIcon} ${isCollapsed ? styles.collapsed : ''}`}
        >
          ▶
        </span>
      </button>
      <span className={styles.groupName}>{groupName}</span>
    </div>
  );
});
