/**
 * Task type determines visual representation
 */
export type TaskType = 'task' | 'milestone' | 'group';

/**
 * Custom styling options for a task
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
  /** Custom styling */
  style?: TaskStyle;
  /** Arbitrary metadata for user extensions */
  meta?: Record<string, unknown>;
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
  changes: Partial<Pick<Task, 'start' | 'end' | 'progress' | 'title' | 'collapsed'>>;
  /** Previous values for undo support */
  previousValues: Partial<Pick<Task, 'start' | 'end' | 'progress' | 'title' | 'collapsed'>>;
}

/**
 * Context provided with task change events
 */
export interface ChangeContext {
  /** Type of change that occurred */
  type: 'drag-move' | 'drag-resize-start' | 'drag-resize-end' | 'progress' | 'collapse' | 'edit';
  /** Original event if applicable */
  originalEvent?: MouseEvent | TouchEvent | KeyboardEvent;
}
