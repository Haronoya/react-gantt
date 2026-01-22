import { type MouseEvent as ReactMouseEvent } from 'react';
import type { Marker } from '../../types/marker';
import type { ZoomConfig } from '../../types/view';
import { MarkerLine } from './MarkerLine';

interface GlobalMarkerLayerProps {
  markers: Marker[];
  viewStart: number;
  viewEnd: number;
  zoomConfig: ZoomConfig;
  containerHeight: number;
  headerHeight: number;
  onMarkerClick?: (marker: Marker, event: ReactMouseEvent) => void;
}

export function GlobalMarkerLayer({
  markers,
  viewStart,
  viewEnd,
  zoomConfig,
  containerHeight,
  headerHeight,
  onMarkerClick,
}: GlobalMarkerLayerProps) {
  if (!markers || markers.length === 0) {
    return null;
  }

  return (
    <div
      className="gantt-global-marker-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {markers.map((marker) => (
        <MarkerLine
          key={marker.id}
          marker={marker}
          viewStart={viewStart}
          viewEnd={viewEnd}
          zoomConfig={zoomConfig}
          top={headerHeight}
          height={containerHeight - headerHeight}
          onClick={onMarkerClick}
        />
      ))}
    </div>
  );
}
