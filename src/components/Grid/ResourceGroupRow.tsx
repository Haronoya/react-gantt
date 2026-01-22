'use client';

import { memo, type CSSProperties } from 'react';
import styles from './Grid.module.css';

interface ResourceGroupRowProps {
  /** Group name */
  groupName: string;
  /** Toggle handler */
  onToggle?: () => void;
  /** Whether the group is collapsed */
  isCollapsed?: boolean;
  /** Inline styles */
  style?: CSSProperties;
}

export const ResourceGroupRow = memo(function ResourceGroupRow({
  groupName,
  onToggle,
  isCollapsed = false,
  style,
}: ResourceGroupRowProps) {
  return (
    <div
      className={`${styles.row} ${styles.groupRow}`}
      style={style}
      role="row"
    >
      <button
        className={styles.expandButton}
        onClick={onToggle}
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
