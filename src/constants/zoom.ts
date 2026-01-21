import type { ZoomLevel, ZoomConfig } from '../types';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const ZOOM_CONFIGS: Record<ZoomLevel, ZoomConfig> = {
  hour: {
    pixelsPerDay: 1200, // 50px per hour (same as day view's 50px per day) = 50 * 24
    primaryFormat: 'M月d日',
    secondaryFormat: 'H:mm',
    snapMs: HOUR_MS,
    primaryUnitDays: 1,
    secondaryUnitDays: 1 / 24, // 1 hour
  },
  day: {
    pixelsPerDay: 50,
    primaryFormat: 'yyyy年M月',
    secondaryFormat: 'd',
    snapMs: DAY_MS,
    primaryUnitDays: 30,
    secondaryUnitDays: 1,
  },
  week: {
    pixelsPerDay: 15,
    primaryFormat: 'yyyy年M月',
    secondaryFormat: 'W週',
    snapMs: DAY_MS,
    primaryUnitDays: 30,
    secondaryUnitDays: 7,
  },
  month: {
    pixelsPerDay: 4,
    primaryFormat: 'yyyy年',
    secondaryFormat: 'M月',
    snapMs: DAY_MS,
    primaryUnitDays: 365,
    secondaryUnitDays: 30,
  },
};

export const DEFAULT_ZOOM: ZoomLevel = 'day';
