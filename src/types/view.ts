/**
 * Available zoom levels
 */
export type ZoomLevel = 'hour' | 'day' | 'week' | 'month';

/**
 * Configuration for each zoom level
 */
export interface ZoomConfig {
  /** Pixels per day */
  pixelsPerDay: number;
  /** Format for primary header (top) - date-fns format string */
  primaryFormat: string;
  /** Format for secondary header (bottom) - date-fns format string */
  secondaryFormat: string;
  /** Snap granularity in milliseconds */
  snapMs: number;
  /** Primary header unit span in days */
  primaryUnitDays: number;
  /** Secondary header unit span in days */
  secondaryUnitDays: number;
}

/**
 * View state configuration
 */
export interface ViewConfig {
  /** Current zoom level */
  zoom: ZoomLevel;
  /** Visible range start (Unix timestamp ms) */
  start?: number;
  /** Visible range end (Unix timestamp ms) */
  end?: number;
  /** Horizontal scroll position */
  scrollLeft?: number;
  /** Vertical scroll position */
  scrollTop?: number;
}
