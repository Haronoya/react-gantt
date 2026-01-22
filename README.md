# @haro/react-gantt

[![npm version](https://img.shields.io/npm/v/@haro/react-gantt.svg)](https://www.npmjs.com/package/@haro/react-gantt)
[![npm downloads](https://img.shields.io/npm/dm/@haro/react-gantt.svg)](https://www.npmjs.com/package/@haro/react-gantt)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@haro/react-gantt)](https://bundlephobia.com/package/@haro/react-gantt)
[![license](https://img.shields.io/npm/l/@haro/react-gantt.svg)](https://github.com/Haronoya/react-gantt/blob/main/LICENSE)

**High-performance React Gantt chart library optimized for 10,000+ tasks.**

A feature-rich, virtualized Gantt chart component for React with TypeScript support. Handles massive datasets smoothly while providing an intuitive drag-and-drop interface.

[日本語ドキュメント](#日本語ドキュメント)

## Why @haro/react-gantt?

- **Built for scale** - Virtual scrolling handles 10,000+ tasks smoothly
- **Resource view** - Display tasks by person/equipment, not just by task
- **Full dependency types** - FS, SS, FF, SF with visual arrows
- **Minimal footprint** - Only 1 runtime dependency (@tanstack/react-virtual)
- **TypeScript-first** - Complete type definitions included
- **Modern React** - Supports React 18 and 19

## Features

- **🚀 High Performance** - Virtual scrolling handles 10,000+ tasks at 60fps
- **📊 Dual View Modes** - Task view and Resource view (who's doing what)
- **🔗 Dependencies** - FS, SS, FF, SF with visual arrows
- **🎯 Drag & Drop** - Move, resize, and reorder tasks
- **📅 Zoom Levels** - Hour, Day, Week, Month
- **🎨 Customizable** - CSS variables, custom renderers, column definitions
- **📦 Lightweight** - Only 1 dependency (@tanstack/react-virtual)
- **💪 TypeScript** - Full type definitions included
- **⚛️ Modern React** - Supports React 18 and 19

## Installation

```bash
npm install @haro/react-gantt
# or
yarn add @haro/react-gantt
# or
pnpm add @haro/react-gantt
```

## Quick Start

```tsx
import { Gantt, type Task } from '@haro/react-gantt';
import '@haro/react-gantt/styles.css';

const tasks: Task[] = [
  {
    id: '1',
    title: 'Planning',
    start: Date.now(),
    end: Date.now() + 7 * 24 * 60 * 60 * 1000,
    progress: 0.5,
  },
  {
    id: '2',
    title: 'Development',
    start: Date.now() + 7 * 24 * 60 * 60 * 1000,
    end: Date.now() + 21 * 24 * 60 * 60 * 1000,
    progress: 0,
  },
  {
    id: '3',
    title: 'Release',
    start: Date.now() + 21 * 24 * 60 * 60 * 1000,
    end: Date.now() + 21 * 24 * 60 * 60 * 1000,
    type: 'milestone',
  },
];

function App() {
  const [taskList, setTaskList] = useState(tasks);

  return (
    <div style={{ height: '500px' }}>
      <Gantt
        tasks={taskList}
        view={{ zoom: 'day' }}
        editable
        onTaskChange={(patch) => {
          setTaskList(prev =>
            prev.map(t => t.id === patch.id ? { ...t, ...patch.changes } : t)
          );
        }}
      />
    </div>
  );
}
```

## Core Concepts

### Task Types

```typescript
interface Task {
  id: string;                              // Unique identifier
  title: string;                           // Display name
  start: number | Date;                    // Start timestamp
  end: number | Date;                      // End timestamp
  type?: 'task' | 'milestone' | 'group';   // Task type
  progress?: number;                       // 0 to 1
  parentId?: string;                       // For hierarchy (WBS)
  resourceId?: string;                     // For resource view
  collapsed?: boolean;                     // Collapse children
  deadline?: number;                       // Deadline marker
  segments?: TaskSegment[];                // Composite task bar
  style?: {
    color?: string;
    progressColor?: string;
    barClass?: string;
  };
}
```

### Zoom Levels

| Level | Display | Best for |
|-------|---------|----------|
| `hour` | Hours | Daily schedules |
| `day` | Days | Weekly planning |
| `week` | Weeks | Monthly overview |
| `month` | Months | Quarterly/yearly view |

### Resource View

Display tasks grouped by resource (person, equipment, etc.):

```tsx
const resources = [
  { id: 'r1', name: 'Alice', group: 'Dev Team' },
  { id: 'r2', name: 'Bob', group: 'Dev Team' },
];

const tasks = [
  { id: '1', title: 'Task A', resourceId: 'r1', ... },
  { id: '2', title: 'Task B', resourceId: 'r1', ... },  // Same resource
  { id: '3', title: 'Task C', resourceId: 'r2', ... },
];

<Gantt
  tasks={tasks}
  resources={resources}
  resourceMode={true}
  resourceGroupBy="group"
/>
```

### Dependencies

```tsx
const dependencies = [
  { id: 'd1', fromTaskId: '1', toTaskId: '2', type: 'FS' },  // Finish-to-Start
  { id: 'd2', fromTaskId: '2', toTaskId: '3', type: 'SS' },  // Start-to-Start
];

<Gantt
  tasks={tasks}
  dependencies={dependencies}
  showDependencies={true}
  highlightDependencies={true}
/>
```

### Markers & Non-Working Time

```tsx
<Gantt
  tasks={tasks}
  markers={[
    { id: 'm1', timestamp: releaseDate, label: 'Release', color: '#f44336' }
  ]}
  showTaskDeadlines={true}
  nonWorkingPeriods={[
    { id: 'h1', start: holidayStart, end: holidayEnd, type: 'holiday' }
  ]}
  workingHours={{ start: '09:00', end: '18:00', daysOfWeek: [1,2,3,4,5] }}
  highlightWeekends={true}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | `Task[]` | required | Task data |
| `columns` | `ColumnDef[]` | default cols | Grid column definitions |
| `view` | `ViewConfig` | - | Zoom level and date range |
| `editable` | `boolean` | `true` | Enable drag/resize |
| `rowHeight` | `number` | `36` | Row height in pixels |
| `gridWidth` | `number` | `300` | Grid panel width |
| `showGrid` | `boolean` | `true` | Show left grid panel |
| `fitToContainer` | `boolean` | `false` | Auto-fit to container width |
| `syncParentDates` | `boolean` | `false` | Sync parent dates with children |
| `locale` | `string` | `'ja-JP'` | Date format locale |
| `resources` | `Resource[]` | - | Resource definitions |
| `resourceMode` | `boolean` | `false` | Enable resource view |
| `dependencies` | `Dependency[]` | - | Task dependencies |
| `markers` | `Marker[]` | - | Global timeline markers |
| `onTaskChange` | `function` | - | Task change callback |
| `onSelectionChange` | `function` | - | Selection change callback |
| `onTaskClick` | `function` | - | Task click callback |

## Styling

Customize with CSS variables:

```css
.my-gantt {
  --gantt-bg: #ffffff;
  --gantt-text: #333333;
  --gantt-border: #e0e0e0;
  --gantt-task-bg: #42a5f5;
  --gantt-task-progress: #1976d2;
  --gantt-milestone-bg: #ff9800;
  --gantt-today-line: #f44336;
  --gantt-row-height: 36px;
}

/* Dark mode */
[data-theme="dark"] .my-gantt {
  --gantt-bg: #1a1a2e;
  --gantt-text: #e0e0e0;
  --gantt-border: #333;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

```bash
# Clone the repo
git clone https://github.com/Haronoya/react-gantt.git
cd react-gantt

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build
npm run build
```

## License

MIT © [Haro](https://github.com/Haronoya)

---

# 日本語ドキュメント

高性能なReact用ガントチャートライブラリ。10,000タスクでもスムーズに動作します。

## 特徴

- **高性能**: 仮想スクロールによる大規模データ対応（10,000タスク以上でも60fps）
- **柔軟なズーム**: 時間/日/週/月の4段階
- **ドラッグ操作**: タスクの移動・リサイズ
- **依存関係線**: タスク間の依存関係を矢印で表示（FS/SS/FF/SF）
- **リソースビュー**: リソース単位でタスクを表示
- **複合タスクバー**: セグメント分割表示
- **マーカー**: 期限やイベントの縦線表示
- **非稼働時間**: 休日・休憩時間のグレーアウト
- **カスタマイズ**: タスクの色、列定義、レンダラー
- **TypeScript**: 完全な型定義
- **軽量**: 依存は@tanstack/react-virtualのみ

## インストール

```bash
npm install @haro/react-gantt
```

## クイックスタート

```tsx
import { Gantt, type Task } from '@haro/react-gantt';
import '@haro/react-gantt/styles.css';

const tasks: Task[] = [
  {
    id: '1',
    title: 'プロジェクト計画',
    start: Date.now(),
    end: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1週間後
    type: 'task',
    progress: 0.5,
  },
  {
    id: '2',
    title: 'マイルストーン',
    start: Date.now() + 7 * 24 * 60 * 60 * 1000,
    end: Date.now() + 7 * 24 * 60 * 60 * 1000,
    type: 'milestone',
  },
];

function App() {
  return (
    <div style={{ height: '500px' }}>
      <Gantt
        tasks={tasks}
        view={{ zoom: 'day' }}
        onTaskChange={(patch, context) => {
          console.log('Task changed:', patch, context);
        }}
      />
    </div>
  );
}
```

## 基本的な使い方

### タスクの定義

```typescript
interface Task {
  id: string;                    // 一意のID
  title: string;                 // タスク名
  start: number | Date;          // 開始日時
  end: number | Date;            // 終了日時
  type?: 'task' | 'milestone' | 'group';  // タスクタイプ
  progress?: number;             // 進捗（0-1）
  parentId?: string;             // 親タスクID（階層構造用）
  collapsed?: boolean;           // 折りたたみ状態
  resourceId?: string;           // リソースID（リソースビュー用）
  deadline?: number;             // 期限（マーカー表示）
  segments?: TaskSegment[];      // セグメント（複合タスクバー）
  style?: {
    color?: string;              // バーの色
    progressColor?: string;      // 進捗部分の色
    barClass?: string;           // カスタムCSSクラス
  };
}
```

### ズームレベル

| レベル | 表示単位 | 用途 |
|--------|----------|------|
| `hour` | 時間 | 1日以内のスケジュール |
| `day` | 日 | 週単位の計画（デフォルト） |
| `week` | 週 | 月単位の計画 |
| `month` | 月 | 四半期〜年単位の計画 |

### 列のカスタマイズ

```tsx
import { Gantt, type ColumnDef } from '@haro/react-gantt';

const columns: ColumnDef[] = [
  {
    id: 'title',
    title: 'タスク名',
    width: 200,
    accessor: 'title',
  },
  {
    id: 'start',
    title: '開始日',
    width: 100,
    accessor: (task) => new Date(task.start).toLocaleDateString(),
  },
  {
    id: 'progress',
    title: '進捗',
    width: 80,
    accessor: (task) => `${Math.round((task.progress ?? 0) * 100)}%`,
    align: 'right',
  },
];

<Gantt tasks={tasks} columns={columns} />
```

### イベントハンドリング

```tsx
<Gantt
  tasks={tasks}
  editable={true}
  onTaskChange={(patch, context) => {
    // patch: { id, changes, previousValues }
    // context: { type: 'drag' | 'resize' | 'collapse' }
    setTasks(prev => prev.map(t =>
      t.id === patch.id ? { ...t, ...patch.changes } : t
    ));
  }}
  onSelectionChange={(selection) => {
    // selection: { ids: string[], anchor?: string }
    console.log('Selected tasks:', selection.ids);
  }}
  onTaskClick={(task, event) => {
    console.log('Clicked:', task.title);
  }}
  onTaskDoubleClick={(task, event) => {
    openEditDialog(task);
  }}
/>
```

### 親子タスクの連動

親タスクの期間を子タスク全体に自動で合わせる場合：

```tsx
<Gantt
  tasks={tasks}
  syncParentDates={true}  // 親タスクの日付を子タスクと連動
/>
```

### 表示期間の制御

```tsx
const [viewStart, setViewStart] = useState(Date.now());
const [viewEnd, setViewEnd] = useState(Date.now() + 30 * 24 * 60 * 60 * 1000);

<Gantt
  tasks={tasks}
  view={{
    zoom: 'day',
    start: viewStart,
    end: viewEnd,
  }}
/>
```

### コンテナ幅に自動フィット

```tsx
<Gantt
  tasks={tasks}
  fitToContainer={true}  // 表示期間をコンテナ幅に自動調整
/>
```

## 拡張機能

### 依存関係線

タスク間の依存関係を矢印で表示します。

```tsx
import { Gantt, type Dependency } from '@haro/react-gantt';

const dependencies: Dependency[] = [
  {
    id: 'd1',
    fromTaskId: '1',
    toTaskId: '2',
    type: 'FS',  // Finish-to-Start
  },
  {
    id: 'd2',
    fromTaskId: '2',
    toTaskId: '3',
    type: 'SS',  // Start-to-Start
    color: '#ff5722',
    style: 'dashed',
  },
];

<Gantt
  tasks={tasks}
  dependencies={dependencies}
  showDependencies={true}
  highlightDependencies={true}
  onDependencyClick={(dep, event) => console.log('Clicked:', dep)}
/>
```

依存関係タイプ:
- `FS`: Finish-to-Start（前タスク完了後に開始）
- `SS`: Start-to-Start（同時開始）
- `FF`: Finish-to-Finish（同時終了）
- `SF`: Start-to-Finish

### マーカー

期限やイベントを縦線で表示します。

```tsx
import { Gantt, type Marker } from '@haro/react-gantt';

const markers: Marker[] = [
  {
    id: 'm1',
    timestamp: Date.now() + 14 * 24 * 60 * 60 * 1000,
    label: 'リリース日',
    color: '#f44336',
    style: 'solid',
  },
];

<Gantt
  tasks={tasks}
  markers={markers}
  showTaskDeadlines={true}  // タスクのdeadlineフィールドもマーカー表示
  onMarkerClick={(marker, event) => console.log('Clicked:', marker)}
/>
```

### 複合タスクバー（セグメント）

タスクバーを複数のセグメントで構成します。

```tsx
const tasks: Task[] = [
  {
    id: '1',
    title: '開発作業',
    start: Date.now(),
    end: Date.now() + 5 * 24 * 60 * 60 * 1000,
    segments: [
      { id: 's1', duration: 1 * 24 * 60 * 60 * 1000, color: '#ffeb3b', label: '準備' },
      { id: 's2', duration: 3 * 24 * 60 * 60 * 1000, color: '#4caf50', label: '実装' },
      { id: 's3', duration: 1 * 24 * 60 * 60 * 1000, color: '#2196f3', label: 'レビュー' },
    ],
  },
];
```

### 非稼働時間

休日や休憩時間をグレーアウト表示します。

```tsx
import { Gantt, type NonWorkingPeriod, type WorkingHours } from '@haro/react-gantt';

// 稼働時間設定（自動で営業時間外をグレーアウト）
const workingHours: WorkingHours = {
  start: '09:00',
  end: '18:00',
  daysOfWeek: [1, 2, 3, 4, 5],  // 月〜金
};

// 明示的な非稼働期間
const nonWorkingPeriods: NonWorkingPeriod[] = [
  {
    id: 'holiday1',
    start: Date.parse('2024-01-01'),
    end: Date.parse('2024-01-03'),
    type: 'holiday',
    label: '年末年始',
  },
];

<Gantt
  tasks={tasks}
  workingHours={workingHours}
  nonWorkingPeriods={nonWorkingPeriods}
  showNonWorkingTime={true}
  highlightWeekends={true}
/>
```

### リソースビュー

リソース（人、設備等）単位でタスクを表示します。タスクビューとの違いは以下の通りです：

| | タスクビュー | リソースビュー |
|---|---|---|
| 行の単位 | 1行 = 1タスク | 1行 = 1リソース |
| 同じ行のタスク数 | 1つ | 複数可 |
| 用途 | プロジェクト全体の進捗確認 | 誰が何をしているか確認 |

```
タスクビュー:
行1: タスクA ████████████
行2: タスクB     ██████████
行3: タスクC         ████████

リソースビュー:
行1: 田中さん  ████タスクA████  ██タスクD██
行2: 鈴木さん      ████タスクB████
行3: 佐藤さん          ████タスクC████
```

```tsx
import { Gantt, type Resource, type Task } from '@haro/react-gantt';

const resources: Resource[] = [
  { id: 'r1', name: '田中太郎', group: '開発チーム' },
  { id: 'r2', name: '鈴木花子', group: '開発チーム' },
  { id: 'r3', name: '佐藤次郎', group: 'デザインチーム' },
];

const tasks: Task[] = [
  // 同じリソースに複数のタスクを割り当て可能
  { id: '1', title: 'タスク1', start: Date.now(), end: Date.now() + 86400000, resourceId: 'r1' },
  { id: '2', title: 'タスク2', start: Date.now() + 86400000, end: Date.now() + 172800000, resourceId: 'r1' },
  { id: '3', title: 'タスク3', start: Date.now(), end: Date.now() + 172800000, resourceId: 'r2' },
];

<Gantt
  tasks={tasks}
  resources={resources}
  resourceMode={true}           // リソースビューを有効化
  resourceGroupBy="group"       // グループ化するフィールド
  showEmptyResources={true}     // タスクがないリソースも表示
/>
```

リソースビューでは、同じリソースに割り当てられた複数のタスクが同じ行に並んで表示されます。これにより、各リソースの稼働状況やスケジュールの競合を一目で確認できます。

### 関連タスクのハイライト

選択タスクに関連するタスクをハイライト表示します。

```tsx
const tasks: Task[] = [
  { id: '1', title: 'タスク1', groupId: 'project-a', ... },
  { id: '2', title: 'タスク2', groupId: 'project-a', ... },
  { id: '3', title: 'タスク3', relatedTaskIds: ['1', '2'], ... },
];

<Gantt
  tasks={tasks}
  highlightRelatedTasks={true}
  highlightDependencies={true}
/>
```

## Props一覧

| Prop | 型 | デフォルト | 説明 |
|------|-----|----------|------|
| `tasks` | `Task[]` | 必須 | タスクデータ |
| `columns` | `ColumnDef[]` | デフォルト列 | グリッド列定義 |
| `view` | `ViewConfig` | - | ズーム・表示期間 |
| `selection` | `SelectionState` | - | 選択状態（制御モード） |
| `editable` | `boolean` | `true` | 編集可否 |
| `rowHeight` | `number` | `36` | 行の高さ（px） |
| `gridWidth` | `number` | `300` | グリッド幅（px） |
| `showGrid` | `boolean` | `true` | グリッド表示 |
| `fitToContainer` | `boolean` | `false` | コンテナ幅自動フィット |
| `syncParentDates` | `boolean` | `false` | 親子タスク日付連動 |
| `locale` | `string` | `'ja-JP'` | 日付フォーマットのロケール |
| `dependencies` | `Dependency[]` | - | 依存関係 |
| `showDependencies` | `boolean` | `true` | 依存関係線表示 |
| `highlightDependencies` | `boolean` | `true` | 選択時の依存関係ハイライト |
| `markers` | `Marker[]` | - | グローバルマーカー |
| `showTaskDeadlines` | `boolean` | `true` | タスク期限マーカー表示 |
| `nonWorkingPeriods` | `NonWorkingPeriod[]` | - | 非稼働期間 |
| `workingHours` | `WorkingHours` | - | 稼働時間設定 |
| `showNonWorkingTime` | `boolean` | `true` | 非稼働時間表示 |
| `highlightWeekends` | `boolean` | `true` | 週末ハイライト |
| `resources` | `Resource[]` | - | リソース一覧 |
| `resourceMode` | `boolean` | `false` | リソースビュー有効化 |
| `resourceGroupBy` | `string` | - | リソースグルーピングキー |
| `highlightRelatedTasks` | `boolean` | `false` | 関連タスクハイライト |
| `onTaskChange` | `function` | - | タスク変更時コールバック |
| `onSelectionChange` | `function` | - | 選択変更時コールバック |
| `onTaskClick` | `function` | - | タスククリック時 |
| `onTaskDoubleClick` | `function` | - | タスクダブルクリック時 |
| `onDependencyClick` | `function` | - | 依存関係クリック時 |
| `onMarkerClick` | `function` | - | マーカークリック時 |
| `onResourceClick` | `function` | - | リソースクリック時 |
| `onColumnResize` | `function` | - | 列リサイズ時 |

## CSS変数

スタイルはCSS変数でカスタマイズできます：

```css
.my-gantt {
  /* 基本色 */
  --gantt-bg: #ffffff;
  --gantt-text: #333333;
  --gantt-border: #e0e0e0;

  /* タスクバー */
  --gantt-task-bg: #42a5f5;
  --gantt-task-progress: #1976d2;
  --gantt-milestone-bg: #ff9800;
  --gantt-group-bg: #78909c;

  /* 依存関係線 */
  --gantt-dependency-color: #607d8b;
  --gantt-dependency-highlight: #1976d2;

  /* マーカー */
  --gantt-marker-color: #9c27b0;
  --gantt-deadline-color: #ff9800;

  /* 非稼働時間 */
  --gantt-nonworking-default: rgba(0, 0, 0, 0.05);
  --gantt-nonworking-holiday: rgba(0, 0, 0, 0.08);

  /* キャパシティ */
  --gantt-capacity-normal: #4caf50;
  --gantt-capacity-warning: #ff9800;
  --gantt-capacity-critical: #f44336;

  /* その他 */
  --gantt-today-line: #f44336;
  --gantt-row-height: 36px;
  --gantt-header-height: 40px;
}
```

## 開発

```bash
# 依存インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# テスト
npm run test

# 型チェック
npm run typecheck
```

## ライセンス

MIT License

## 作者

Haro
