import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Gantt } from '../../src';
import type { Task } from '../../src';

function getBar(container: HTMLElement, id: string): HTMLElement {
  const bar = container.querySelector(`[role="button"][data-task-id="${id}"]`);
  if (!bar) throw new Error(`task bar ${id} not rendered`);
  return bar as HTMLElement;
}

function getLabel(bar: HTMLElement): HTMLElement {
  const label = bar.querySelector('span');
  if (!label) throw new Error('label not rendered');
  return label as HTMLElement;
}

describe('TaskBar label visibility', () => {
  const view = {
    zoom: 'day' as const,
    start: new Date(2024, 7, 17).getTime(),
    end: new Date(2024, 7, 31).getTime(),
  };

  it('shifts the label into view when the bar starts before the view start', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Long task',
        start: new Date(2024, 7, 1).getTime(),
        end: new Date(2024, 7, 31).getTime(),
      },
    ];
    const { container } = render(<Gantt tasks={tasks} view={view} />);
    const bar = getBar(container, 'task-1');
    const left = parseFloat(bar.style.left);
    expect(left).toBeLessThan(0);
    expect(getLabel(bar).style.marginLeft).toBe(`${-left}px`);
  });

  it('shifts the group label into view when the group starts before the view start', () => {
    const tasks: Task[] = [
      {
        id: 'group-1',
        title: 'Group',
        type: 'group',
        start: new Date(2024, 7, 1).getTime(),
        end: new Date(2024, 7, 31).getTime(),
      },
      {
        id: 'task-1',
        title: 'Child',
        parentId: 'group-1',
        start: new Date(2024, 7, 1).getTime(),
        end: new Date(2024, 7, 31).getTime(),
      },
    ];
    const { container } = render(<Gantt tasks={tasks} view={view} />);
    const bar = getBar(container, 'group-1');
    const left = parseFloat(bar.style.left);
    expect(left).toBeLessThan(0);
    expect(getLabel(bar).style.marginLeft).toBe(`${-left}px`);
  });

  it('does not shift the label when the bar starts inside the view', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Short task',
        start: new Date(2024, 7, 20).getTime(),
        end: new Date(2024, 7, 25).getTime(),
      },
    ];
    const { container } = render(<Gantt tasks={tasks} view={view} />);
    const bar = getBar(container, 'task-1');
    expect(parseFloat(bar.style.left)).toBeGreaterThanOrEqual(0);
    expect(getLabel(bar).style.marginLeft).toBe('');
  });
});
