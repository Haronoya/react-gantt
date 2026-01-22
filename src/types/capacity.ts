/**
 * Capacity information for a resource
 */
export interface CapacityInfo {
  /** Resource ID */
  resourceId: string;
  /** Utilization rate (0-1, can exceed 1 if overloaded) */
  utilization: number;
  /** Allocated hours within the view period */
  allocatedHours?: number;
  /** Available hours within the view period */
  availableHours?: number;
  /** Whether the resource is overloaded */
  overloaded?: boolean;
}

/**
 * Capacity display configuration
 */
export interface CapacityConfig {
  /** Show capacity in grid columns */
  showInGrid?: boolean;
  /** Show capacity as row background color */
  showAsBackground?: boolean;
  /** Warning threshold (default: 0.8 = 80%) */
  warningThreshold?: number;
  /** Critical threshold (default: 1.0 = 100%) */
  criticalThreshold?: number;
  /** Calculate capacity for current view period (default: true) */
  calculateForView?: boolean;
}
