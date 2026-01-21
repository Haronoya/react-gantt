'use client';

import { memo, forwardRef, useState, useCallback, useEffect } from 'react';
import { TimelineHeader } from './TimelineHeader';
import { TimelineBody } from './TimelineBody';
import styles from './Timeline.module.css';

interface TimelineProps {
  onScroll?: (e: React.UIEvent) => void;
}

export const Timeline = memo(
  forwardRef<HTMLDivElement, TimelineProps>(function Timeline({ onScroll }, ref) {
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
        <TimelineBody scrollRef={bodyRef} onScroll={handleScroll} />
      </div>
    );
  })
);
