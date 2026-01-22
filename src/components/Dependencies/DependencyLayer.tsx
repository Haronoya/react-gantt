'use client';

import { memo, useMemo, type MouseEvent as ReactMouseEvent } from 'react';
import type { Dependency } from '../../types/dependency';
import type { TaskPosition } from '../../utils/position';
import { DependencyLine } from './DependencyLine';

interface DependencyLayerProps {
  dependencies: Dependency[];
  positions: Map<string, TaskPosition>;
  selectedTaskIds?: string[];
  onDependencyClick?: (dependency: Dependency, event: ReactMouseEvent) => void;
  highlightDependencies?: boolean;
}

export const DependencyLayer = memo(function DependencyLayer({
  dependencies,
  positions,
  selectedTaskIds = [],
  onDependencyClick,
  highlightDependencies = true,
}: DependencyLayerProps) {
  // Determine which dependencies should be highlighted
  const highlightedDependencyIds = useMemo(() => {
    if (!highlightDependencies || selectedTaskIds.length === 0) {
      return new Set<string>();
    }

    const highlighted = new Set<string>();
    const selectedSet = new Set(selectedTaskIds);

    dependencies.forEach((dep) => {
      if (selectedSet.has(dep.fromTaskId) || selectedSet.has(dep.toTaskId)) {
        highlighted.add(dep.id);
      }
    });

    return highlighted;
  }, [dependencies, selectedTaskIds, highlightDependencies]);

  // Filter dependencies to only those with visible positions
  const visibleDependencies = useMemo(() => {
    return dependencies.filter((dep) => {
      const fromPos = positions.get(dep.fromTaskId);
      const toPos = positions.get(dep.toTaskId);
      return fromPos && toPos;
    });
  }, [dependencies, positions]);

  if (visibleDependencies.length === 0) {
    return null;
  }

  const handleClick = (dep: Dependency, event: ReactMouseEvent<SVGGElement>) => {
    if (onDependencyClick) {
      event.stopPropagation();
      onDependencyClick(dep, event);
    }
  };

  return (
    <svg
      className="gantt-dependency-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 'var(--gantt-z-bars)',
      }}
    >
      <defs>
        {/* Normal arrow marker */}
        <marker
          id="dependency-arrow"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="var(--gantt-dependency-color)"
          />
        </marker>
        {/* Highlighted arrow marker */}
        <marker
          id="dependency-arrow-highlighted"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="var(--gantt-dependency-highlight)"
          />
        </marker>
      </defs>

      {/* Render non-highlighted dependencies first (behind) */}
      {visibleDependencies
        .filter((dep) => !highlightedDependencyIds.has(dep.id))
        .map((dep) => {
          const fromPos = positions.get(dep.fromTaskId);
          const toPos = positions.get(dep.toTaskId);

          // Safety check - should not happen due to visibleDependencies filter
          if (!fromPos || !toPos) return null;

          return (
            <g
              key={dep.id}
              onClick={(e) => handleClick(dep, e)}
              style={{ pointerEvents: onDependencyClick ? 'stroke' : 'none', cursor: onDependencyClick ? 'pointer' : 'default' }}
            >
              <DependencyLine
                dependency={dep}
                fromPosition={fromPos}
                toPosition={toPos}
                isHighlighted={false}
              />
            </g>
          );
        })}

      {/* Render highlighted dependencies on top */}
      {visibleDependencies
        .filter((dep) => highlightedDependencyIds.has(dep.id))
        .map((dep) => {
          const fromPos = positions.get(dep.fromTaskId);
          const toPos = positions.get(dep.toTaskId);

          // Safety check - should not happen due to visibleDependencies filter
          if (!fromPos || !toPos) return null;

          return (
            <g
              key={dep.id}
              onClick={(e) => handleClick(dep, e)}
              style={{ pointerEvents: onDependencyClick ? 'stroke' : 'none', cursor: onDependencyClick ? 'pointer' : 'default' }}
            >
              <DependencyLine
                dependency={dep}
                fromPosition={fromPos}
                toPosition={toPos}
                isHighlighted={true}
              />
            </g>
          );
        })}
    </svg>
  );
});
