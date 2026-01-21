import type { ComponentType, CSSProperties, ReactNode } from 'react';
import type { Task, NormalizedTask } from './task';
import type { ColumnDef } from './column';
import type { ViewConfig } from './view';
import type {
  OnTaskChange,
  OnSelectionChange,
  OnTaskClick,
  OnTaskDoubleClick,
  OnRowClick,
  OnScroll,
  OnViewChange,
  SelectionState,
} from './events';

// Re-export to suppress unused warnings
export type { Task, NormalizedTask, ColumnDef, ViewConfig };

export * from './task';
export * from './column';
export * from './view';
export * from './events';

/**
 * Props for custom task bar renderer
 */
export interface TaskBarRendererProps {
  task: NormalizedTask;
  isSelected: boolean;
  isDragging: boolean;
  style: CSSProperties;
}

/**
 * Props for custom tooltip renderer
 */
export interface TooltipRendererProps {
  task: NormalizedTask;
  position: { x: number; y: number };
}

/**
 * Props for custom grid row renderer
 */
export interface GridRowRendererProps {
  task: NormalizedTask;
  columns: ColumnDef[];
  isSelected: boolean;
  children: ReactNode;
}

/**
 * Custom renderers for different Gantt elements
 */
export interface GanttRenderers {
  /** Custom task bar renderer */
  taskBar?: ComponentType<TaskBarRendererProps>;
  /** Custom tooltip renderer */
  tooltip?: ComponentType<TooltipRendererProps>;
  /** Custom grid row renderer */
  gridRow?: ComponentType<GridRowRendererProps>;
}

/**
 * Main Gantt component props
 */
export interface GanttProps {
  /** Task data array */
  tasks: Task[];
  /** Column definitions for the grid */
  columns?: ColumnDef[];
  /** View configuration (zoom, scroll position, visible range) */
  view?: Partial<ViewConfig>;
  /** Selection state (controlled) */
  selection?: SelectionState;
  /** Whether editing is enabled */
  editable?: boolean;
  /** Default row height in pixels */
  rowHeight?: number;
  /** Grid panel width in pixels */
  gridWidth?: number;
  /** Minimum grid width */
  minGridWidth?: number;
  /** Maximum grid width */
  maxGridWidth?: number;
  /** Whether to show the grid panel */
  showGrid?: boolean;
  /** Fit timeline to container width (auto-adjusts zoom scale) */
  fitToContainer?: boolean;
  /** Sync parent task dates with children (parent spans all children) */
  syncParentDates?: boolean;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Locale for date formatting (default: 'en-US') */
  locale?: string;

  // Event handlers
  /** Called when a task is modified */
  onTaskChange?: OnTaskChange;
  /** Called when selection changes */
  onSelectionChange?: OnSelectionChange;
  /** Called when a task bar is clicked */
  onTaskClick?: OnTaskClick;
  /** Called when a task bar is double-clicked */
  onTaskDoubleClick?: OnTaskDoubleClick;
  /** Called when a grid row is clicked */
  onRowClick?: OnRowClick;
  /** Called on scroll */
  onScroll?: OnScroll;
  /** Called when view changes (zoom, visible range) */
  onViewChange?: OnViewChange;
  /** Called when a column is resized */
  onColumnResize?: (columnId: string, width: number) => void;

  // Custom renderers
  renderers?: GanttRenderers;
}
