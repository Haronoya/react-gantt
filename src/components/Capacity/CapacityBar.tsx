'use client';

import { memo, useMemo } from 'react';
import type { CapacityInfo, CapacityConfig } from '../../types/capacity';
import { getCapacityColor } from '../../utils/capacity';

interface CapacityBarProps {
  capacity: CapacityInfo;
  width?: number;
  height?: number;
  config?: CapacityConfig;
  showLabel?: boolean;
}

export const CapacityBar = memo(function CapacityBar({
  capacity,
  width = 80,
  height = 16,
  config,
  showLabel = true,
}: CapacityBarProps) {
  const { warningThreshold = 0.8, criticalThreshold = 1.0 } = config || {};

  const color = useMemo(
    () => getCapacityColor(capacity.utilization, warningThreshold, criticalThreshold),
    [capacity.utilization, warningThreshold, criticalThreshold]
  );

  const displayPercent = Math.round(capacity.utilization * 100);
  const barWidth = Math.min(capacity.utilization, 1) * 100;
  const overflowWidth = capacity.utilization > 1 ? (capacity.utilization - 1) * 100 : 0;

  return (
    <div
      className="gantt-capacity-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        width,
      }}
    >
      <div
        className="gantt-capacity-bar-bg"
        style={{
          flex: 1,
          height,
          backgroundColor: 'var(--gantt-capacity-bg)',
          borderRadius: '3px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="gantt-capacity-bar-fill"
          style={{
            width: `${barWidth}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '3px',
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }}
        />
        {overflowWidth > 0 && (
          <div
            className="gantt-capacity-bar-overflow"
            style={{
              position: 'absolute',
              top: 0,
              left: '100%',
              width: `${Math.min(overflowWidth, 100)}%`,
              height: '100%',
              backgroundColor: 'var(--gantt-capacity-overflow)',
              borderRadius: '0 3px 3px 0',
              transform: 'translateX(-100%)',
            }}
          />
        )}
      </div>
      {showLabel && (
        <span
          className="gantt-capacity-bar-label"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: capacity.overloaded ? 'var(--gantt-capacity-critical)' : 'inherit',
            minWidth: '36px',
            textAlign: 'right',
          }}
        >
          {displayPercent}%
        </span>
      )}
    </div>
  );
});
