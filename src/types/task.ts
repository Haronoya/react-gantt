import type { CSSProperties } from 'react';
import type { TaskSegment } from './segment';

/**
 * Task type determines visual representation
 */
export type TaskType = 'task' | 'milestone' | 'group';

/**
 * Custom styling options for a task bar (timeline area)
 */
export interface TaskStyle {
  /** CSS class to apply to the task bar */
  barClass?: string;
  /** Background color of the task bar */
  color?: string;
  /** Progress bar color */
  progressColor?: string;
}

/**
 * Custom styling options for a grid row (left panel)
 */
export interface RowStyle {
  /** Background color of the row */
  backgroundColor?: string;
  /** Text color */
  color?: string;
  /** Font weight */
  fontWeight?: CSSProperties['fontWeight'];
  /** Custom CSS class */
  className?: string;
}

/**
 * Core Task interface - represents a single item in the Gantt chart
 */
export interface Task {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Start date/time (Date object or Unix timestamp in ms) */
  start: Date | number;
  /** End date/time (Date object or Unix timestamp in ms) */
  end: Date | number;
  /** Progress percentage (0-1) */
  progress?: number;
  /** Visual type: task, milestone, or group */
  type?: TaskType;
  /** Parent task ID for hierarchy */
  parentId?: string | null;
  /** Whether children are collapsed (for group tasks) */
  collapsed?: boolean;
  /** Custom row height in pixels */
  rowHeight?: number;
  /** Custom styling for task bar (timeline area) */
  style?: TaskStyle;
  /** Custom styling for grid row (left panel) */
  rowStyle?: RowStyle;
  /** Arbitrary metadata for user extensions */
  meta?: Record<string, unknown>;

  // Marker-related fields
  /** Task deadline (Unix timestamp in ms) - displays as a marker line */
  deadline?: number;

  // Segmented task bar
  /** Segments for composite task bars (total duration must equal end - start) */
  segments?: TaskSegment[];

  // Related task highlighting
  /** Group ID for related task highlighting (tasks with same groupId are related) */
  groupId?: string;
  /** Explicit list of related task IDs */
  relatedTaskIds?: string[];

  // Resource assignment (for resource view and capacity calculation)
  /** ID of the resource this task is assigned to */
  resourceId?: string;
}

/**
 * Internal normalized task with computed values
 */
export interface NormalizedTask extends Omit<Task, 'start' | 'end'> {
  /** Start time as Unix timestamp (ms) */
  start: number;
  /** End time as Unix timestamp (ms) */
  end: number;
  /** Computed depth in hierarchy (0 = root) */
  depth: number;
  /** Whether this task has children */
  hasChildren: boolean;
  /** Whether this task is visible (not hidden by collapsed parent) */
  visible: boolean;
  /** Index in the flattened visible list */
  visibleIndex: number;
}

/**
 * Partial task update for onTaskChange callback
 */
export interface TaskPatch {
  /** Task ID being updated */
  id: string;
  /** Fields that changed */
  changes: Partial<Pick<Task, 'start' | 'end' | 'progress' | 'title' | 'collapsed' | 'parentId' | 'resourceId'>>;
  /** Previous values for undo support */
  previousValues: Partial<Pick<Task, 'start' | 'end' | 'progress' | 'title' | 'collapsed' | 'parentId' | 'resourceId'>>;
}

/**
 * Context provided with task change events
 */
export interface ChangeContext {
  /** Type of change that occurred */
  type: 'drag-move' | 'drag-resize-start' | 'drag-resize-end' | 'drag-row-change' | 'progress' | 'collapse' | 'edit';
  /** Original event if applicable */
  originalEvent?: MouseEvent | TouchEvent | KeyboardEvent;
  /** Target row index when moving between rows */
  targetRowIndex?: number;
  /** Target parent ID when moving to a different parent */
  targetParentId?: string | null;
  /** Target resource ID when moving to a different resource */
  targetResourceId?: string | null;
}
