import type { ColumnDef } from '../types';

/** Default row height in pixels */
export const DEFAULT_ROW_HEIGHT = 36;

/** Default header height in pixels */
export const DEFAULT_HEADER_HEIGHT = 40;

/** Default bar height ratio (relative to row height) */
export const DEFAULT_BAR_HEIGHT_RATIO = 0.65;

/** Default grid width in pixels */
export const DEFAULT_GRID_WIDTH = 300;

/** Minimum grid width in pixels */
export const DEFAULT_MIN_GRID_WIDTH = 150;

/** Maximum grid width in pixels */
export const DEFAULT_MAX_GRID_WIDTH = 600;

/** Default splitter width in pixels */
export const DEFAULT_SPLITTER_WIDTH = 4;

/** Default overscan for virtual scrolling */
export const DEFAULT_OVERSCAN = 5;

/** Milliseconds per day */
export const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Milliseconds per hour */
export const MS_PER_HOUR = 60 * 60 * 1000;

/** Default columns when none provided */
export const DEFAULT_COLUMNS: ColumnDef[] = [
  {
    id: 'title',
    title: 'タスク名',
    width: 200,
    minWidth: 100,
    accessor: 'title',
    resizable: true,
    align: 'left',
  },
];

/** Tooltip show delay in ms */
export const TOOLTIP_DELAY = 500;

/** Drag threshold in pixels before drag starts */
export const DRAG_THRESHOLD = 3;
