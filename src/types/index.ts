import type { ComponentType, CSSProperties, ReactNode, MouseEvent } from 'react';
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
import type { Marker } from './marker';
import type { Dependency } from './dependency';
import type { NonWorkingPeriod, WorkingHours } from './nonWorkingTime';
import type { Resource } from './resource';

// Re-export to suppress unused warnings
export type { Task, NormalizedTask, ColumnDef, ViewConfig };

export * from './task';
export * from './column';
export * from './view';
export * from './events';
export * from './marker';
export * from './segment';
export * from './dependency';
export * from './nonWorkingTime';
export * from './capacity';
export * from './resource';

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

  // Marker-related props
  /** Global markers displayed across all rows */
  markers?: Marker[];
  /** Whether to show task deadline markers (default: true when deadline is set) */
  showTaskDeadlines?: boolean;
  /** Default color for deadline markers */
  deadlineColor?: string;
  /** Called when a marker is clicked */
  onMarkerClick?: (marker: Marker, event: MouseEvent) => void;

  // Related task highlighting
  /** Whether to highlight related tasks when a task is selected (default: false) */
  highlightRelatedTasks?: boolean;

  // Dependency props
  /** Task dependencies array */
  dependencies?: Dependency[];
  /** Whether to show dependency lines (default: true when dependencies are provided) */
  showDependencies?: boolean;
  /** Whether to highlight dependencies for selected tasks (default: true) */
  highlightDependencies?: boolean;
  /** Called when a dependency line is clicked */
  onDependencyClick?: (dependency: Dependency, event: MouseEvent) => void;

  // Non-working time props
  /** Non-working periods to display as grayed out */
  nonWorkingPeriods?: NonWorkingPeriod[];
  /** Working hours configuration (auto-generates non-working time) */
  workingHours?: WorkingHours;
  /** Whether to show non-working time (default: true when periods or workingHours provided) */
  showNonWorkingTime?: boolean;
  /** Whether to highlight weekends (default: true) */
  highlightWeekends?: boolean;

  // Resource view props
  /** Resource list for resource view mode */
  resources?: Resource[];
  /** Enable resource view mode (default: false) */
  resourceMode?: boolean;
  /** Group resources by this field (e.g., 'group') */
  resourceGroupBy?: string;
  /** Row height for resource rows in pixels */
  resourceRowHeight?: number;
  /** Show resources with no assigned tasks (default: true) */
  showEmptyResources?: boolean;
  /** Called when a resource row is clicked */
  onResourceClick?: (resource: Resource, event: MouseEvent) => void;
  /** Called when a resource row is double-clicked */
  onResourceDoubleClick?: (resource: Resource, event: MouseEvent) => void;
}
