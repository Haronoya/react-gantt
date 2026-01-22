import type { MouseEvent as ReactMouseEvent } from 'react';
import type {
  NormalizedTask,
  ZoomConfig,
  ZoomLevel,
  SelectionState,
  TaskPatch,
  ChangeContext,
  ColumnDef,
  GanttRenderers,
} from '../types';
import type { DragType } from '../hooks';

/**
 * Context value provided to all Gantt child components
 */
export interface GanttContextValue {
  // Data
  visibleTasks: NormalizedTask[];
  columns: ColumnDef[];

  // View configuration
  zoom: ZoomLevel;
  zoomConfig: ZoomConfig;
  viewStart: number;
  viewEnd: number;
  rowHeight: number;
  locale: string;

  // State
  selection: SelectionState;
  editable: boolean;

  // Selection helpers
  isSelected: (taskId: string) => boolean;
  isRelated: (taskId: string) => boolean;

  // Drag state
  isDragging: boolean;
  getDragPreview: (taskId: string) => { start: number; end: number; progress?: number } | null;

  // Actions
  handleTaskChange: (patch: TaskPatch, context: ChangeContext) => void;
  handleSelectionChange: (selection: SelectionState) => void;
  handleToggleCollapse: (taskId: string) => void;
  handleDragStart: (taskId: string, type: DragType, clientX: number, clientY: number) => void;
  handleTaskClick: (task: NormalizedTask, event: ReactMouseEvent) => void;
  handleTaskDoubleClick: (task: NormalizedTask, event: ReactMouseEvent) => void;
  handleRowClick: (task: NormalizedTask, event: ReactMouseEvent) => void;

  // Tooltip
  handleTooltipEnter: (task: NormalizedTask, event: ReactMouseEvent) => void;
  handleTooltipLeave: () => void;
  handleTooltipMove: (event: ReactMouseEvent) => void;

  // Column resize
  handleColumnResize?: (columnId: string, width: number) => void;

  // Custom renderers
  renderers?: GanttRenderers;
}
