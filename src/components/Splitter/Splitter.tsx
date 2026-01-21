'use client';

import { useState, useCallback, useEffect, useRef, memo } from 'react';
import styles from './Splitter.module.css';

interface SplitterProps {
  position: number;
  minPosition: number;
  maxPosition: number;
  onPositionChange: (position: number) => void;
}

export const Splitter = memo(function Splitter({
  position,
  minPosition,
  maxPosition,
  onPositionChange,
}: SplitterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startPositionRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;
      startPositionRef.current = position;
    },
    [position]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const newPosition = Math.max(
        minPosition,
        Math.min(maxPosition, startPositionRef.current + delta)
      );
      onPositionChange(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minPosition, maxPosition, onPositionChange]);

  return (
    <div
      className={`${styles.splitter} ${isDragging ? styles.active : ''}`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={position}
      aria-valuemin={minPosition}
      aria-valuemax={maxPosition}
      tabIndex={0}
    />
  );
});
