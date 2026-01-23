import type { Task, ColumnDef, TaskSegment, Resource } from '../src';

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

// Color palette for task bars
const TASK_COLORS = [
  '#42a5f5', // Blue (default)
  '#66bb6a', // Green
  '#ffa726', // Orange
  '#ef5350', // Red
  '#ab47bc', // Purple
  '#26c6da', // Cyan
  '#ec407a', // Pink
  '#8d6e63', // Brown
];

/**
 * Generate sample tasks for demo
 */
export function generateTasks(count: number): Task[] {
  const tasks: Task[] = [];
  const now = Date.now();
  const startDate = now - 30 * MS_PER_DAY; // 30 days ago

  // Generate groups and tasks
  const numGroups = Math.ceil(count / 10);

  for (let g = 0; g < numGroups; g++) {
    const groupId = `group-${g}`;
    const groupStart = startDate + g * 7 * MS_PER_DAY;

    // Add group
    tasks.push({
      id: groupId,
      title: `プロジェクト ${g + 1}`,
      start: groupStart,
      end: groupStart + 30 * MS_PER_DAY,
      type: 'group',
      progress: Math.random() * 0.5 + 0.3,
      // グループ行のスタイル（左側グリッド用）
      rowStyle: {
        backgroundColor: '#e3f2fd',
        fontWeight: 600,
      },
    });

    // Add tasks within group
    const tasksInGroup = Math.min(9, count - tasks.length);
    for (let t = 0; t < tasksInGroup && tasks.length < count; t++) {
      const taskStart = groupStart + t * 2 * MS_PER_DAY + Math.random() * 3 * MS_PER_DAY;
      const taskDuration = (3 + Math.random() * 7) * MS_PER_DAY;

      const color = TASK_COLORS[(g + t) % TASK_COLORS.length];
      if (t === tasksInGroup - 1 && Math.random() > 0.7) {
        // Milestone
        tasks.push({
          id: `task-${g}-${t}`,
          title: `マイルストーン ${g + 1}-${t + 1}`,
          start: taskStart + taskDuration,
          end: taskStart + taskDuration,
          type: 'milestone',
          parentId: groupId,
          style: { color },
        });
      } else {
        // Regular task
        // Add deadline to some tasks (every 3rd task with a 70% chance of being overdue)
        const hasDeadline = t % 3 === 0;
        const isOverdue = Math.random() > 0.3;
        const deadline = hasDeadline
          ? taskStart + taskDuration + (isOverdue ? -MS_PER_DAY : MS_PER_DAY * 2)
          : undefined;

        // Add segments to every 4th task
        const hasSegments = t % 4 === 1;
        let segments: TaskSegment[] | undefined;

        if (hasSegments) {
          const setupDuration = taskDuration * 0.15;
          const workDuration = taskDuration * 0.7;
          const bufferDuration = taskDuration * 0.15;

          segments = [
            {
              id: `seg-${g}-${t}-setup`,
              duration: setupDuration,
              color: '#78909c',
              label: '準備',
              type: 'setup',
              pattern: 'striped',
            },
            {
              id: `seg-${g}-${t}-work`,
              duration: workDuration,
              color: color,
              label: '作業',
              type: 'work',
              pattern: 'solid',
            },
            {
              id: `seg-${g}-${t}-buffer`,
              duration: bufferDuration,
              color: '#90a4ae',
              label: 'バッファ',
              type: 'buffer',
              pattern: 'dotted',
            },
          ];
        }

        // Assign groupId for related task highlighting (tasks in same group are related)
        // Create 2-3 groups per project
        const taskGroupId = t < 3 ? `${groupId}-phase1` : t < 6 ? `${groupId}-phase2` : `${groupId}-phase3`;

        tasks.push({
          id: `task-${g}-${t}`,
          title: `タスク ${g + 1}-${t + 1}`,
          start: taskStart,
          end: taskStart + taskDuration,
          type: 'task',
          parentId: groupId,
          progress: Math.random(),
          style: { color, progressColor: '#1565c0' },
          deadline,
          segments,
          groupId: taskGroupId,
        });
      }
    }
  }

  return tasks;
}

/**
 * Generate a large number of tasks for performance testing
 */
export function generateLargeTasks(count: number = 10000): Task[] {
  const tasks: Task[] = [];
  const now = Date.now();
  const startDate = now - 365 * MS_PER_DAY; // 1 year ago

  for (let i = 0; i < count; i++) {
    const taskStart = startDate + (i % 365) * MS_PER_DAY + Math.random() * MS_PER_DAY;
    const taskDuration = (1 + Math.random() * 14) * MS_PER_DAY;

    tasks.push({
      id: `task-${i}`,
      title: `タスク ${i + 1}`,
      start: taskStart,
      end: taskStart + taskDuration,
      type: i % 50 === 0 ? 'milestone' : 'task',
      progress: Math.random(),
    });
  }

  return tasks;
}

/**
 * Format date with optional time
 */
