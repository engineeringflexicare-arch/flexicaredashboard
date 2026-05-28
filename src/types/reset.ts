// ===============================================
// RESET HISTORY TYPES
// ===============================================

export interface ResetHistoryItem {
  floorId: string;
  lineId: string;
  machineId: string;
  previousCount: number;
  resetCount: number;
  reason: string;
  supervisorName: string;
  timestamp: string;
  date: string;
  hour: string;
}

export interface ResetRecord {
  floorId: string;
  lineId: string;
  machineId: string;
  previousCount: number;
  resetCount: number;
  reason: string;
  supervisor: string;
  timestamp: number;
  totalResets: number;
}

export interface ResetSummary {
  machineId: string;
  lineId: string;
  totalResets: number;
  lastReset: string;
  lastReason: string;
  averageResetValue: number;
}
