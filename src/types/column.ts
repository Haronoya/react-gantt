import type { ReactNode } from 'react';
import type { Task, NormalizedTask } from './task';

/**
 * Column definition for the grid
 */
export interface ColumnDef<T extends Task = Task> {
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
  /** Field accessor - can be keyof Task or custom function */
  accessor: keyof T | ((task: NormalizedTask) => ReactNode);
  /** Custom cell renderer */
  render?: (value: unknown, task: NormalizedTask) => ReactNode;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
}
