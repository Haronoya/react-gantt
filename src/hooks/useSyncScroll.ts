'use client';

import { useCallback, useRef, useEffect } from 'react';

interface UseSyncScrollResult {
  gridRef: React.RefObject<HTMLDivElement>;
  timelineRef: React.RefObject<HTMLDivElement>;
  handleGridScroll: (e: React.UIEvent) => void;
  handleTimelineScroll: (e: React.UIEvent) => void;
  scrollTo: (scrollTop: number, scrollLeft?: number) => void;
}

/**
 * Hook to synchronize vertical scroll between Grid and Timeline panels
 */
export function useSyncScroll(
  onScroll?: (scrollTop: number, scrollLeft: number) => void
): UseSyncScrollResult {
  const gridRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef<'grid' | 'timeline' | null>(null);
  const rafId = useRef<number | null>(null);
  const resetRafId = useRef<number | null>(null);

  const syncScroll = useCallback(
    (source: 'grid' | 'timeline', scrollTop: number, scrollLeft: number) => {
      // Prevent feedback loops
      if (isScrolling.current && isScrolling.current !== source) {
        return;
      }

      isScrolling.current = source;

      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        const target = source === 'grid' ? timelineRef.current : gridRef.current;

        if (target && target.scrollTop !== scrollTop) {
          target.scrollTop = scrollTop;
        }

        onScroll?.(scrollTop, scrollLeft);

        // Reset scrolling flag after animation frame
        if (resetRafId.current !== null) {
          cancelAnimationFrame(resetRafId.current);
        }
        resetRafId.current = requestAnimationFrame(() => {
          isScrolling.current = null;
        });
      });
    },
    [onScroll]
  );

  const handleGridScroll = useCallback(
    (e: React.UIEvent) => {
      const target = e.currentTarget as HTMLDivElement;
      syncScroll('grid', target.scrollTop, timelineRef.current?.scrollLeft ?? 0);
    },
    [syncScroll]
  );

  const handleTimelineScroll = useCallback(
    (e: React.UIEvent) => {
      const target = e.currentTarget as HTMLDivElement;
      syncScroll('timeline', target.scrollTop, target.scrollLeft);
    },
    [syncScroll]
  );

  const scrollTo = useCallback((scrollTop: number, scrollLeft?: number) => {
    if (gridRef.current) {
      gridRef.current.scrollTop = scrollTop;
    }
    if (timelineRef.current) {
      timelineRef.current.scrollTop = scrollTop;
      if (scrollLeft !== undefined) {
        timelineRef.current.scrollLeft = scrollLeft;
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      if (resetRafId.current !== null) {
        cancelAnimationFrame(resetRafId.current);
      }
    };
  }, []);

  return {
    gridRef,
    timelineRef,
    handleGridScroll,
    handleTimelineScroll,
    scrollTo,
  };
}
