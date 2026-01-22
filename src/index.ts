// Main component
export { Gantt } from './components/Gantt';

// Sub-components (for advanced usage)
export {
  Grid,
  GridHeader,
  GridRow,
  GridCell,
  Timeline,
  TimelineHeader,
  TimelineBody,
  TaskBar,
  TaskBarTask,
  TaskBarMilestone,
  TaskBarGroup,
  Splitter,
  Tooltip,
  DependencyLine,
  DependencyLayer,
  NonWorkingTimeLayer,
  CapacityBar,
  ResourceRow,
  ResourceGroupRow,
} from './components';

// Hooks (for advanced usage)
export {
  useGanttState,
  useSyncScroll,
  useZoom,
  useSelection,
  useTooltip,
  useDrag,
  useTaskPositions,
  useResourceLayout,
} from './hooks';

// Context (for advanced usage)
export { GanttProvider, useGanttContext } from './context';

// Types
export type {
  // Core types
  Task,
  TaskType,
  TaskStyle,
  NormalizedTask,
  TaskPatch,
  ChangeContext,
  // Column types
  ColumnDef,
  // View types
  ZoomLevel,
  ZoomConfig,
  ViewConfig,
  // Marker types
  Marker,
  MarkerStyle,
  TaskMarker,
  // Segment types
  TaskSegment,
  SegmentPattern,
  // Dependency types
  Dependency,
  DependencyType,
  DependencyStyle,
  // Non-working time types
  NonWorkingPeriod,
  NonWorkingType,
  WorkingHours,
  RecurringPattern,
  // Capacity types
  CapacityInfo,
  CapacityConfig,
  // Resource types
  Resource,
  ResourceGroup,
  ResourceRowData,
  // Event types
  SelectionState,
  OnTaskChange,
  OnSelectionChange,
  OnTaskClick,
  OnTaskDoubleClick,
  OnRowClick,
  OnScroll,
  OnViewChange,
  ScrollEvent,
  // Renderer types
  GanttRenderers,
  TaskBarRendererProps,
  TooltipRendererProps,
  GridRowRendererProps,
  // Main props
  GanttProps,
} from './types';

// Constants (for advanced usage)
export {
  ZOOM_CONFIGS,
  DEFAULT_ZOOM,
  DEFAULT_ROW_HEIGHT,
  DEFAULT_HEADER_HEIGHT,
  DEFAULT_GRID_WIDTH,
  DEFAULT_COLUMNS,
  MS_PER_DAY,
} from './constants';

// Utilities (for advanced usage)
export {
  // Date utilities
  toTimestamp,
  toDate,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  addDays,
  addMonths,
  diffInDays,
  isSameDay,
  isToday,
  isWeekend,
  formatDate,
  snapToUnit,
  getDateRange,
  // Position utilities
  timestampToPixel,
  pixelToTimestamp,
  calculateTaskPosition,
  calculateMilestonePosition,
  calculateTimelineWidth,
  // Tree utilities
  normalizeTasks,
  getVisibleTasks,
  flattenVisibleTasks,
  getTaskById,
  getTaskChildren,
  getDescendantIds,
  // Capacity utilities
  calculateCapacity,
  getCapacityStatusClass,
  getCapacityColor,
} from './utils';
