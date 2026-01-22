# @haro/react-gantt API Reference

Complete API documentation for the @haro/react-gantt library.

## Table of Contents

- [Components](#components)
  - [Gantt](#gantt)
- [Types](#types)
  - [Task](#task)
  - [ColumnDef](#columndef)
  - [ViewConfig](#viewconfig)
  - [Dependency](#dependency)
  - [Resource](#resource)
  - [Marker](#marker)
  - [NonWorkingPeriod](#nonworkingperiod)
- [Event Handlers](#event-handlers)
- [Hooks](#hooks)
- [Utilities](#utilities)
- [Constants](#constants)
- [CSS Variables](#css-variables)

---

## Components

### Gantt

The main Gantt chart component.

```tsx
import { Gantt } from '@haro/react-gantt';
import '@haro/react-gantt/styles.css';

<Gantt
  tasks={tasks}
  columns={columns}
  view={{ zoom: 'day' }}
  editable={true}
  onTaskChange={handleTaskChange}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | `Task[]` | **required** | Array of task data |
| `columns` | `ColumnDef[]` | Default columns | Column definitions for the grid |
| `view` | `Partial<ViewConfig>` | `{ zoom: 'day' }` | View configuration (zoom, visible range) |
| `selection` | `SelectionState` | - | Controlled selection state |
| `editable` | `boolean` | `true` | Enable task editing (drag/resize) |
| `rowHeight` | `number` | `36` | Row height in pixels |
| `gridWidth` | `number` | `300` | Grid panel width in pixels |
| `minGridWidth` | `number` | `100` | Minimum grid width |
| `maxGridWidth` | `number` | `600` | Maximum grid width |
| `showGrid` | `boolean` | `true` | Show the grid panel |
| `fitToContainer` | `boolean` | `false` | Auto-fit timeline to container width |
| `syncParentDates` | `boolean` | `false` | Sync parent task dates with children |
| `className` | `string` | - | CSS class name |
| `style` | `CSSProperties` | - | Inline styles |
| `locale` | `string` | `'en-US'` | Locale for date formatting |

#### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onTaskChange` | `OnTaskChange` | Called when a task is modified |
| `onSelectionChange` | `OnSelectionChange` | Called when selection changes |
| `onTaskClick` | `OnTaskClick` | Called when a task bar is clicked |
| `onTaskDoubleClick` | `OnTaskDoubleClick` | Called when a task bar is double-clicked |
| `onRowClick` | `OnRowClick` | Called when a grid row is clicked |
| `onScroll` | `OnScroll` | Called on scroll |
| `onViewChange` | `OnViewChange` | Called when view changes (zoom, visible range) |
| `onColumnResize` | `(columnId: string, width: number) => void` | Called when a column is resized |

#### Marker Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `markers` | `Marker[]` | - | Global markers displayed across all rows |
| `showTaskDeadlines` | `boolean` | `true` | Show task deadline markers |
| `deadlineColor` | `string` | - | Default color for deadline markers |
| `onMarkerClick` | `(marker: Marker, event: MouseEvent) => void` | - | Marker click handler |

#### Dependency Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dependencies` | `Dependency[]` | - | Task dependencies array |
| `showDependencies` | `boolean` | `true` | Show dependency lines |
| `highlightDependencies` | `boolean` | `true` | Highlight dependencies for selected tasks |
| `onDependencyClick` | `(dep: Dependency, event: MouseEvent) => void` | - | Dependency click handler |

#### Non-Working Time Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nonWorkingPeriods` | `NonWorkingPeriod[]` | - | Non-working periods to display |
| `workingHours` | `WorkingHours` | - | Working hours configuration |
| `showNonWorkingTime` | `boolean` | `true` | Show non-working time |
| `highlightWeekends` | `boolean` | `true` | Highlight weekends |

#### Resource Mode Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `resources` | `Resource[]` | `[]` | Resource list for resource view |
| `resourceMode` | `boolean` | `false` | Enable resource view mode |
| `resourceGroupBy` | `string` | - | Group resources by this field |
| `resourceRowHeight` | `number` | - | Row height for resource rows |
| `showEmptyResources` | `boolean` | `true` | Show resources with no tasks |
| `onResourceClick` | `(resource: Resource, event: MouseEvent) => void` | - | Resource click handler |
| `onResourceDoubleClick` | `(resource: Resource, event: MouseEvent) => void` | - | Resource double-click handler |

#### Other Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `renderers` | `GanttRenderers` | - | Custom renderers for task bar, tooltip, etc. |
| `highlightRelatedTasks` | `boolean` | `false` | Highlight related tasks on selection |

---

## Types

### Task

Core task interface representing a single item in the Gantt chart.

```typescript
interface Task {
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
  type?: 'task' | 'milestone' | 'group';
  /** Parent task ID for hierarchy */
  parentId?: string | null;
  /** Whether children are collapsed */
  collapsed?: boolean;
  /** Custom row height in pixels */
  rowHeight?: number;
  /** Custom styling */
  style?: TaskStyle;
  /** Arbitrary metadata */
  meta?: Record<string, unknown>;
  /** Task deadline (timestamp) - displays as a marker line */
  deadline?: number;
  /** Segments for composite task bars */
  segments?: TaskSegment[];
  /** Group ID for related task highlighting */
  groupId?: string;
  /** Explicit list of related task IDs */
  relatedTaskIds?: string[];
  /** Resource ID (for resource view) */
  resourceId?: string;
}
```

### TaskStyle

Custom styling options for a task.

```typescript
interface TaskStyle {
  /** CSS class to apply to the task bar */
  barClass?: string;
  /** Background color of the task bar */
  color?: string;
  /** Progress bar color */
  progressColor?: string;
}
```

### NormalizedTask

Internal normalized task with computed values (extends Task).

```typescript
interface NormalizedTask extends Omit<Task, 'start' | 'end'> {
  /** Start time as Unix timestamp (ms) */
  start: number;
  /** End time as Unix timestamp (ms) */
  end: number;
  /** Computed depth in hierarchy (0 = root) */
  depth: number;
  /** Whether this task has children */
  hasChildren: boolean;
  /** Whether this task is visible */
  visible: boolean;
  /** Index in the flattened visible list */
  visibleIndex: number;
}
```

### TaskPatch

Partial task update provided to onTaskChange callback.

```typescript
interface TaskPatch {
  /** Task ID being updated */
  id: string;
  /** Fields that changed */
  changes: Partial<Pick<Task, 'start' | 'end' | 'progress' | 'title' | 'collapsed' | 'parentId' | 'resourceId'>>;
  /** Previous values for undo support */
  previousValues: Partial<Pick<Task, 'start' | 'end' | 'progress' | 'title' | 'collapsed' | 'parentId' | 'resourceId'>>;
}
```

### ChangeContext

Context provided with task change events.

```typescript
interface ChangeContext {
  /** Type of change */
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
```

### ColumnDef

Column definition for the grid.

```typescript
interface ColumnDef<T extends Task = Task> {
  /** Unique column identifier */
  id: string;
  /** Column header title */
  title: string;
  /** Column width in pixels */
  width: number;
  /** Minimum width (for resizing) */
  minWidth?: number;
  /** Maximum width (for resizing) */
  maxWidth?: number;
  /** Whether the column can be resized */
  resizable?: boolean;
  /** Field accessor - key name or function */
  accessor: keyof T | ((task: NormalizedTask) => ReactNode);
  /** Custom cell renderer */
  render?: (value: unknown, task: NormalizedTask) => ReactNode;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}
```

### ViewConfig

View state configuration.

```typescript
interface ViewConfig {
  /** Current zoom level */
  zoom: ZoomLevel;
  /** Visible range start (Unix timestamp ms) */
  start?: number;
  /** Visible range end (Unix timestamp ms) */
  end?: number;
  /** Horizontal scroll position */
  scrollLeft?: number;
  /** Vertical scroll position */
  scrollTop?: number;
}
```

### ZoomLevel

Available zoom levels.

```typescript
type ZoomLevel = 'hour' | 'day' | 'week' | 'month';
```

| Level | pixelsPerDay | Primary Use Case |
|-------|-------------|------------------|
| `hour` | 1200 (50px/hour) | Schedules within a single day |
| `day` | 50 | Weekly planning |
| `week` | 15 | Monthly planning |
| `month` | 5 | Quarterly to yearly planning |

### ZoomConfig

Configuration for each zoom level.

```typescript
interface ZoomConfig {
  /** Pixels per day */
  pixelsPerDay: number;
  /** Format for primary header (top) */
  primaryFormat: string;
  /** Format for secondary header (bottom) */
  secondaryFormat: string;
  /** Snap granularity in milliseconds */
  snapMs: number;
  /** Primary header unit span in days */
  primaryUnitDays: number;
  /** Secondary header unit span in days */
  secondaryUnitDays: number;
}
```

### Dependency

A dependency relationship between two tasks.

```typescript
interface Dependency {
  /** Unique identifier */
  id: string;
  /** Source task ID (predecessor) */
  fromTaskId: string;
  /** Target task ID (successor) */
  toTaskId: string;
  /** Dependency type */
  type: DependencyType;
  /** Lag time in milliseconds */
  lag?: number;
  /** Line color */
  color?: string;
  /** Line style */
  style?: 'solid' | 'dashed';
  /** Line stroke width (default: 2) */
  strokeWidth?: number;
}
```

#### DependencyType

```typescript
type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';
```

- `FS` (Finish-to-Start): Successor starts after predecessor finishes (most common)
- `SS` (Start-to-Start): Both tasks start at the same time
- `FF` (Finish-to-Finish): Both tasks finish at the same time
- `SF` (Start-to-Finish): Predecessor start triggers successor finish

### Resource

Resource represents an entity that tasks can be assigned to.

```typescript
interface Resource {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Resource code (optional) */
  code?: string;
  /** Resource group for grouping */
  group?: string;
  /** Maximum concurrent tasks (default: 1) */
  capacity?: number;
  /** Background color for resource row */
  color?: string;
  /** Whether collapsed */
  collapsed?: boolean;
  /** Custom metadata */
  meta?: Record<string, unknown>;
}
```

### Marker

Global marker displayed as a vertical line across all rows.

```typescript
interface Marker {
  /** Unique identifier */
  id: string;
  /** Marker position (Unix timestamp in ms) */
  timestamp: number;
  /** Display label */
  label?: string;
  /** Line color */
  color?: string;
  /** Line style */
  style?: 'solid' | 'dashed' | 'dotted';
  /** Line width (default: 2) */
  width?: number;
  /** Whether to show label (default: true) */
  showLabel?: boolean;
  /** Label position (default: 'top') */
  labelPosition?: 'top' | 'bottom';
}
```

### NonWorkingPeriod

A non-working period displayed as grayed out.

```typescript
interface NonWorkingPeriod {
  /** Unique identifier */
  id: string;
  /** Start timestamp */
  start: number;
  /** End timestamp */
  end: number;
  /** Type of non-working period */
  type?: 'holiday' | 'break' | 'maintenance' | 'custom';
  /** Display label */
  label?: string;
  /** Background color */
  color?: string;
  /** Recurring pattern */
  recurring?: RecurringPattern;
  /** Resource ID (if applies to specific resource) */
  resourceId?: string;
}
```

### WorkingHours

Working hours configuration for automatic non-working time calculation.

```typescript
interface WorkingHours {
  /** Start time in "HH:mm" format (e.g., "09:00") */
  start: string;
  /** End time in "HH:mm" format (e.g., "18:00") */
  end: string;
  /** Working days (0-6, 0=Sunday). Default: [1,2,3,4,5] (Mon-Fri) */
  daysOfWeek?: number[];
}
```

### SelectionState

Selection state for controlled selection.

```typescript
interface SelectionState {
  /** Currently selected task IDs */
  ids: string[];
  /** Anchor task for range selection */
  anchor?: string;
  /** Related task IDs (computed, for highlighting) */
  relatedIds?: string[];
}
```

### GanttRenderers

Custom renderers for different Gantt elements.

```typescript
interface GanttRenderers {
  /** Custom task bar renderer */
  taskBar?: ComponentType<TaskBarRendererProps>;
  /** Custom tooltip renderer */
  tooltip?: ComponentType<TooltipRendererProps>;
  /** Custom grid row renderer */
  gridRow?: ComponentType<GridRowRendererProps>;
}
```

---

## Event Handlers

### OnTaskChange

Called when a task is modified through drag operations or editing.

```typescript
type OnTaskChange = (patch: TaskPatch, context: ChangeContext) => void;
```

**Example:**

```tsx
const handleTaskChange = (patch: TaskPatch, context: ChangeContext) => {
  console.log(`Task ${patch.id} changed via ${context.type}`);
  console.log('Changes:', patch.changes);
  console.log('Previous values:', patch.previousValues);

  // Apply changes to your state
  setTasks(tasks.map(task =>
    task.id === patch.id
      ? { ...task, ...patch.changes }
      : task
  ));
};
```

### OnSelectionChange

Called when task selection changes.

```typescript
type OnSelectionChange = (selection: SelectionState) => void;
```

### OnTaskClick / OnTaskDoubleClick

```typescript
type OnTaskClick = (task: NormalizedTask, event: ReactMouseEvent) => void;
type OnTaskDoubleClick = (task: NormalizedTask, event: ReactMouseEvent) => void;
```

### OnScroll

```typescript
type OnScroll = (event: ScrollEvent) => void;

interface ScrollEvent {
  scrollLeft: number;
  scrollTop: number;
}
```

### OnViewChange

```typescript
type OnViewChange = (view: ViewConfig) => void;
```

---

## Hooks

### useGanttState

Main state management hook for advanced usage.

```typescript
import { useGanttState } from '@haro/react-gantt';

const ganttState = useGanttState({
  tasks,
  columns,
  zoom: 'day',
  rowHeight: 36,
  syncParentDates: true,
  onTaskChange,
  onSelectionChange,
});

// Returns:
// {
//   normalizedTasks, visibleTasks, zoom, zoomConfig,
//   viewStart, viewEnd, rowHeight, columns, selection,
//   isSelected, setZoom, setViewRange,
//   handleTaskChange, handleSelectionChange, handleToggleCollapse,
// }
```

### useSyncScroll

Synchronize vertical scroll between Grid and Timeline panels.

```typescript
import { useSyncScroll } from '@haro/react-gantt';

const { gridRef, timelineRef, handleGridScroll, handleTimelineScroll, scrollTo } = useSyncScroll(onScroll);
```

### useZoom

Zoom level management.

```typescript
import { useZoom } from '@haro/react-gantt';

const { zoom, setZoom, zoomConfig, zoomIn, zoomOut } = useZoom('day');
```

### useSelection

Task selection management.

```typescript
import { useSelection } from '@haro/react-gantt';

const { selection, isSelected, select, deselect, toggle, clear } = useSelection();
```

### useDrag

Drag operation handling.

```typescript
import { useDrag } from '@haro/react-gantt';

const { isDragging, handleDragStart, getDragPreview, targetRowIndex } = useDrag({
  tasks,
  zoomConfig,
  onTaskChange,
  editable: true,
  rowHeight,
});
```

### useResourceLayout

Resource view layout management.

```typescript
import { useResourceLayout } from '@haro/react-gantt';

const { rows, getTasksForResource, visibleRowCount, toggleGroup, collapsedGroups, taskRowMap } = useResourceLayout(
  resources,
  tasks,
  { groupBy: 'group', showEmptyResources: true, defaultCollapsed: false }
);
```

### useTaskPositions

Task bar position calculation.

```typescript
import { useTaskPositions } from '@haro/react-gantt';

const { positions, getPosition } = useTaskPositions({
  tasks,
  zoomConfig,
  viewStart,
  rowHeight,
});
```

### useTooltip

Tooltip state management.

```typescript
import { useTooltip } from '@haro/react-gantt';

const { tooltipState, handleMouseEnter, handleMouseLeave, handleMouseMove } = useTooltip();
```

---

## Utilities

### Date Utilities

```typescript
import {
  toTimestamp,      // Convert Date or number to timestamp
  toDate,           // Convert timestamp to Date
  startOfDay,       // Get start of day
  endOfDay,         // Get end of day
  startOfWeek,      // Get start of week
  startOfMonth,     // Get start of month
  addDays,          // Add days to timestamp
  addMonths,        // Add months to timestamp
  diffInDays,       // Calculate difference in days
  isSameDay,        // Check if same day
  isToday,          // Check if today
  isWeekend,        // Check if weekend
  formatDate,       // Format date string
  snapToUnit,       // Snap timestamp to unit
  getDateRange,     // Get date range from tasks
} from '@haro/react-gantt';
```

### Position Utilities

```typescript
import {
  timestampToPixel,          // Convert timestamp to pixel position
  pixelToTimestamp,          // Convert pixel to timestamp
  calculateTaskPosition,     // Calculate task bar position
  calculateMilestonePosition, // Calculate milestone position
  calculateTimelineWidth,    // Calculate total timeline width
} from '@haro/react-gantt';
```

### Tree Utilities

```typescript
import {
  normalizeTasks,        // Normalize task array
  getVisibleTasks,       // Get visible tasks (not collapsed)
  flattenVisibleTasks,   // Flatten visible tasks
  getTaskById,           // Find task by ID
  getTaskChildren,       // Get direct children
  getDescendantIds,      // Get all descendant IDs
} from '@haro/react-gantt';
```

### Capacity Utilities

```typescript
import {
  calculateCapacity,        // Calculate resource capacity
  getCapacityStatusClass,   // Get CSS class for capacity status
  getCapacityColor,         // Get color for capacity level
} from '@haro/react-gantt';
```

---

## Constants

```typescript
import {
  ZOOM_CONFIGS,          // Zoom configuration map
  DEFAULT_ZOOM,          // 'day'
  DEFAULT_ROW_HEIGHT,    // 36
  DEFAULT_HEADER_HEIGHT, // 40
  DEFAULT_GRID_WIDTH,    // 300
  DEFAULT_COLUMNS,       // Default column definitions
  MS_PER_DAY,            // 86400000
} from '@haro/react-gantt';
```

### ZOOM_CONFIGS

```typescript
const ZOOM_CONFIGS = {
  hour: {
    pixelsPerDay: 1200,
    primaryFormat: 'YYYY/MM/DD',
    secondaryFormat: 'HH:mm',
    snapMs: 15 * 60 * 1000, // 15 minutes
    primaryUnitDays: 1,
    secondaryUnitDays: 1/24,
  },
  day: {
    pixelsPerDay: 50,
    primaryFormat: 'YYYY/MM',
    secondaryFormat: 'D',
    snapMs: 24 * 60 * 60 * 1000, // 1 day
    primaryUnitDays: 30,
    secondaryUnitDays: 1,
  },
  week: {
    pixelsPerDay: 15,
    primaryFormat: 'YYYY/MM',
    secondaryFormat: 'D',
    snapMs: 24 * 60 * 60 * 1000, // 1 day
    primaryUnitDays: 30,
    secondaryUnitDays: 7,
  },
  month: {
    pixelsPerDay: 5,
    primaryFormat: 'YYYY',
    secondaryFormat: 'MMM',
    snapMs: 24 * 60 * 60 * 1000, // 1 day
    primaryUnitDays: 365,
    secondaryUnitDays: 30,
  },
};
```

---

## CSS Variables

Customize the appearance using CSS variables.

### Colors

```css
:root {
  /* Background */
  --gantt-bg: #ffffff;
  --gantt-header-bg: #fafafa;
  --gantt-row-bg-alt: #fafafa;
  --gantt-weekend-bg: rgba(0, 0, 0, 0.02);

  /* Text */
  --gantt-text: #333333;
  --gantt-text-secondary: #666666;
  --gantt-text-muted: #999999;

  /* Borders */
  --gantt-border: #e0e0e0;
  --gantt-border-light: #f0f0f0;
  --gantt-header-border: #d0d0d0;

  /* Grid lines */
  --gantt-grid-line: rgba(0, 0, 0, 0.06);
  --gantt-grid-line-strong: rgba(0, 0, 0, 0.12);

  /* Task bars */
  --gantt-task-bg: #42a5f5;
  --gantt-task-progress: #1976d2;
  --gantt-milestone-bg: #ff9800;
  --gantt-group-bg: #78909c;
  --gantt-bar-selected: rgba(25, 118, 210, 0.3);

  /* Special lines */
  --gantt-today-line: #f44336;
  --gantt-dependency-color: #999999;
  --gantt-dependency-highlight: #1976d2;
}
```

### Sizes

```css
:root {
  --gantt-row-height: 36px;
  --gantt-header-height: 40px;
  --gantt-bar-height: 24px;
  --gantt-bar-radius: 4px;
  --gantt-milestone-size: 16px;
}
```

### Typography

```css
:root {
  --gantt-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --gantt-font-size-base: 13px;
  --gantt-font-size-small: 11px;
  --gantt-font-size-header: 12px;
  --gantt-font-weight-normal: 400;
  --gantt-font-weight-medium: 500;
}
```

### Z-Index

```css
:root {
  --gantt-z-bars: 10;
  --gantt-z-selection: 15;
  --gantt-z-drag: 20;
  --gantt-z-tooltip: 100;
}
```

### Dark Mode

```css
[data-theme="dark"] {
  --gantt-bg: #1e1e1e;
  --gantt-header-bg: #252525;
  --gantt-border: #444444;
  --gantt-text: #e0e0e0;
  --gantt-text-secondary: #aaaaaa;
}
```

---

## Examples

### Basic Usage

```tsx
import { useState } from 'react';
import { Gantt, Task } from '@haro/react-gantt';
import '@haro/react-gantt/styles.css';

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Project Planning',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-15'),
    progress: 0.8,
    type: 'group',
  },
  {
    id: '2',
    title: 'Requirements Analysis',
    start: new Date('2024-01-01'),
    end: new Date('2024-01-07'),
    progress: 1,
    parentId: '1',
  },
  {
    id: '3',
    title: 'Design Phase',
    start: new Date('2024-01-08'),
    end: new Date('2024-01-15'),
    progress: 0.5,
    parentId: '1',
  },
];

function App() {
  const [tasks, setTasks] = useState(initialTasks);

  const handleTaskChange = (patch, context) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === patch.id ? { ...task, ...patch.changes } : task
      )
    );
  };

  return (
    <Gantt
      tasks={tasks}
      view={{ zoom: 'day' }}
      editable={true}
      onTaskChange={handleTaskChange}
    />
  );
}
```

### With Dependencies

```tsx
const dependencies = [
  { id: 'd1', fromTaskId: '2', toTaskId: '3', type: 'FS' },
];

<Gantt
  tasks={tasks}
  dependencies={dependencies}
  showDependencies={true}
  highlightDependencies={true}
  onDependencyClick={(dep, event) => console.log('Clicked:', dep)}
/>
```

### Resource View Mode

```tsx
const resources = [
  { id: 'r1', name: 'Alice', group: 'Development' },
  { id: 'r2', name: 'Bob', group: 'Development' },
  { id: 'r3', name: 'Carol', group: 'Design' },
];

const tasks = [
  { id: '1', title: 'Backend API', start: ..., end: ..., resourceId: 'r1' },
  { id: '2', title: 'Frontend UI', start: ..., end: ..., resourceId: 'r2' },
  { id: '3', title: 'UI Design', start: ..., end: ..., resourceId: 'r3' },
];

<Gantt
  tasks={tasks}
  resources={resources}
  resourceMode={true}
  resourceGroupBy="group"
  showEmptyResources={true}
/>
```

### Custom Columns

```tsx
const columns = [
  {
    id: 'title',
    title: 'Task Name',
    accessor: 'title',
    width: 200,
    resizable: true,
  },
  {
    id: 'progress',
    title: 'Progress',
    accessor: (task) => `${Math.round((task.progress || 0) * 100)}%`,
    width: 80,
    align: 'right',
  },
  {
    id: 'duration',
    title: 'Duration',
    accessor: (task) => {
      const days = Math.ceil((task.end - task.start) / (1000 * 60 * 60 * 24));
      return `${days} days`;
    },
    width: 100,
  },
];

<Gantt tasks={tasks} columns={columns} />
```

### With Markers and Non-Working Time

```tsx
const markers = [
  { id: 'm1', timestamp: Date.now(), label: 'Today', color: '#f44336' },
  { id: 'm2', timestamp: new Date('2024-02-14').getTime(), label: 'Valentine', color: '#e91e63' },
];

const workingHours = {
  start: '09:00',
  end: '18:00',
  daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
};

<Gantt
  tasks={tasks}
  markers={markers}
  workingHours={workingHours}
  showNonWorkingTime={true}
  highlightWeekends={true}
/>
```

### Custom Task Styling

```tsx
const tasks = [
  {
    id: '1',
    title: 'High Priority',
    start: ...,
    end: ...,
    style: {
      color: '#e53935',
      progressColor: '#b71c1c',
    },
  },
  {
    id: '2',
    title: 'Normal Task',
    start: ...,
    end: ...,
    style: {
      color: '#43a047',
      barClass: 'custom-task-bar',
    },
  },
];
```