function formatDateTimeGrid(timestamp: number, includeTime = false): string {
  const date = new Date(timestamp);
  const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
  if (!includeTime) return dateStr;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}`;
}

/**
 * Sample column definitions
 */
export const sampleColumns: ColumnDef[] = [
  {
    id: 'title',
    title: 'タスク名',
    width: 200,
    minWidth: 100,
    maxWidth: 400,
    accessor: 'title',
    resizable: true,
    align: 'left',
    headerStyle: {
      backgroundColor: '#1976d2',
      color: '#ffffff',
      fontWeight: 'bold',
    },
  },
  {
    id: 'start',
    title: '開始日時',
    width: 130,
    minWidth: 80,
    maxWidth: 200,
    resizable: true,
    accessor: (task) => formatDateTimeGrid(task.start, true),
    align: 'center',
    headerStyle: {
      backgroundColor: '#2196f3',
      color: '#ffffff',
    },
  },
  {
    id: 'end',
    title: '終了日時',
    width: 130,
    minWidth: 80,
    maxWidth: 200,
    resizable: true,
    accessor: (task) => formatDateTimeGrid(task.end, true),
    align: 'center',
    headerStyle: {
      backgroundColor: '#2196f3',
      color: '#ffffff',
    },
  },
  {
    id: 'progress',
    title: '進捗',
    width: 80,
    minWidth: 60,
    maxWidth: 120,
    resizable: true,
    accessor: (task) => {
      const progress = task.progress ?? 0;
      return `${Math.round(progress * 100)}%`;
    },
    align: 'right',
    headerStyle: {
      backgroundColor: '#4caf50',
      color: '#ffffff',
      fontWeight: 600,
    },
  },
];

/**
 * Generate sample tasks with hours for hour-view demo
 */
export function generateHourlyTasks(count: number = 20): Task[] {
  const tasks: Task[] = [];
  const now = new Date();
  // Start from today at 8:00
  now.setHours(8, 0, 0, 0);
  const startDate = now.getTime();

  for (let i = 0; i < count; i++) {
    const dayOffset = Math.floor(i / 5); // 5 tasks per day
    const hourOffset = (i % 5) * 2; // 2 hour intervals
    const taskStart = startDate + dayOffset * MS_PER_DAY + hourOffset * MS_PER_HOUR;
    const taskDuration = (1 + Math.random() * 3) * MS_PER_HOUR; // 1-4 hours

    const color = TASK_COLORS[i % TASK_COLORS.length];
    tasks.push({
      id: `hourly-task-${i}`,
      title: `会議 ${i + 1}`,
      start: taskStart,
      end: taskStart + taskDuration,
      type: i % 10 === 0 ? 'milestone' : 'task',
      progress: Math.random(),
      style: { color },
    });
  }

  return tasks;
}

/**
 * Sample column definitions for hourly view
 */
export const hourlyColumns: ColumnDef[] = [
  {
    id: 'title',
    title: 'タスク名',
    width: 200,
    minWidth: 100,
    accessor: 'title',
    resizable: true,
    align: 'left',
  },
  {
    id: 'start',
    title: '開始',
    width: 120,
    accessor: (task) => {
      const date = new Date(task.start);
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    align: 'center',
  },
  {
    id: 'end',
    title: '終了',
    width: 120,
    accessor: (task) => {
      const date = new Date(task.end);
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    align: 'center',
  },
  {
    id: 'duration',
    title: '時間',
    width: 80,
    accessor: (task) => {
      const durationMs = task.end - task.start;
      const hours = Math.floor(durationMs / MS_PER_HOUR);
      const minutes = Math.floor((durationMs % MS_PER_HOUR) / 60000);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    },
    align: 'right',
  },
];

/**
 * Sample tasks for basic demo
 */
export const sampleTasks: Task[] = generateTasks(30);

/**
 * Sample hourly tasks for hour-view demo
 */
export const hourlyTasks: Task[] = generateHourlyTasks(20);

/**
 * Sample resources for resource mode demo
 */
export const sampleResources: Resource[] = [
  { id: 'res-1', name: '田中太郎', group: '開発チーム', capacity: 1 },
  { id: 'res-2', name: '鈴木花子', group: '開発チーム', capacity: 1 },
  { id: 'res-3', name: '佐藤次郎', group: '開発チーム', capacity: 1 },
  { id: 'res-4', name: '山田三郎', group: 'デザインチーム', capacity: 1 },
  { id: 'res-5', name: '高橋四郎', group: 'デザインチーム', capacity: 1 },
  { id: 'res-6', name: '伊藤五郎', group: 'QAチーム', capacity: 1 },
  { id: 'res-7', name: '渡辺六郎', group: 'QAチーム', capacity: 1 },
];

/**
 * Generate tasks with resource assignments for resource mode demo
 * Includes overlapping tasks to demonstrate stacking
 */
export function generateResourceTasks(): Task[] {
  const tasks: Task[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const startDate = now.getTime();

  // Tasks for 田中太郎 (res-1) - with overlapping tasks
  tasks.push({
    id: 'rt-1',
    title: 'API設計',
    start: startDate,
    end: startDate + 3 * MS_PER_DAY,
    resourceId: 'res-1',
    progress: 0.8,
    style: { color: TASK_COLORS[0] },
  });
  tasks.push({
    id: 'rt-2',
    title: 'バックエンド実装',
    start: startDate + 2 * MS_PER_DAY, // Overlaps with rt-1
    end: startDate + 6 * MS_PER_DAY,
    resourceId: 'res-1',
    progress: 0.4,
    style: { color: TASK_COLORS[1] },
  });
  tasks.push({
    id: 'rt-3',
    title: 'ユニットテスト作成',
    start: startDate + 4 * MS_PER_DAY, // Overlaps with rt-2
    end: startDate + 8 * MS_PER_DAY,
    resourceId: 'res-1',
    progress: 0.2,
    style: { color: TASK_COLORS[2] },
  });

  // Tasks for 鈴木花子 (res-2)
  tasks.push({
    id: 'rt-4',
    title: 'フロントエンド設計',
    start: startDate + 1 * MS_PER_DAY,
    end: startDate + 4 * MS_PER_DAY,
    resourceId: 'res-2',
    progress: 0.9,
    style: { color: TASK_COLORS[3] },
  });
  tasks.push({
    id: 'rt-5',
    title: 'React実装',
    start: startDate + 3 * MS_PER_DAY, // Overlaps with rt-4
    end: startDate + 9 * MS_PER_DAY,
    resourceId: 'res-2',
    progress: 0.5,
    style: { color: TASK_COLORS[4] },
  });

  // Tasks for 佐藤次郎 (res-3)
  tasks.push({
    id: 'rt-6',
    title: 'DB設計',
    start: startDate,
    end: startDate + 2 * MS_PER_DAY,
    resourceId: 'res-3',
    progress: 1.0,
    style: { color: TASK_COLORS[5] },
  });
  tasks.push({
    id: 'rt-7',
    title: 'マイグレーション',
    start: startDate + 2 * MS_PER_DAY,
    end: startDate + 4 * MS_PER_DAY,
    resourceId: 'res-3',
    progress: 0.7,
    style: { color: TASK_COLORS[6] },
  });

  // Tasks for 山田三郎 (res-4) - デザインチーム with overlapping
  tasks.push({
    id: 'rt-8',
    title: 'UIデザイン',
    start: startDate,
    end: startDate + 5 * MS_PER_DAY,
    resourceId: 'res-4',
    progress: 0.6,
    style: { color: TASK_COLORS[7] },
  });
  tasks.push({
    id: 'rt-9',
    title: 'アイコン作成',
    start: startDate + 2 * MS_PER_DAY, // Overlaps with rt-8
    end: startDate + 4 * MS_PER_DAY,
    resourceId: 'res-4',
    progress: 0.3,
    style: { color: TASK_COLORS[0] },
  });
  tasks.push({
    id: 'rt-10',
    title: 'プロトタイプ',
    start: startDate + 3 * MS_PER_DAY, // Overlaps with rt-8 and rt-9
    end: startDate + 7 * MS_PER_DAY,
    resourceId: 'res-4',
    progress: 0.1,
    style: { color: TASK_COLORS[1] },
  });

  // Tasks for 高橋四郎 (res-5)
  tasks.push({
    id: 'rt-11',
    title: 'グラフィック作成',
    start: startDate + 1 * MS_PER_DAY,
    end: startDate + 6 * MS_PER_DAY,
    resourceId: 'res-5',
    progress: 0.4,
    style: { color: TASK_COLORS[2] },
  });

  // Tasks for 伊藤五郎 (res-6) - QAチーム
  tasks.push({
    id: 'rt-12',
    title: 'テスト計画',
    start: startDate + 4 * MS_PER_DAY,
    end: startDate + 6 * MS_PER_DAY,
    resourceId: 'res-6',
    progress: 0.5,
    style: { color: TASK_COLORS[3] },
  });
  tasks.push({
    id: 'rt-13',
    title: '結合テスト',
    start: startDate + 6 * MS_PER_DAY,
    end: startDate + 10 * MS_PER_DAY,
    resourceId: 'res-6',
    progress: 0.0,
    style: { color: TASK_COLORS[4] },
  });

  // Tasks for 渡辺六郎 (res-7)
  tasks.push({
    id: 'rt-14',
    title: 'パフォーマンステスト',
    start: startDate + 7 * MS_PER_DAY,
    end: startDate + 10 * MS_PER_DAY,
    resourceId: 'res-7',
    progress: 0.0,
    style: { color: TASK_COLORS[5] },
  });

  return tasks;
}

/**
 * Sample resource tasks
 */
export const resourceTasks: Task[] = generateResourceTasks();

/**
 * Column definitions for resource mode
 */
export const resourceColumns: ColumnDef[] = [
  {
    id: 'title',
    title: 'タスク名',
    width: 180,
    minWidth: 100,
    accessor: 'title',
    resizable: true,
    align: 'left',
  },
  {
    id: 'progress',
    title: '進捗',
    width: 70,
    minWidth: 50,
    accessor: (task) => `${Math.round((task.progress ?? 0) * 100)}%`,
    align: 'right',
  },
];
