import type { MouseEvent as ReactMouseEvent } from 'react';
import type { TaskPatch, ChangeContext, NormalizedTask } from './task';
import type { ViewConfig } from './view';

/**
 * Selection state
 */
export interface SelectionState {
  /** Currently selected task IDs */
  ids: string[];
  /** Anchor task for range selection */
  anchor?: string;
  /** Related task IDs (computed, for highlighting) */
  relatedIds?: string[];
}

/**
 * Task change event handler
 */
export type OnTaskChange = (patch: TaskPatch, context: ChangeContext) => void;

/**
 * Selection change event handler
 */
export type OnSelectionChange = (selection: SelectionState) => void;

/**
 * Task click event handler
 */
export type OnTaskClick = (task: NormalizedTask, event: ReactMouseEvent) => void;

/**
 * Task double click event handler
 */
export type OnTaskDoubleClick = (task: NormalizedTask, event: ReactMouseEvent) => void;

/**
 * Row click event handler
 */
export type OnRowClick = (task: NormalizedTask, event: ReactMouseEvent) => void;

/**
 * Scroll event data
 */
export interface ScrollEvent {
  scrollLeft: number;
  scrollTop: number;
}

/**
 * Scroll event handler
 */
export type OnScroll = (event: ScrollEvent) => void;

/**
 * View change event handler
 */
export type OnViewChange = (view: ViewConfig) => void;
