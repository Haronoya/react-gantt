import type { Task, NormalizedTask } from '../types';
import { toTimestamp } from './date';

/**
 * Build a map of parent -> children relationships
 */
function buildChildrenMap(tasks: Task[]): Map<string | null, Task[]> {
  const map = new Map<string | null, Task[]>();

  for (const task of tasks) {
    const parentId = task.parentId ?? null;
    const children = map.get(parentId) ?? [];
    children.push(task);
    map.set(parentId, children);
  }

  return map;
}

/**
 * Check if a task has any children
 */
function hasChildren(taskId: string, childrenMap: Map<string | null, Task[]>): boolean {
  return (childrenMap.get(taskId)?.length ?? 0) > 0;
}

/**
 * Get all collapsed ancestor IDs for checking visibility
 */
function getCollapsedAncestors(tasks: Task[]): Set<string> {
  const collapsed = new Set<string>();

  for (const task of tasks) {
    if (task.collapsed && task.type === 'group') {
      collapsed.add(task.id);
    }
  }

  return collapsed;
}

/**
 * Check if a task is hidden by a collapsed ancestor
 */
function isHiddenByAncestor(
  task: Task,
  taskMap: Map<string, Task>,
  collapsedIds: Set<string>
): boolean {
  let current = task.parentId;

  while (current) {
    if (collapsedIds.has(current)) {
      return true;
    }
    const parent = taskMap.get(current);
    current = parent?.parentId ?? null;
  }

  return false;
}

/**
 * Calculate depth of a task in the hierarchy
 */
function calculateDepth(
  task: Task,
  taskMap: Map<string, Task>,
  depthCache: Map<string, number>
): number {
  const cached = depthCache.get(task.id);
  if (cached !== undefined) {
    return cached;
  }

  if (!task.parentId) {
    depthCache.set(task.id, 0);
    return 0;
  }

  const parent = taskMap.get(task.parentId);
  if (!parent) {
    depthCache.set(task.id, 0);
    return 0;
  }

  const depth = calculateDepth(parent, taskMap, depthCache) + 1;
  depthCache.set(task.id, depth);
  return depth;
}

/**
 * Options for normalizing tasks
 */
export interface NormalizeTasksOptions {
  /** Sync parent task dates with children (parent spans all children) */
  syncParentDates?: boolean;
}

/**
 * Calculate the date range covered by all descendants of a task
 */
function calculateDescendantDateRange(
  taskId: string,
  childrenMap: Map<string | null, Task[]>,
  taskTimestamps: Map<string, { start: number; end: number }>
): { start: number; end: number } | null {
  const children = childrenMap.get(taskId) ?? [];
  if (children.length === 0) {
    return null;
  }

  let minStart = Infinity;
  let maxEnd = -Infinity;

  for (const child of children) {
    const childTs = taskTimestamps.get(child.id);
    if (childTs) {
      minStart = Math.min(minStart, childTs.start);
      maxEnd = Math.max(maxEnd, childTs.end);
    }

    // Recursively check grandchildren
    const descendantRange = calculateDescendantDateRange(child.id, childrenMap, taskTimestamps);
    if (descendantRange) {
      minStart = Math.min(minStart, descendantRange.start);
      maxEnd = Math.max(maxEnd, descendantRange.end);
    }
  }

  if (minStart === Infinity || maxEnd === -Infinity) {
    return null;
  }

  return { start: minStart, end: maxEnd };
}

/**
 * Normalize tasks: convert dates to timestamps and compute hierarchy info
 */
