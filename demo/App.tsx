import { useState, useCallback, useMemo } from 'react';
import {
  Gantt,
  type Task,
  type TaskPatch,
  type ChangeContext,
  type SelectionState,
  type ZoomLevel,
  type ColumnDef,
} from '../src';
import { sampleTasks, sampleColumns, hourlyTasks, hourlyColumns, generateLargeTasks } from './mockData';

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;

type ViewPeriod = '1day' | '3days' | '1week' | '2weeks' | '1month' | '3months' | 'all';

const VIEW_PERIOD_CONFIG: Record<ViewPeriod, { label: string; ms: number | null }> = {
  '1day': { label: '1日', ms: MS_PER_DAY },
  '3days': { label: '3日', ms: MS_PER_DAY * 3 },
  '1week': { label: '1週間', ms: MS_PER_WEEK },
  '2weeks': { label: '2週間', ms: MS_PER_WEEK * 2 },
  '1month': { label: '1ヶ月', ms: MS_PER_DAY * 30 },
  '3months': { label: '3ヶ月', ms: MS_PER_DAY * 90 },
  'all': { label: '全期間', ms: null },
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    padding: '16px',
    gap: '12px',
    background: '#f0f2f5',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600 as const,
    color: '#1a1a2e',
    margin: 0,
  },
  toolbar: {
    display: 'flex',
    gap: '8px',
    alignItems: 'stretch',
    padding: '8px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    flexWrap: 'wrap' as const,
  },
  toolbarSection: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    padding: '4px 12px',
    background: '#f8f9fa',
    borderRadius: '6px',
  },
  toolbarDivider: {
    width: '1px',
    background: '#e0e0e0',
    margin: '4px 4px',
    alignSelf: 'stretch' as const,
  },
  buttonGroup: {
    display: 'flex',
    gap: '2px',
    alignItems: 'center',
    background: '#f0f2f5',
    borderRadius: '6px',
    padding: '2px',
  },
  button: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '4px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#495057',
    fontWeight: 500 as const,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  },
  buttonHover: {
    background: '#e9ecef',
  },
  navButton: {
    padding: '4px 10px',
    border: 'none',
    borderRadius: '4px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600 as const,
    color: '#495057',
    transition: 'all 0.15s ease',
  },
  buttonActive: {
    background: '#1976d2',
    color: '#fff',
  },
  buttonToggle: {
    padding: '6px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#495057',
    fontWeight: 500 as const,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  },
  buttonToggleActive: {
    background: '#1976d2',
    color: '#fff',
    borderColor: '#1976d2',
  },
  select: {
    padding: '6px 10px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    fontSize: '13px',
    background: '#fff',
    color: '#495057',
    cursor: 'pointer',
    minWidth: '80px',
  },
  label: {
    fontSize: '12px',
    color: '#6c757d',
    fontWeight: 500 as const,
  },
  ganttContainer: {
    flex: 1,
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  info: {
    fontSize: '12px',
    color: '#6c757d',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  infoBadge: {
    padding: '2px 8px',
    background: '#e9ecef',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 500 as const,
  },
  dateDisplay: {
    fontSize: '13px',
    fontWeight: 600 as const,
    color: '#1a1a2e',
    padding: '4px 12px',
    background: '#e3f2fd',
    borderRadius: '4px',
    minWidth: '140px',
    textAlign: 'center' as const,
  },
  dataButtons: {
    display: 'flex',
    gap: '4px',
    marginLeft: 'auto',
  },
  dataButton: {
    padding: '6px 10px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    background: '#fff',
    cursor: 'pointer',
    fontSize: '11px',
    color: '#495057',
    fontWeight: 500 as const,
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  },
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [columns, setColumns] = useState<ColumnDef[]>(sampleColumns);
  const [selection, setSelection] = useState<SelectionState>({ ids: [] });
  const [zoom, setZoom] = useState<ZoomLevel>('day');
  const [editable, setEditable] = useState(true);
  const [viewStart, setViewStart] = useState<number | undefined>(undefined);
  const [viewEnd, setViewEnd] = useState<number | undefined>(undefined);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('all');
  const [fitToContainer, setFitToContainer] = useState(false);
  const [syncParentDates, setSyncParentDates] = useState(false);

  const handleTaskChange = useCallback(
    (patch: TaskPatch, context: ChangeContext) => {
      console.log('Task changed:', patch, context);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === patch.id
            ? { ...task, ...patch.changes }
            : task
        )
      );
    },
    []
  );

  const handleSelectionChange = useCallback((newSelection: SelectionState) => {
    setSelection(newSelection);
  }, []);

  const handleColumnResize = useCallback((columnId: string, width: number) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? { ...col, width } : col
      )
    );
  }, []);

  const handleLoadLarge = useCallback(() => {
    const largeTasks = generateLargeTasks(10000);
    setTasks(largeTasks);
    setColumns(sampleColumns);
    setSelection({ ids: [] });
    setViewStart(undefined);
    setViewEnd(undefined);
    if (zoom === 'hour') {
      setZoom('day');
    }
  }, [zoom]);

  const handleLoadSample = useCallback(() => {
    setTasks(sampleTasks);
    setColumns(sampleColumns);
    setSelection({ ids: [] });
    setViewStart(undefined);
    setViewEnd(undefined);
    if (zoom === 'hour') {
      setZoom('day');
    }
  }, [zoom]);

  const handleLoadHourly = useCallback(() => {
    setTasks(hourlyTasks);
    setColumns(hourlyColumns);
    setSelection({ ids: [] });
    setViewStart(undefined);
    setViewEnd(undefined);
    setZoom('hour');
  }, []);

  // Navigate view period - use viewPeriod if set, otherwise fall back to zoom-based step
  const getStepMs = useCallback(() => {
    // If a specific view period is selected, use that as the step
    if (viewPeriod !== 'all') {
      const config = VIEW_PERIOD_CONFIG[viewPeriod];
      if (config.ms) return config.ms;
    }

    // Fall back to zoom-based step
    switch (zoom) {
      case 'hour': return MS_PER_DAY;
      case 'day': return MS_PER_DAY;
      case 'week': return MS_PER_WEEK;
      case 'month': return MS_PER_DAY * 30;
      default: return MS_PER_DAY;
    }
  }, [zoom, viewPeriod]);

  const handlePrevious = useCallback(() => {
    const step = getStepMs();
    if (viewStart !== undefined) {
      setViewStart(viewStart - step);
      if (viewEnd !== undefined) {
        setViewEnd(viewEnd - step);
      }
    } else {
      // If no view set, calculate from tasks
      const minStart = Math.min(...tasks.map(t => typeof t.start === 'number' ? t.start : new Date(t.start).getTime()));
      const maxEnd = Math.max(...tasks.map(t => typeof t.end === 'number' ? t.end : new Date(t.end).getTime()));
      setViewStart(minStart - step);
      setViewEnd(maxEnd - step);
    }
  }, [viewStart, viewEnd, getStepMs, tasks]);

  const handleNext = useCallback(() => {
    const step = getStepMs();
    if (viewStart !== undefined) {
      setViewStart(viewStart + step);
      if (viewEnd !== undefined) {
        setViewEnd(viewEnd + step);
      }
    } else {
      const minStart = Math.min(...tasks.map(t => typeof t.start === 'number' ? t.start : new Date(t.start).getTime()));
      const maxEnd = Math.max(...tasks.map(t => typeof t.end === 'number' ? t.end : new Date(t.end).getTime()));
      setViewStart(minStart + step);
      setViewEnd(maxEnd + step);
    }
  }, [viewStart, viewEnd, getStepMs, tasks]);

  const handleToday = useCallback(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayStart = now.getTime();

    switch (zoom) {
      case 'hour':
        // Show today ± 12 hours
        setViewStart(todayStart);
        setViewEnd(todayStart + MS_PER_DAY);
        break;
      case 'day':
        // Show this week
        setViewStart(todayStart - 3 * MS_PER_DAY);
        setViewEnd(todayStart + 4 * MS_PER_DAY);
        break;
      case 'week':
        // Show this month
        setViewStart(todayStart - 2 * MS_PER_WEEK);
        setViewEnd(todayStart + 2 * MS_PER_WEEK);
        break;
      case 'month':
        // Show this quarter
        setViewStart(todayStart - 45 * MS_PER_DAY);
        setViewEnd(todayStart + 45 * MS_PER_DAY);
        break;
    }
  }, [zoom]);

  // Handle view period change
  const handleViewPeriodChange = useCallback((period: ViewPeriod) => {
    setViewPeriod(period);

    if (period === 'all') {
      setViewStart(undefined);
      setViewEnd(undefined);
      return;
    }

    const config = VIEW_PERIOD_CONFIG[period];
    if (!config.ms) return;

    // Center on today
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayStart = now.getTime();

    // Start from today at 0:00
    setViewStart(todayStart);
    setViewEnd(todayStart + config.ms);
  }, []);

  // Format current view date for display
  const currentViewLabel = useMemo(() => {
    if (viewStart === undefined) return '全期間表示';
    const start = new Date(viewStart);
    const options: Intl.DateTimeFormatOptions = zoom === 'hour'
      ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    return new Intl.DateTimeFormat('ja-JP', options).format(start);
  }, [viewStart, zoom]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>React Gantt Chart</h1>
        <div style={styles.info}>
          <span style={styles.infoBadge}>{tasks.length} タスク</span>
          {selection.ids.length > 0 && (
            <span style={styles.infoBadge}>{selection.ids.length} 選択中</span>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        {/* Navigation Section */}
        <div style={styles.toolbarSection}>
          <div style={styles.buttonGroup}>
            <button style={styles.navButton} onClick={handlePrevious} title="前へ">
              ◀
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonActive }}
              onClick={handleToday}
            >
              今日
            </button>
            <button style={styles.navButton} onClick={handleNext} title="次へ">
              ▶
            </button>
          </div>
          <span style={styles.dateDisplay}>{currentViewLabel}</span>
        </div>

        <div style={styles.toolbarDivider} />

        {/* View Settings Section */}
        <div style={styles.toolbarSection}>
          <span style={styles.label}>ズーム</span>
          <select
            style={styles.select}
            value={zoom}
            onChange={(e) => setZoom(e.target.value as ZoomLevel)}
          >
            <option value="hour">時間</option>
            <option value="day">日</option>
            <option value="week">週</option>
            <option value="month">月</option>
          </select>

          <span style={styles.label}>期間</span>
          <select
            style={styles.select}
            value={viewPeriod}
            onChange={(e) => handleViewPeriodChange(e.target.value as ViewPeriod)}
          >
            {Object.entries(VIEW_PERIOD_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.toolbarDivider} />

        {/* Options Section */}
        <div style={styles.toolbarSection}>
          <button
            style={{
              ...styles.buttonToggle,
              ...(editable ? styles.buttonToggleActive : {}),
            }}
            onClick={() => setEditable(!editable)}
          >
            編集 {editable ? 'ON' : 'OFF'}
          </button>

          <button
            style={{
              ...styles.buttonToggle,
              ...(fitToContainer ? styles.buttonToggleActive : {}),
            }}
            onClick={() => setFitToContainer(!fitToContainer)}
          >
            幅自動 {fitToContainer ? 'ON' : 'OFF'}
          </button>

          <button
            style={{
              ...styles.buttonToggle,
              ...(syncParentDates ? styles.buttonToggleActive : {}),
            }}
            onClick={() => setSyncParentDates(!syncParentDates)}
          >
            親子連動 {syncParentDates ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Data Section */}
        <div style={styles.dataButtons}>
          <button style={styles.dataButton} onClick={handleLoadSample}>
            サンプル (30)
          </button>
          <button style={styles.dataButton} onClick={handleLoadHourly}>
            時間単位 (20)
          </button>
          <button style={styles.dataButton} onClick={handleLoadLarge}>
            大量 (10K)
          </button>
        </div>
      </div>

      {/* Gantt Chart */}
      <div style={styles.ganttContainer}>
        <Gantt
          tasks={tasks}
          columns={columns}
          selection={selection}
          view={{ zoom, start: viewStart, end: viewEnd }}
          editable={editable}
          fitToContainer={fitToContainer}
          syncParentDates={syncParentDates}
          onTaskChange={handleTaskChange}
          onSelectionChange={handleSelectionChange}
          onColumnResize={handleColumnResize}
          onTaskClick={(task) => console.log('Task clicked:', task)}
          onTaskDoubleClick={(task) => console.log('Task double-clicked:', task)}
        />
      </div>
    </div>
  );
}
