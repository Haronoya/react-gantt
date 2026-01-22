'use client';

import { useMemo, useState, useCallback } from 'react';
import type { Resource, ResourceRowData } from '../types/resource';
import type { NormalizedTask } from '../types/task';

export interface UseResourceLayoutOptions {
  /** Group resources by this field */
  groupBy?: string;
  /** Show resources with no assigned tasks */
  showEmptyResources?: boolean;
  /** Initial collapsed state for groups */
  defaultCollapsed?: boolean;
}

export interface UseResourceLayoutResult {
  /** Rows to render (resources and group headers) */
  rows: ResourceRowData[];
  /** Get tasks for a specific resource */
  getTasksForResource: (resourceId: string) => NormalizedTask[];
  /** Total height based on visible rows */
  visibleRowCount: number;
  /** Toggle group collapsed state */
  toggleGroup: (groupName: string) => void;
  /** Collapsed groups */
  collapsedGroups: Set<string>;
  /** Task ID to row index mapping */
  taskRowMap: Map<string, number>;
}

/**
 * Hook to manage resource-based layout for Gantt chart
 */
export function useResourceLayout(
  resources: Resource[],
  tasks: NormalizedTask[],
  options: UseResourceLayoutOptions = {}
): UseResourceLayoutResult {
  const {
    groupBy,
    showEmptyResources = true,
    defaultCollapsed = false,
  } = options;

  // Track collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    if (!defaultCollapsed || !groupBy) return new Set();
    const groups = new Set<string>();
    resources.forEach((r) => {
      const groupValue = r[groupBy as keyof Resource] as string | undefined;
      if (groupValue) groups.add(groupValue);
    });
    return groups;
  });

  // Toggle group collapsed state
  const toggleGroup = useCallback((groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  }, []);

  // Build task-to-resource mapping
  const tasksByResource = useMemo(() => {
    const map = new Map<string, NormalizedTask[]>();
    tasks.forEach((task) => {
      if (task.resourceId) {
        const existing = map.get(task.resourceId) || [];
        existing.push(task);
        map.set(task.resourceId, existing);
      }
    });
    return map;
  }, [tasks]);

  // Get tasks for a specific resource
  const getTasksForResource = useCallback(
    (resourceId: string): NormalizedTask[] => {
      return tasksByResource.get(resourceId) || [];
    },
    [tasksByResource]
  );

  // Build rows for rendering
  const rows = useMemo(() => {
    const result: ResourceRowData[] = [];

    // Filter resources based on showEmptyResources
    const filteredResources = showEmptyResources
      ? resources
      : resources.filter((r) => tasksByResource.has(r.id));

    if (groupBy) {
      // Group resources by the specified field
      const groups = new Map<string, Resource[]>();
      const ungrouped: Resource[] = [];

      filteredResources.forEach((resource) => {
        const groupValue = resource[groupBy as keyof Resource] as string | undefined;
        if (groupValue) {
          const existing = groups.get(groupValue) || [];
          existing.push(resource);
          groups.set(groupValue, existing);
        } else {
          ungrouped.push(resource);
        }
      });

      // Add grouped resources
      groups.forEach((groupResources, groupName) => {
        const isCollapsed = collapsedGroups.has(groupName);

        // Calculate group period (min start, max end of all tasks in this group)
        let groupStart: number | undefined;
        let groupEnd: number | undefined;
        groupResources.forEach((resource) => {
          const resourceTasks = tasksByResource.get(resource.id) || [];
          resourceTasks.forEach((task) => {
            if (groupStart === undefined || task.start < groupStart) {
              groupStart = task.start;
            }
            if (groupEnd === undefined || task.end > groupEnd) {
              groupEnd = task.end;
            }
          });
        });

        // Add group header
        result.push({
          resource: null,
          tasks: [],
          isGroupHeader: true,
          groupName,
          depth: 0,
          visible: true,
          groupStart,
          groupEnd,
        });

        // Add resources in group
        if (!isCollapsed) {
          groupResources.forEach((resource) => {
            const resourceTasks = tasksByResource.get(resource.id) || [];
            result.push({
              resource,
              tasks: resourceTasks.map((t) => t.id),
              isGroupHeader: false,
              depth: 1,
              visible: true,
            });
          });
        }
      });

      // Add ungrouped resources
      ungrouped.forEach((resource) => {
        const resourceTasks = tasksByResource.get(resource.id) || [];
        result.push({
          resource,
          tasks: resourceTasks.map((t) => t.id),
          isGroupHeader: false,
          depth: 0,
          visible: true,
        });
      });
    } else {
      // No grouping - flat list
      filteredResources.forEach((resource) => {
        const resourceTasks = tasksByResource.get(resource.id) || [];
        result.push({
          resource,
          tasks: resourceTasks.map((t) => t.id),
          isGroupHeader: false,
          depth: 0,
          visible: true,
        });
      });
    }

    return result;
  }, [resources, tasksByResource, groupBy, showEmptyResources, collapsedGroups]);

  // Build task ID to row index mapping
  const taskRowMap = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row, index) => {
      if (!row.isGroupHeader && row.resource) {
        row.tasks.forEach((taskId) => {
          map.set(taskId, index);
        });
      }
    });
    return map;
  }, [rows]);

  // Count visible rows
  const visibleRowCount = useMemo(() => {
    return rows.filter((r) => r.visible).length;
  }, [rows]);

  return {
    rows,
    getTasksForResource,
    visibleRowCount,
    toggleGroup,
    collapsedGroups,
    taskRowMap,
  };
}
