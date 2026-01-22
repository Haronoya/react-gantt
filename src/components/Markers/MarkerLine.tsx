import { type MouseEvent as ReactMouseEvent } from 'react';
import type { Marker } from '../../types/marker';
import type { ZoomConfig } from '../../types/view';
import { timestampToPixel } from '../../utils/position';

interface MarkerLineProps {
  marker: Marker;
  viewStart: number;
  viewEnd: number;
  zoomConfig: ZoomConfig;
  top: number;
  height: number;
  onClick?: (marker: Marker, event: ReactMouseEvent) => void;
}

export function MarkerLine({
  marker,
  viewStart,
  viewEnd,
  zoomConfig,
  top,
  height,
  onClick,
}: MarkerLineProps) {
  // Skip if marker is outside visible range
  if (marker.timestamp < viewStart || marker.timestamp > viewEnd) {
    return null;
  }

  const left = timestampToPixel(marker.timestamp, viewStart, zoomConfig.pixelsPerDay);
  const lineWidth = marker.width ?? 2;
  const lineStyle = marker.style ?? 'solid';
  const showLabel = marker.showLabel !== false;
  const labelPosition = marker.labelPosition ?? 'top';

  const handleClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onClick?.(marker, e);
  };

  return (
    <div
      className={`gantt-marker-line gantt-marker-line--${lineStyle}`}
      style={{
        position: 'absolute',
        left: left - lineWidth / 2,
        top,
        height,
        width: lineWidth,
        backgroundColor: lineStyle === 'solid' ? (marker.color ?? 'var(--gantt-marker-color)') : 'transparent',
        borderLeft: lineStyle !== 'solid'
          ? `${lineWidth}px ${lineStyle} ${marker.color ?? 'var(--gantt-marker-color)'}`
          : undefined,
        cursor: onClick ? 'pointer' : 'default',
        zIndex: 'var(--gantt-z-markers)',
        pointerEvents: 'auto',
      }}
      onClick={handleClick}
      title={marker.label}
    >
      {showLabel && marker.label && (
        <div
          className={`gantt-marker-label gantt-marker-label--${labelPosition}`}
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            [labelPosition]: labelPosition === 'top' ? -20 : -20,
            whiteSpace: 'nowrap',
            fontSize: 'var(--gantt-font-size-small)',
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor: 'var(--gantt-marker-label-bg)',
            color: 'var(--gantt-marker-label-color)',
          }}
        >
          {marker.label}
        </div>
      )}
    </div>
  );
}
