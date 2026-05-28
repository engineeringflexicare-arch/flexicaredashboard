// ===============================================
// HOURLY PRODUCTION SUMMARY TYPES
// ===============================================

export interface HourlySummary {
  date: string; // YYYY-MM-DD
  hour: string; // HH
  floorId: string;
  lineId: string;
  machineId: string;
  productCode: string;
  hourlyOutput: number;
  hourlyTarget: number;
  completionPercentage: number;
  averageCycleTime: number; // in seconds
  idleTime: number; // in seconds
  downtimeMinutes: number;
  plannedMembers: number;
  efficiency: number; // percentage
  startTime: string;
  endTime: string;
  timestamp: number;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  floorId: string;
  lineId: string;
  machineId: string;
  productCode: string;
  totalOutput: number;
  totalTarget: number;
  completionPercentage: number;
  totalDowntime: number;
  averageEfficiency: number;
  hourlyBreakdown: Record<string, HourlySummary>;
}

export interface ShiftSummary {
  date: string;
  shiftNumber: 1 | 2 | 3; // morning, evening, night
  floorId: string;
  totalOutput: number;
  totalTarget: number;
  completionPercentage: number;
  lineCount: number;
  machineCount: number;
  runningMachines: number;
  maintenanceAlerts: number;
  averageEfficiency: number;
}
