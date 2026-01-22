/**
 * Dependency type between tasks
 * - FS: Finish-to-Start (most common) - successor starts after predecessor finishes
 * - SS: Start-to-Start - both tasks start at the same time
 * - FF: Finish-to-Finish - both tasks finish at the same time
 * - SF: Start-to-Finish - predecessor start triggers successor finish
 */
export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

/**
 * Dependency line style
 */
export type DependencyStyle = 'solid' | 'dashed';

/**
 * A dependency relationship between two tasks
 */
export interface Dependency {
  /** Unique identifier */
  id: string;
  /** Source task ID (predecessor) */
  fromTaskId: string;
  /** Target task ID (successor) */
  toTaskId: string;
  /** Dependency type (default: 'FS') */
  type: DependencyType;
  /** Lag time in milliseconds (positive = delay, negative = lead) */
  lag?: number;
  /** Line color */
  color?: string;
  /** Line style */
  style?: DependencyStyle;
  /** Line stroke width in pixels (default: 2) */
  strokeWidth?: number;
}
