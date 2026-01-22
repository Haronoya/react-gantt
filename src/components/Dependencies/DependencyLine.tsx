'use client';

import { memo, useMemo } from 'react';
import type { Dependency } from '../../types/dependency';
import type { TaskPosition } from '../../utils/position';

interface DependencyLineProps {
  dependency: Dependency;
  fromPosition: TaskPosition;
  toPosition: TaskPosition;
  isHighlighted?: boolean;
}

/**
 * Generate SVG path for dependency line
 * Creates an L-shaped or curved path between two task bars
 */
function generateDependencyPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  type: Dependency['type']
): string {
  const horizontalGap = 15;
  const verticalPadding = 5;

  // Direct horizontal connection is possible
  if (endX > startX + horizontalGap * 2) {
    // Use a bezier curve for smooth connection
    const controlX1 = startX + (endX - startX) * 0.3;
    const controlX2 = startX + (endX - startX) * 0.7;
    return `M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`;
  }

  // Need to route around - create L-shaped path
  if (type === 'FS' || type === 'SS') {
    // Go right, then down/up, then left, then to target
    const midX = startX + horizontalGap;
    const midY =
      startY < endY
        ? Math.max(startY, endY) + verticalPadding
        : Math.min(startY, endY) - verticalPadding;

    return `M ${startX} ${startY}
            L ${midX} ${startY}
            L ${midX} ${midY}
            L ${endX - horizontalGap} ${midY}
            L ${endX - horizontalGap} ${endY}
            L ${endX} ${endY}`;
  }

  // FF or SF types - route around tasks
  const midX = Math.max(startX, endX) + horizontalGap;

  return `M ${startX} ${startY}
          L ${midX} ${startY}
          L ${midX} ${endY}
          L ${endX} ${endY}`;
}

export const DependencyLine = memo(function DependencyLine({
  dependency,
  fromPosition,
  toPosition,
  isHighlighted = false,
}: DependencyLineProps) {
  const { type, color, style, strokeWidth } = dependency;

  const path = useMemo(() => {
    let startX: number, startY: number, endX: number, endY: number;

    // Calculate connection points based on dependency type
    switch (type) {
      case 'FS': // Finish-to-Start
        startX = fromPosition.left + fromPosition.width;
        startY = fromPosition.top + fromPosition.height / 2;
        endX = toPosition.left;
        endY = toPosition.top + toPosition.height / 2;
        break;

      case 'SS': // Start-to-Start
        startX = fromPosition.left;
        startY = fromPosition.top + fromPosition.height / 2;
        endX = toPosition.left;
        endY = toPosition.top + toPosition.height / 2;
        break;

      case 'FF': // Finish-to-Finish
        startX = fromPosition.left + fromPosition.width;
        startY = fromPosition.top + fromPosition.height / 2;
        endX = toPosition.left + toPosition.width;
        endY = toPosition.top + toPosition.height / 2;
        break;

      case 'SF': // Start-to-Finish
        startX = fromPosition.left;
        startY = fromPosition.top + fromPosition.height / 2;
        endX = toPosition.left + toPosition.width;
        endY = toPosition.top + toPosition.height / 2;
        break;

      default:
        startX = fromPosition.left + fromPosition.width;
        startY = fromPosition.top + fromPosition.height / 2;
        endX = toPosition.left;
        endY = toPosition.top + toPosition.height / 2;
    }

    return generateDependencyPath(startX, startY, endX, endY, type);
  }, [fromPosition, toPosition, type]);

  const lineColor = color || (isHighlighted ? 'var(--gantt-dependency-highlight)' : 'var(--gantt-dependency-color)');
  const lineWidth = strokeWidth || (isHighlighted ? 3 : 2);
  const markerId = isHighlighted ? 'dependency-arrow-highlighted' : 'dependency-arrow';

  return (
    <g className={`dependency-line ${isHighlighted ? 'highlighted' : ''}`}>
      <path
        d={path}
        fill="none"
        stroke={lineColor}
        strokeWidth={lineWidth}
        strokeDasharray={style === 'dashed' ? '5,5' : undefined}
        markerEnd={`url(#${markerId})`}
        style={{
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
        }}
      />
    </g>
  );
});
