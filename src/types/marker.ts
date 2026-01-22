/**
 * Marker style type
 */
export type MarkerStyle = 'solid' | 'dashed' | 'dotted';

/**
 * Global marker - displays as a vertical line across all rows
 */
export interface Marker {
  /** Unique identifier */
  id: string;
  /** Marker position (Unix timestamp in ms) */
  timestamp: number;
  /** Display label */
  label?: string;
  /** Line color */
  color?: string;
  /** Line style */
  style?: MarkerStyle;
  /** Line width in pixels (default: 2) */
  width?: number;
  /** Whether to show label (default: true) */
  showLabel?: boolean;
  /** Label position (default: 'top') */
  labelPosition?: 'top' | 'bottom';
}

/**
 * Task-specific marker - displays within a task's row
 */
export interface TaskMarker extends Marker {
  /** Associated task ID */
  taskId: string;
}
