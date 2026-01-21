'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { GanttContextValue } from './types';

const GanttContext = createContext<GanttContextValue | null>(null);

interface GanttProviderProps {
  value: GanttContextValue;
  children: ReactNode;
}

export function GanttProvider({ value, children }: GanttProviderProps) {
  return <GanttContext.Provider value={value}>{children}</GanttContext.Provider>;
}

export function useGanttContext(): GanttContextValue {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error('useGanttContext must be used within a GanttProvider');
  }
  return context;
}

export { GanttContext };
