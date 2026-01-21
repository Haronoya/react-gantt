'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ZoomLevel, ZoomConfig } from '../types';
import { ZOOM_CONFIGS, DEFAULT_ZOOM } from '../constants';

interface UseZoomOptions {
  initialZoom?: ZoomLevel;
  onZoomChange?: (zoom: ZoomLevel) => void;
}

interface UseZoomResult {
  zoom: ZoomLevel;
  zoomConfig: ZoomConfig;
  setZoom: (zoom: ZoomLevel) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
}

const ZOOM_ORDER: ZoomLevel[] = ['month', 'week', 'day'];

/**
 * Hook to manage zoom level state
 */
export function useZoom(options: UseZoomOptions = {}): UseZoomResult {
  const { initialZoom = DEFAULT_ZOOM, onZoomChange } = options;

  const [zoom, setZoomState] = useState<ZoomLevel>(initialZoom);

  const zoomConfig = useMemo(() => ZOOM_CONFIGS[zoom], [zoom]);

  const zoomIndex = ZOOM_ORDER.indexOf(zoom);
  const canZoomIn = zoomIndex < ZOOM_ORDER.length - 1;
  const canZoomOut = zoomIndex > 0;

  const setZoom = useCallback(
    (newZoom: ZoomLevel) => {
      setZoomState(newZoom);
      onZoomChange?.(newZoom);
    },
    [onZoomChange]
  );

  const zoomIn = useCallback(() => {
    if (canZoomIn) {
      const newZoom = ZOOM_ORDER[zoomIndex + 1];
      setZoom(newZoom);
    }
  }, [canZoomIn, zoomIndex, setZoom]);

  const zoomOut = useCallback(() => {
    if (canZoomOut) {
      const newZoom = ZOOM_ORDER[zoomIndex - 1];
      setZoom(newZoom);
    }
  }, [canZoomOut, zoomIndex, setZoom]);

  return {
    zoom,
    zoomConfig,
    setZoom,
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut,
  };
}
