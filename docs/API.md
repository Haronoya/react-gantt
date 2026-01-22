# API Reference

## Components

### `<Gantt>`

メインのガントチャートコンポーネント。

```tsx
import { Gantt } from '@haro/react-gantt';
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tasks` | `Task[]` | Required | タスクデータの配列 |
| `columns` | `ColumnDef[]` | Default columns | グリッド列の定義 |
| `view` | `ViewConfig` | `undefined` | ズーム・表示期間の設定 |
| `selection` | `SelectionState` | `undefined` | 選択状態（制御モード用） |
| `editable` | `boolean` | `true` | 編集（ドラッグ）の可否 |
| `rowHeight` | `number` | `36` | 行の高さ（ピクセル） |
| `gridWidth` | `number` | `300` | グリッドパネルの幅（ピクセル） |
| `minGridWidth` | `number` | `150` | グリッドパネルの最小幅 |
| `maxGridWidth` | `number` | `600` | グリッドパネルの最大幅 |
| `showGrid` | `boolean` | `true` | グリッドパネルの表示 |
| `fitToContainer` | `boolean` | `false` | 表示期間をコンテナ幅に自動フィット |
| `syncParentDates` | `boolean` | `false` | 親タスクの日付を子タスクと連動 |
| `locale` | `string` | `'ja-JP'` | 日付フォーマットのロケール |
| `className` | `string` | `undefined` | ルート要素のCSSクラス |
| `style` | `CSSProperties` | `undefined` | ルート要素のインラインスタイル |
| `renderers` | `GanttRenderers` | `undefined` | カスタムレンダラー |

#### Event Handlers

| Prop | Type | Description |
|------|------|-------------|
| `onTaskChange` | `(patch: TaskPatch, context: ChangeContext) => void` | タスク変更時 |
| `onSelectionChange` | `(selection: SelectionState) => void` | 選択変更時 |
| `onTaskClick` | `(task: NormalizedTask, event: MouseEvent) => void` | タスククリック時 |
| `onTaskDoubleClick` | `(task: NormalizedTask, event: MouseEvent) => void` | タスクダブルクリック時 |
| `onRowClick` | `(task: NormalizedTask, event: MouseEvent) => void` | グリッド行クリック時 |
| `onScroll` | `(scroll: { scrollTop: number; scrollLeft: number }) => void` | スクロール時 |
| `onViewChange` | `(view: ViewConfig) => void` | ビュー変更時 |
| `onColumnResize` | `(columnId: string, width: number) => void` | 列リサイズ時 |

---

## Types

### `Task`

タスクの入力データ型。

```typescript
interface Task {
  /** 一意の識別子 */
  id: string;

  /** タスク名 */
  title: string;

  /** 開始日時（ミリ秒タイムスタンプまたはDate） */
  start: number | Date;

  /** 終了日時（ミリ秒タイムスタンプまたはDate） */
  end: number | Date;

  /** タスクの種類 */
  type?: 'task' | 'milestone' | 'group';

  /** 進捗（0〜1） */
  progress?: number;

  /** 親タスクのID（階層構造用） */
  parentId?: string;

  /** 折りたたみ状態（groupタイプ用） */
  collapsed?: boolean;

  /** 行の高さ（個別設定） */
  rowHeight?: number;

  /** スタイル設定 */
  style?: TaskStyle;

  /** 任意の追加データ */
  meta?: Record<string, unknown>;
}
```

### `TaskStyle`

タスクバーのスタイル設定。

```typescript
interface TaskStyle {
  /** バーの背景色（例: '#42a5f5'） */
  color?: string;

  /** 進捗部分の色（例: '#1976d2'） */
  progressColor?: string;

  /** カスタムCSSクラス */
  barClass?: string;
}
```

### `NormalizedTask`

内部で正規化されたタスク型。コールバックで受け取る。

```typescript
interface NormalizedTask extends Omit<Task, 'start' | 'end'> {
  /** 開始日時（ミリ秒タイムスタンプに正規化） */
  start: number;

  /** 終了日時（ミリ秒タイムスタンプに正規化） */
  end: number;

  /** 階層の深さ（ルート=0） */
  depth: number;

  /** 子タスクの有無 */
  hasChildren: boolean;

  /** 表示状態（折りたたまれた親の子は非表示） */
  visible: boolean;

  /** 表示順のインデックス */
  visibleIndex: number;
}
```

### `ColumnDef`

グリッド列の定義。

```typescript
interface ColumnDef {
  /** 列の識別子 */
  id: string;

  /** ヘッダーに表示するタイトル */
  title: string;

  /** 列幅（ピクセル） */
  width: number;

  /** 最小幅 */
  minWidth?: number;

  /** 最大幅 */
  maxWidth?: number;

  /** セル値の取得方法 */
  accessor: keyof Task | ((task: NormalizedTask) => string | number | null);

  /** リサイズ可否 */
  resizable?: boolean;

  /** テキスト配置 */
  align?: 'left' | 'center' | 'right';
}
```

