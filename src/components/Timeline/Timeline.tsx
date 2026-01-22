'use client';

import { memo, forwardRef, useState, useCallback, useEffect, type MouseEvent as ReactMouseEvent } from 'react';
import { TimelineHeader } from './TimelineHeader';
import { TimelineBody } from './TimelineBody';
import type { Marker } from '../../types/marker';
import type { Dependency } from '../../types/dependency';
import type { NonWorkingPeriod, WorkingHours } from '../../types/nonWorkingTime';
import styles from './Timeline.module.css';

interface TimelineProps {
  onScroll?: (e: React.UIEvent) => void;
  markers?: Marker[];
  showTaskDeadlines?: boolean;
  deadlineColor?: string;
  onMarkerClick?: (marker: Marker, event: ReactMouseEvent) => void;
  dependencies?: Dependency[];
  showDependencies?: boolean;
  highlightDependencies?: boolean;
  selectedTaskIds?: string[];
  onDependencyClick?: (dependency: Dependency, event: ReactMouseEvent) => void;
  nonWorkingPeriods?: NonWorkingPeriod[];
  workingHours?: WorkingHours;
  showNonWorkingTime?: boolean;
  highlightWeekends?: boolean;
}

export const Timeline = memo(
  forwardRef<HTMLDivElement, TimelineProps>(function Timeline({
    onScroll,
    markers,
    showTaskDeadlines,
    deadlineColor,
    onMarkerClick,
    dependencies,
    showDependencies,
    highlightDependencies,
    selectedTaskIds,
    onDependencyClick,
    nonWorkingPeriods,
    workingHours,
    showNonWorkingTime,
    highlightWeekends,
  }, ref) {
    const bodyRef = ref as React.RefObject<HTMLDivElement>;
    const [scrollLeft, setScrollLeft] = useState(0);
    const [viewportWidth, setViewportWidth] = useState(1000);

    // Sync header scroll with body
    const handleScroll = useCallback(
      (e: React.UIEvent) => {
        const target = e.currentTarget as HTMLDivElement;
        setScrollLeft(target.scrollLeft);
        onScroll?.(e);
      },
      [onScroll]
    );

    // Track viewport width
    useEffect(() => {
      const container = bodyRef.current;
      if (!container) return;

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setViewportWidth(entry.contentRect.width);
        }
      });

      observer.observe(container);
      setViewportWidth(container.clientWidth);

      return () => observer.disconnect();
    }, [bodyRef]);

    return (
      <div className={styles.timeline}>
        <div style={{ overflow: 'hidden' }}>
          <TimelineHeader scrollLeft={scrollLeft} viewportWidth={viewportWidth} />
        </div>
        <TimelineBody
          scrollRef={bodyRef}
          onScroll={handleScroll}
          markers={markers}
          showTaskDeadlines={showTaskDeadlines}
          deadlineColor={deadlineColor}
          onMarkerClick={onMarkerClick}
          dependencies={dependencies}
          showDependencies={showDependencies}
          highlightDependencies={highlightDependencies}
          selectedTaskIds={selectedTaskIds}
          onDependencyClick={onDependencyClick}
          nonWorkingPeriods={nonWorkingPeriods}
          workingHours={workingHours}
          showNonWorkingTime={showNonWorkingTime}
          highlightWeekends={highlightWeekends}
        />
      </div>
    );
  })
);
