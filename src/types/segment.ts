/**
 * Pattern for segment fill
 */
export type SegmentPattern = 'solid' | 'striped' | 'dotted';

/**
 * A segment within a task bar - represents a distinct phase of work
 */
export interface TaskSegment {
  /** Unique identifier for the segment */
  id: string;
  /** Duration in milliseconds */
  duration: number;
  /** Segment background color */
  color?: string;
  /** Display label (shown in tooltip) */
  label?: string;
  /** Segment type identifier (e.g., 'setup', 'work', 'buffer') */
  type?: string;
  /** Fill pattern */
  pattern?: SegmentPattern;
}
