import { describe, it, expect } from 'vitest';
import {
  normalizeTasks,
  getVisibleTasks,
  flattenVisibleTasks,
  getTaskById,
  getTaskChildren,
  getDescendantIds,
  getTaskDateRange,
} from '../../src/utils/tree';
import type { Task } from '../../src/types';

describe('tree utilities', () => {
  const baseTasks: Task[] = [
    { id: '1', title: 'Parent', start: 1000, end: 5000, type: 'group' },
    { id: '2', title: 'Child 1', start: 1000, end: 2000, parentId: '1' },
    { id: '3', title: 'Child 2', start: 2000, end: 3000, parentId: '1' },
    { id: '4', title: 'Grandchild', start: 1500, end: 2500, parentId: '2' },
    { id: '5', title: 'Root Task', start: 3000, end: 4000 },
  ];

  describe('normalizeTasks', () => {
    it('should return empty array for empty input', () => {
      const result = normalizeTasks([]);
      expect(result).toEqual([]);
    });

    it('should convert Date objects to timestamps', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task',
          start: new Date('2024-01-01'),
          end: new Date('2024-01-10'),
        },
      ];
      const result = normalizeTasks(tasks);

      expect(typeof result[0].start).toBe('number');
      expect(typeof result[0].end).toBe('number');
    });

    it('should calculate correct depth for root tasks', () => {
      const result = normalizeTasks(baseTasks);
      const rootTask = result.find((t) => t.id === '1');
      const otherRoot = result.find((t) => t.id === '5');

      expect(rootTask?.depth).toBe(0);
      expect(otherRoot?.depth).toBe(0);
    });

    it('should calculate correct depth for children', () => {
      const result = normalizeTasks(baseTasks);
      const child1 = result.find((t) => t.id === '2');
      const child2 = result.find((t) => t.id === '3');
      const grandchild = result.find((t) => t.id === '4');

      expect(child1?.depth).toBe(1);
      expect(child2?.depth).toBe(1);
      expect(grandchild?.depth).toBe(2);
    });

    it('should set hasChildren correctly', () => {
      const result = normalizeTasks(baseTasks);
      const parent = result.find((t) => t.id === '1');
      const child1 = result.find((t) => t.id === '2');
      const child2 = result.find((t) => t.id === '3');
      const grandchild = result.find((t) => t.id === '4');
      const rootTask = result.find((t) => t.id === '5');

      expect(parent?.hasChildren).toBe(true);
      expect(child1?.hasChildren).toBe(true); // has grandchild
      expect(child2?.hasChildren).toBe(false);
      expect(grandchild?.hasChildren).toBe(false);
      expect(rootTask?.hasChildren).toBe(false);
    });

    it('should mark all tasks as visible when no collapsed', () => {
      const result = normalizeTasks(baseTasks);
      expect(result.every((t) => t.visible)).toBe(true);
    });

    it('should hide children of collapsed groups', () => {
      const tasksWithCollapsed: Task[] = [
        { id: '1', title: 'Parent', start: 1000, end: 5000, type: 'group', collapsed: true },
        { id: '2', title: 'Child 1', start: 1000, end: 2000, parentId: '1' },
        { id: '3', title: 'Child 2', start: 2000, end: 3000, parentId: '1' },
      ];
      const result = normalizeTasks(tasksWithCollapsed);

      const parent = result.find((t) => t.id === '1');
      const child1 = result.find((t) => t.id === '2');
      const child2 = result.find((t) => t.id === '3');

      expect(parent?.visible).toBe(true);
      expect(child1?.visible).toBe(false);
      expect(child2?.visible).toBe(false);
    });

    it('should hide grandchildren when parent is collapsed', () => {
      const tasksWithCollapsed: Task[] = [
        { id: '1', title: 'Parent', start: 1000, end: 5000, type: 'group', collapsed: true },
        { id: '2', title: 'Child', start: 1000, end: 2000, parentId: '1', type: 'group' },
        { id: '3', title: 'Grandchild', start: 1000, end: 1500, parentId: '2' },
      ];
      const result = normalizeTasks(tasksWithCollapsed);

      expect(result.find((t) => t.id === '3')?.visible).toBe(false);
    });

    it('should assign correct visibleIndex', () => {
      const result = normalizeTasks(baseTasks);
      const visibleTasks = result.filter((t) => t.visible);

      visibleTasks.forEach((task, index) => {
        expect(task.visibleIndex).toBe(index);
      });
    });

    it('should sync parent dates when syncParentDates is true', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Parent', start: 1000, end: 2000, type: 'group' },
        { id: '2', title: 'Child 1', start: 500, end: 1500, parentId: '1' },
        { id: '3', title: 'Child 2', start: 1500, end: 3000, parentId: '1' },
      ];
      const result = normalizeTasks(tasks, { syncParentDates: true });
      const parent = result.find((t) => t.id === '1');

      expect(parent?.start).toBe(500); // min of children
      expect(parent?.end).toBe(3000); // max of children
    });
  });

  describe('getVisibleTasks', () => {
    it('should return only visible tasks', () => {
      const tasksWithCollapsed: Task[] = [
        { id: '1', title: 'Parent', start: 1000, end: 5000, type: 'group', collapsed: true },
        { id: '2', title: 'Child 1', start: 1000, end: 2000, parentId: '1' },
        { id: '3', title: 'Root Task', start: 3000, end: 4000 },
      ];
      const normalized = normalizeTasks(tasksWithCollapsed);
      const visible = getVisibleTasks(normalized);

      expect(visible.length).toBe(2);
      expect(visible.map((t) => t.id)).toContain('1');
      expect(visible.map((t) => t.id)).toContain('3');
      expect(visible.map((t) => t.id)).not.toContain('2');
    });
  });

  describe('flattenVisibleTasks', () => {
    it('should return visible tasks sorted by visibleIndex', () => {
      const normalized = normalizeTasks(baseTasks);
      const flattened = flattenVisibleTasks(normalized);

      for (let i = 1; i < flattened.length; i++) {
        expect(flattened[i].visibleIndex).toBeGreaterThan(flattened[i - 1].visibleIndex);
      }
    });

    it('should exclude hidden tasks', () => {
      const tasksWithCollapsed: Task[] = [
        { id: '1', title: 'Parent', start: 1000, end: 5000, type: 'group', collapsed: true },
        { id: '2', title: 'Child', start: 1000, end: 2000, parentId: '1' },
      ];
      const normalized = normalizeTasks(tasksWithCollapsed);
      const flattened = flattenVisibleTasks(normalized);

      expect(flattened.length).toBe(1);
      expect(flattened[0].id).toBe('1');
    });
  });

  describe('getTaskById', () => {
    it('should find task by id', () => {
      const normalized = normalizeTasks(baseTasks);
      const task = getTaskById(normalized, '3');

      expect(task).toBeDefined();
      expect(task?.title).toBe('Child 2');
    });

    it('should return undefined for non-existent id', () => {
      const normalized = normalizeTasks(baseTasks);
      const task = getTaskById(normalized, 'non-existent');

      expect(task).toBeUndefined();
    });
  });

  describe('getTaskChildren', () => {
    it('should return direct children only', () => {
      const normalized = normalizeTasks(baseTasks);
      const children = getTaskChildren(normalized, '1');

      expect(children.length).toBe(2);
      expect(children.map((t) => t.id)).toContain('2');
      expect(children.map((t) => t.id)).toContain('3');
      expect(children.map((t) => t.id)).not.toContain('4'); // grandchild
    });

    it('should return empty array for task with no children', () => {
      const normalized = normalizeTasks(baseTasks);
      const children = getTaskChildren(normalized, '5');

      expect(children).toEqual([]);
    });
  });

  describe('getDescendantIds', () => {
    it('should return all descendants recursively', () => {
      const normalized = normalizeTasks(baseTasks);
      const descendants = getDescendantIds(normalized, '1');

      expect(descendants).toContain('2');
      expect(descendants).toContain('3');
      expect(descendants).toContain('4'); // grandchild
      expect(descendants.length).toBe(3);
    });

    it('should return empty array for task with no children', () => {
      const normalized = normalizeTasks(baseTasks);
      const descendants = getDescendantIds(normalized, '5');

      expect(descendants).toEqual([]);
    });

    it('should handle deep nesting', () => {
      const deepTasks: Task[] = [
        { id: '1', title: 'Level 0', start: 1000, end: 5000, type: 'group' },
        { id: '2', title: 'Level 1', start: 1000, end: 4000, parentId: '1', type: 'group' },
        { id: '3', title: 'Level 2', start: 1000, end: 3000, parentId: '2', type: 'group' },
        { id: '4', title: 'Level 3', start: 1000, end: 2000, parentId: '3' },
      ];
      const normalized = normalizeTasks(deepTasks);
      const descendants = getDescendantIds(normalized, '1');

      expect(descendants.length).toBe(3);
      expect(descendants).toContain('2');
      expect(descendants).toContain('3');
      expect(descendants).toContain('4');
    });
  });

  describe('getTaskDateRange', () => {
    it('should return task dates for leaf task', () => {
      const normalized = normalizeTasks(baseTasks);
      const range = getTaskDateRange(normalized, '5');

      expect(range?.start).toBe(3000);
      expect(range?.end).toBe(4000);
    });

    it('should include all descendants for parent task', () => {
      const normalized = normalizeTasks(baseTasks);
      const range = getTaskDateRange(normalized, '1');

      expect(range).toBeDefined();
      // Should span from earliest child to latest child
      expect(range?.start).toBeLessThanOrEqual(1000);
      expect(range?.end).toBeGreaterThanOrEqual(3000);
    });

    it('should return null for non-existent task', () => {
      const normalized = normalizeTasks(baseTasks);
      const range = getTaskDateRange(normalized, 'non-existent');

      expect(range).toBeNull();
    });
  });
});
