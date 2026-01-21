'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { NormalizedTask } from '../types';
import { TOOLTIP_DELAY } from '../constants';

interface TooltipState {
  task: NormalizedTask;
  x: number;
  y: number;
}

interface UseTooltipOptions {
  delay?: number;
  enabled?: boolean;
}

interface UseTooltipResult {
  tooltipState: TooltipState | null;
  showTooltip: (task: NormalizedTask, x: number, y: number) => void;
  hideTooltip: () => void;
  handleMouseEnter: (task: NormalizedTask, event: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  handleMouseMove: (event: React.MouseEvent) => void;
}

/**
 * Hook to manage tooltip state with delay
 */
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipResult {
  const { delay = TOOLTIP_DELAY, enabled = true } = options;

  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const currentTaskRef = useRef<NormalizedTask | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showTooltip = useCallback(
    (task: NormalizedTask, x: number, y: number) => {
      if (!enabled) return;
      setTooltipState({ task, x, y });
    },
    [enabled]
  );

  const hideTooltip = useCallback(() => {
    clearTimer();
    setTooltipState(null);
    currentTaskRef.current = null;
  }, [clearTimer]);

  const handleMouseEnter = useCallback(
    (task: NormalizedTask, event: React.MouseEvent) => {
      if (!enabled) return;

      currentTaskRef.current = task;
      clearTimer();

      timeoutRef.current = window.setTimeout(() => {
        if (currentTaskRef.current?.id === task.id) {
          showTooltip(task, event.clientX, event.clientY);
        }
      }, delay);
    },
    [enabled, delay, clearTimer, showTooltip]
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
  }, [hideTooltip]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (tooltipState) {
        setTooltipState((prev) =>
          prev ? { ...prev, x: event.clientX, y: event.clientY } : null
        );
      }
    },
    [tooltipState]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    tooltipState,
    showTooltip,
    hideTooltip,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
  };
}
