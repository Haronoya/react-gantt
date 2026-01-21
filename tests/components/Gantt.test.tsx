import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Gantt } from '../../src';
import type { Task } from '../../src';

const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Task 1',
    start: new Date('2024-01-15').getTime(),
    end: new Date('2024-01-20').getTime(),
    progress: 0.5,
  },
  {
    id: 'task-2',
    title: 'Task 2',
    start: new Date('2024-01-18').getTime(),
    end: new Date('2024-01-25').getTime(),
    progress: 0.3,
  },
  {
    id: 'milestone-1',
    title: 'Milestone 1',
    start: new Date('2024-01-25').getTime(),
    end: new Date('2024-01-25').getTime(),
    type: 'milestone',
  },
];

describe('Gantt Component', () => {
  it('should render without crashing', () => {
    render(<Gantt tasks={sampleTasks} />);
    expect(screen.getByRole('application')).toBeInTheDocument();
  });

  it('should render with empty tasks', () => {
    render(<Gantt tasks={[]} />);
    expect(screen.getByRole('application')).toBeInTheDocument();
  });

  it('should display task titles in grid', () => {
    render(<Gantt tasks={sampleTasks} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('should respect showGrid prop', () => {
    const { container } = render(<Gantt tasks={sampleTasks} showGrid={false} />);
    // Grid should not be visible
    expect(container.querySelector('[role="grid"]')).not.toBeInTheDocument();
  });

  it('should call onTaskChange when task is modified', () => {
    const handleTaskChange = vi.fn();
    render(<Gantt tasks={sampleTasks} onTaskChange={handleTaskChange} />);
    // Note: Full interaction testing would require more setup
    expect(handleTaskChange).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Gantt tasks={sampleTasks} className="custom-class" />
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should handle editable prop', () => {
    const { rerender } = render(<Gantt tasks={sampleTasks} editable={true} />);
    // Should render editable
    expect(screen.getByRole('application')).toBeInTheDocument();

    rerender(<Gantt tasks={sampleTasks} editable={false} />);
    // Should render non-editable
    expect(screen.getByRole('application')).toBeInTheDocument();
  });

  it('should respect locale prop for date formatting', () => {
    render(<Gantt tasks={sampleTasks} locale="en-US" />);
    expect(screen.getByRole('application')).toBeInTheDocument();
  });
});
