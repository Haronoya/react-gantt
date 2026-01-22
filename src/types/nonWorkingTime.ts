/**
 * Non-working period type
 */
export type NonWorkingType = 'holiday' | 'break' | 'maintenance' | 'custom';

/**
 * Recurring pattern for non-working periods
 */
export interface RecurringPattern {
  /** Recurrence type */
  type: 'daily' | 'weekly' | 'monthly';
  /** Days of week for weekly recurrence (0-6, where 0 is Sunday) */
  daysOfWeek?: number[];
  /** Day of month for monthly recurrence (1-31) */
  dayOfMonth?: number;
}

/**
 * A non-working period that should be displayed as grayed out
 */
export interface NonWorkingPeriod {
  /** Unique identifier */
  id: string;
  /** Start timestamp (Unix timestamp in ms) */
  start: number;
  /** End timestamp (Unix timestamp in ms) */
  end: number;
  /** Type of non-working period */
  type?: NonWorkingType;
  /** Display label */
  label?: string;
  /** Background color */
  color?: string;
  /** Recurring pattern (if applicable) */
  recurring?: RecurringPattern;
  /** Resource ID (if period applies to specific resource only) */
  resourceId?: string;
}

/**
 * Working hours configuration for automatic weekend/non-working time calculation
 */
export interface WorkingHours {
  /** Start time in "HH:mm" format (e.g., "09:00") */
  start: string;
  /** End time in "HH:mm" format (e.g., "18:00") */
  end: string;
  /** Working days (0-6, where 0 is Sunday). Default: [1,2,3,4,5] (Mon-Fri) */
  daysOfWeek?: number[];
}