### `ZoomLevel`

ズームレベル。

```typescript
type ZoomLevel = 'hour' | 'day' | 'week' | 'month';
```

| Level | pixelsPerDay | 主な用途 |
|-------|-------------|---------|
| `hour` | 1200 (50px/時間) | 1日以内のスケジュール |
| `day` | 50 | 週単位の計画 |
| `week` | 15 | 月単位の計画 |
| `month` | 5 | 四半期〜年単位の計画 |

### `ViewConfig`

表示設定。

```typescript
interface ViewConfig {
  /** ズームレベル */
  zoom: ZoomLevel;

  /** 表示開始日時（ミリ秒） */
  start?: number;

  /** 表示終了日時（ミリ秒） */
  end?: number;
}
```

### `SelectionState`

選択状態。

```typescript
interface SelectionState {
  /** 選択されたタスクIDの配列 */
  ids: string[];

  /** アンカー（範囲選択の起点） */
  anchor?: string;
}
```

### `TaskPatch`

タスク変更の差分情報。

```typescript
interface TaskPatch {
  /** 変更されたタスクのID */
  id: string;

  /** 変更後の値 */
  changes: Partial<Task>;

  /** 変更前の値 */
  previousValues: Partial<Task>;
}
```

### `ChangeContext`

変更のコンテキスト情報。

```typescript
interface ChangeContext {
  /** 変更の種類 */
  type: 'drag' | 'resize' | 'collapse';
}
```

### `GanttRenderers`

カスタムレンダラー。

```typescript
interface GanttRenderers {
  /** タスクバーのカスタムレンダラー */
  taskBar?: ComponentType<TaskBarRendererProps>;

  /** ツールチップのカスタムレンダラー */
  tooltip?: ComponentType<TooltipRendererProps>;

  /** グリッド行のカスタムレンダラー */
  gridRow?: ComponentType<GridRowRendererProps>;
}
```

---

## CSS Variables

スタイルカスタマイズ用のCSS変数一覧。

### Colors

```css
:root {
  /* 背景 */
  --gantt-bg: #ffffff;
  --gantt-header-bg: #fafafa;
  --gantt-row-bg-alt: #fafafa;
  --gantt-weekend-bg: rgba(0, 0, 0, 0.02);

  /* テキスト */
  --gantt-text: #333333;
  --gantt-text-secondary: #666666;
  --gantt-text-muted: #999999;

  /* ボーダー */
  --gantt-border: #e0e0e0;
  --gantt-border-light: #f0f0f0;
  --gantt-header-border: #d0d0d0;

  /* グリッドライン */
  --gantt-grid-line: rgba(0, 0, 0, 0.06);
  --gantt-grid-line-strong: rgba(0, 0, 0, 0.12);

  /* タスクバー */
  --gantt-task-bg: #42a5f5;
  --gantt-task-progress: #1976d2;
  --gantt-milestone-bg: #ff9800;
  --gantt-group-bg: #78909c;
  --gantt-bar-selected: rgba(25, 118, 210, 0.3);

  /* 特殊ライン */
  --gantt-today-line: #f44336;
}
```

### Sizes

```css
:root {
  --gantt-row-height: 36px;
  --gantt-header-height: 40px;
  --gantt-bar-height: 24px;
  --gantt-bar-radius: 4px;
  --gantt-milestone-size: 16px;
}
```

### Typography

```css
:root {
  --gantt-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --gantt-font-size-base: 13px;
  --gantt-font-size-small: 11px;
  --gantt-font-size-header: 12px;
  --gantt-font-weight-normal: 400;
  --gantt-font-weight-medium: 500;
}
```

### Z-Index

```css
:root {
  --gantt-z-bars: 10;
  --gantt-z-selection: 15;
  --gantt-z-drag: 20;
  --gantt-z-tooltip: 100;
}
```

---

## Hooks

### `useGanttState`

内部状態管理フック（上級者向け）。

```typescript
import { useGanttState } from '@haro/react-gantt';

const {
  normalizedTasks,
  visibleTasks,
  zoom,
  zoomConfig,
  viewStart,
  viewEnd,
  rowHeight,
  columns,
  selection,
  isSelected,
  setZoom,
  setViewRange,
  handleTaskChange,
  handleSelectionChange,
  handleToggleCollapse,
} = useGanttState({
  tasks,
  columns,
  zoom: 'day',
  syncParentDates: true,
  onTaskChange,
  onSelectionChange,
});
```

---

## Utilities

### Date Utilities

```typescript
import {
  toTimestamp,
  startOfDay,
  startOfWeek,
  startOfMonth,
  addDays,
  addMonths,
  formatDate,
  formatTime,
  isWeekend,
} from '@haro/react-gantt';
```

### Position Utilities

```typescript
import {
  timestampToPixel,
  pixelToTimestamp,
  calculateTimelineWidth,
} from '@haro/react-gantt';
```