export function normalizeTasks(tasks: Task[], options: NormalizeTasksOptions = {}): NormalizedTask[] {
  if (tasks.length === 0) {
    return [];
  }

  const { syncParentDates = false } = options;

  const taskMap = new Map<string, Task>();
  for (const task of tasks) {
    taskMap.set(task.id, task);
  }

  const childrenMap = buildChildrenMap(tasks);
  const collapsedIds = getCollapsedAncestors(tasks);
  const depthCache = new Map<string, number>();

  // Pre-calculate timestamps for all tasks (needed for parent sync)
  const taskTimestamps = new Map<string, { start: number; end: number }>();
  for (const task of tasks) {
    taskTimestamps.set(task.id, {
      start: toTimestamp(task.start),
      end: toTimestamp(task.end),
    });
  }

  // If syncParentDates is enabled, update parent timestamps to span children
  if (syncParentDates) {
    // Process from deepest to shallowest to ensure correct parent calculations
    const tasksWithDepth = tasks.map(task => ({
      task,
      depth: calculateDepth(task, taskMap, depthCache),
    }));
    tasksWithDepth.sort((a, b) => b.depth - a.depth);

    // Clear depth cache to recalculate later
    depthCache.clear();

    for (const { task } of tasksWithDepth) {
      const hasChildrenFlag = hasChildren(task.id, childrenMap);
      if (hasChildrenFlag) {
        const descendantRange = calculateDescendantDateRange(task.id, childrenMap, taskTimestamps);
        if (descendantRange) {
          taskTimestamps.set(task.id, descendantRange);
        }
      }
    }
  }

  const normalized: NormalizedTask[] = [];
  let visibleIndex = 0;

  // Process tasks in tree order (depth-first)
  function processTask(task: Task): void {
    const visible = !isHiddenByAncestor(task, taskMap, collapsedIds);
    const depth = calculateDepth(task, taskMap, depthCache);
    const timestamps = taskTimestamps.get(task.id)!;

    const normalizedTask: NormalizedTask = {
      ...task,
      start: timestamps.start,
      end: timestamps.end,
      depth,
      hasChildren: hasChildren(task.id, childrenMap),
      visible,
      visibleIndex: visible ? visibleIndex++ : -1,
    };

    normalized.push(normalizedTask);

    // Process children
    const children = childrenMap.get(task.id) ?? [];
    for (const child of children) {
      processTask(child);
    }
  }

  // Start with root tasks (no parent)
  const rootTasks = childrenMap.get(null) ?? [];
  for (const task of rootTasks) {
    processTask(task);
  }

  return normalized;
}

/**
 * Get only visible tasks (not hidden by collapsed ancestors)
 */
export function getVisibleTasks(normalizedTasks: NormalizedTask[]): NormalizedTask[] {
  return normalizedTasks.filter(task => task.visible);
}

/**
 * Flatten visible tasks for rendering (maintains visible order)
 */
export function flattenVisibleTasks(normalizedTasks: NormalizedTask[]): NormalizedTask[] {
  return getVisibleTasks(normalizedTasks).sort((a, b) => a.visibleIndex - b.visibleIndex);
}

/**
 * Get task by ID from normalized tasks
 */
export function getTaskById(
  tasks: NormalizedTask[],
  id: string
): NormalizedTask | undefined {
  return tasks.find(t => t.id === id);
}

/**
 * Get children of a task
 */
export function getTaskChildren(
  tasks: NormalizedTask[],
  parentId: string
): NormalizedTask[] {
  return tasks.filter(t => t.parentId === parentId);
}

/**
 * Get all descendant IDs of a task (for cascade operations)
 */
export function getDescendantIds(
  tasks: NormalizedTask[],
  taskId: string
): string[] {
  const descendants: string[] = [];
  const directChildren = tasks.filter(t => t.parentId === taskId);

  for (const child of directChildren) {
    descendants.push(child.id);
    descendants.push(...getDescendantIds(tasks, child.id));
  }

  return descendants;
}

/**
 * Calculate the date range covered by tasks and their children
 */
export function getTaskDateRange(
  tasks: NormalizedTask[],
  taskId: string
): { start: number; end: number } | null {
  const task = getTaskById(tasks, taskId);
  if (!task) return null;

  if (!task.hasChildren) {
    return { start: task.start, end: task.end };
  }

  const descendants = [task, ...tasks.filter(t => getDescendantIds(tasks, taskId).includes(t.id))];
  const starts = descendants.map(t => t.start);
  const ends = descendants.map(t => t.end);

  return {
    start: Math.min(...starts),
    end: Math.max(...ends),
  };
}
