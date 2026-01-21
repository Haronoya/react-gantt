import { MS_PER_DAY } from '../constants';

export const MS_PER_HOUR = 60 * 60 * 1000;
export const MS_PER_MINUTE = 60 * 1000;

/**
 * Convert Date or number to timestamp (ms)
 */
export function toTimestamp(value: Date | number): number {
  return value instanceof Date ? value.getTime() : value;
}

/**
 * Convert timestamp (ms) to Date
 */
export function toDate(timestamp: number): Date {
  return new Date(timestamp);
}

/**
 * Get start of hour (XX:00:00.000)
 */
export function startOfHour(timestamp: number): number {
  const date = new Date(timestamp);
  date.setMinutes(0, 0, 0);
  return date.getTime();
}

/**
 * Get start of day (00:00:00.000)
 */
export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get end of day (23:59:59.999)
 */
export function endOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * Get start of week (Sunday or Monday based on weekStartsOn)
 */
export function startOfWeek(timestamp: number, weekStartsOn: 0 | 1 = 1): number {
  const date = new Date(timestamp);
  const day = date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get start of month
 */
export function startOfMonth(timestamp: number): number {
  const date = new Date(timestamp);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Get start of year
 */
export function startOfYear(timestamp: number): number {
  const date = new Date(timestamp);
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Add hours to timestamp
 */
export function addHours(timestamp: number, hours: number): number {
  return timestamp + hours * MS_PER_HOUR;
}

/**
 * Add days to timestamp
 */
export function addDays(timestamp: number, days: number): number {
  return timestamp + days * MS_PER_DAY;
}

/**
 * Add months to timestamp
 */
export function addMonths(timestamp: number, months: number): number {
  const date = new Date(timestamp);
  const targetMonth = date.getMonth() + months;
  date.setMonth(targetMonth);
  // Handle month overflow (e.g., Jan 31 + 1 month)
  if (date.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    date.setDate(0); // Go to last day of previous month
  }
  return date.getTime();
}

/**
 * Add years to timestamp
 */
export function addYears(timestamp: number, years: number): number {
  const date = new Date(timestamp);
  date.setFullYear(date.getFullYear() + years);
  return date.getTime();
}

/**
 * Get difference in days between two timestamps
 */
export function diffInDays(start: number, end: number): number {
  return Math.round((end - start) / MS_PER_DAY);
}

/**
 * Check if two timestamps are the same day
 */
export function isSameDay(a: number, b: number): boolean {
  return startOfDay(a) === startOfDay(b);
}

/**
 * Check if timestamp is today
 */
export function isToday(timestamp: number): boolean {
  return isSameDay(timestamp, Date.now());
}

/**
 * Check if timestamp is a weekend (Saturday or Sunday)
 */
export function isWeekend(timestamp: number): boolean {
  const day = new Date(timestamp).getDay();
  return day === 0 || day === 6;
}

/**
 * Format date using Intl.DateTimeFormat
 */
export function formatDate(
  timestamp: number,
  options: Intl.DateTimeFormatOptions,
  locale = 'ja-JP'
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(timestamp));
}

/**
 * Format time as H:mm (e.g., 1:00, 13:00)
 */
export function formatTime(timestamp: number, locale = 'ja-JP'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

/**
 * Format date and time
 */
export function formatDateTime(timestamp: number, locale = 'ja-JP'): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(timestamp));
}

/**
 * Get ISO week number
 */
export function getWeekNumber(timestamp: number): number {
  const date = new Date(timestamp);
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / MS_PER_DAY);
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}

/**
 * Snap timestamp to nearest unit
 */
export function snapToUnit(timestamp: number, snapMs: number): number {
  return Math.round(timestamp / snapMs) * snapMs;
}

/**
 * Clamp timestamp between min and max
 */
export function clampTimestamp(timestamp: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, timestamp));
}

/**
 * Get date range that spans all given timestamps with padding
 */
export function getDateRange(
  timestamps: number[],
  paddingDays = 7
): { start: number; end: number } {
  if (timestamps.length === 0) {
    const now = Date.now();
    return {
      start: startOfMonth(now),
      end: addMonths(startOfMonth(now), 1),
    };
  }

  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);

  return {
    start: startOfDay(addDays(min, -paddingDays)),
    end: endOfDay(addDays(max, paddingDays)),
  };
}
