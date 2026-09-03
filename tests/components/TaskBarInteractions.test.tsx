import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Gantt } from '../../src';
import type { Task } from '../../src';

const DAY = 24 * 60 * 60 * 1000;

function makeTasks(progress?: number): Task[] {
  return [
    {
      id: 'task-1',
      title: 'Task 1',
      start: new Date(2024, 0, 15).getTime(),
      end: new Date(2024, 0, 20).getTime(),
      ...(progress === undefined ? {} : { progress }),
    },
  ];
}

function getBar(container: HTMLElement): HTMLElement {
  const bar = container.querySelector('[role="button"][data-task-id="task-1"]');
  if (!bar) throw new Error('task bar not rendered');
  return bar as HTMLElement;
}

describe('TaskBar interactions', () => {
  it('fires onTaskClick for a plain click (no drag)', () => {
    const onTaskClick = vi.fn();
    const { container } = render(
      <Gantt tasks={makeTasks()} editable onTaskClick={onTaskClick} />
    );
    const bar = getBar(container);
    fireEvent.mouseDown(bar, { button: 0, clientX: 100, clientY: 10 });
    fireEvent.mouseUp(document, { clientX: 100, clientY: 10 });
    fireEvent.click(bar);
    expect(onTaskClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onTaskClick for the click that follows a drag', () => {
    const onTaskClick = vi.fn();
    const onTaskChange = vi.fn();
    const { container } = render(
      <Gantt
        tasks={makeTasks()}
        editable
        onTaskClick={onTaskClick}
        onTaskChange={onTaskChange}
        view={{ zoom: 'day' }}
      />
    );
    const bar = getBar(container);
    fireEvent.mouseDown(bar, { button: 0, clientX: 100, clientY: 10 });
    fireEvent.mouseMove(document, { clientX: 200, clientY: 10 });
    fireEvent.mouseUp(document, { clientX: 200, clientY: 10 });
    // The browser dispatches click on the bar after mouseup
    fireEvent.click(bar);

    expect(onTaskChange).toHaveBeenCalledTimes(1);
    expect(onTaskChange.mock.calls[0][0].changes.start).toBe(new Date(2024, 0, 17).getTime());
    expect(onTaskClick).not.toHaveBeenCalled();
  });

  it('does not swallow a later, unrelated click', async () => {
    const onTaskClick = vi.fn();
    const { container } = render(
      <Gantt tasks={makeTasks()} editable onTaskClick={onTaskClick} view={{ zoom: 'day' }} />
    );
    const bar = getBar(container);
    fireEvent.mouseDown(bar, { button: 0, clientX: 100, clientY: 10 });
    fireEvent.mouseMove(document, { clientX: 200, clientY: 10 });
    fireEvent.mouseUp(document, { clientX: 200, clientY: 10 });
    // No click followed the drop (e.g. mouseup outside the window); the guard must expire
    await new Promise((resolve) => setTimeout(resolve, 0));
    fireEvent.click(bar);
    expect(onTaskClick).toHaveBeenCalledTimes(1);
  });

  it('renders the progress handle only when the task has a progress value', () => {
    const withProgress = render(<Gantt tasks={makeTasks(0.5)} editable />);
    expect(
      withProgress.container.querySelector('[class*="progressHandle"]')
    ).toBeInTheDocument();
    withProgress.unmount();

    const withoutProgress = render(<Gantt tasks={makeTasks()} editable />);
    expect(
      withoutProgress.container.querySelector('[class*="progressHandle"]')
    ).not.toBeInTheDocument();
    // Resize handles stay available
    expect(
      withoutProgress.container.querySelectorAll('[class*="resizeHandle"]').length
    ).toBeGreaterThanOrEqual(2);
  });

  it('applies the day snap in local time when resizing the end', () => {
    const onTaskChange = vi.fn();
    const { container } = render(
      <Gantt tasks={makeTasks()} editable onTaskChange={onTaskChange} view={{ zoom: 'day' }} />
    );
    const bar = getBar(container);
    const rightHandle = bar.querySelector('[class*="resizeHandleRight"]') as HTMLElement;
    fireEvent.mouseDown(rightHandle, { button: 0, clientX: 100, clientY: 10 });
    // day zoom = 50px/day → +50px = +1 day exactly
    fireEvent.mouseMove(document, { clientX: 150, clientY: 10 });
    fireEvent.mouseUp(document, { clientX: 150, clientY: 10 });
    expect(onTaskChange).toHaveBeenCalledTimes(1);
    const patch = onTaskChange.mock.calls[0][0];
    expect(patch.changes.end).toBe(new Date(2024, 0, 21).getTime());
    expect(patch.changes.start).toBeUndefined();
    expect(patch.changes.progress).toBeUndefined();
    void DAY;
  });
});
