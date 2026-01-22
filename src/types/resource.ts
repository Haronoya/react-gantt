/**
 * Resource type definitions for resource view mode
 */

/**
 * Resource represents an entity that tasks can be assigned to
 * (e.g., person, equipment, room, etc.)
 */
export interface Resource {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Resource code (optional) */
  code?: string;
  /** Resource group for grouping/categorization */
  group?: string;
  /** Maximum concurrent tasks (default: 1) */
  capacity?: number;
  /** Background color for resource row */
  color?: string;
  /** Whether the resource group is collapsed */
  collapsed?: boolean;
  /** Custom metadata */
  meta?: Record<string, unknown>;
}

/**
 * Resource group header for grouped resource view
 */
export interface ResourceGroup {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Whether the group is collapsed */
  collapsed?: boolean;
}

/**
 * Internal row data for resource view layout
 */
export interface ResourceRowData {
  /** The resource (null for group headers) */
  resource: Resource | null;
  /** Tasks assigned to this resource */
  tasks: string[]; // Task IDs
  /** Whether this row is a group header */
  isGroupHeader: boolean;
  /** Group name (for group headers) */
  groupName?: string;
  /** Depth in hierarchy (0 = top level) */
  depth: number;
  /** Whether this row is visible (not collapsed) */
  visible: boolean;
  /** Group period start (for group headers) */
  groupStart?: number;
  /** Group period end (for group headers) */
  groupEnd?: number;
  /** Number of stack levels for overlapping tasks (1 = no overlap) */
  stackLevels?: number;
}
