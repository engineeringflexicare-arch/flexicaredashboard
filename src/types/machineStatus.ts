
// ===============================================
// MACHINE STATUS TYPES
// ===============================================

export type MachineState =

  | "running"
  | "idle"
  | "maintenance"
  | "offline";

// ===============================================
// MACHINE STATUS
// ===============================================

export interface MachineStatus {

  machineId: string;

  state: MachineState;

  // LAST HEARTBEAT

  lastHeartbeat?: string;

  lastHeartbeatTimestamp?: number;

  // LAST SEEN

  lastSeen: string;

  lastSeenTimestamp: number;

  // STATUS

  isOnline: boolean;

  currentLine?: string;

  currentProduct?: string;

  currentCount: number;

  status: string;
}

// ===============================================
// MACHINE HEALTH METRICS
// ===============================================

export interface MachineHealthMetrics {

  machineId: string;

  uptime: number;

  mtbf: number;

  mttr: number;

  currentState: MachineState;

  maintenanceRequired: boolean;

  lastMaintenanceDate: string;

  nextScheduledMaintenance: string;
}

// ===============================================
// OFFLINE DETECTION
// ===============================================

export interface OfflineDetection {

  machineId: string;

  lineId: string;

  floorId: string;

  offlineTime: string;

  detectionTime: number;

  lastValidCount: number;

  lastValidTimestamp: number;

  isStale: boolean;

  staleDuration: number;
}

// ===============================================
// MACHINE STATE CHANGE
// ===============================================

export interface MachineStateChange {

  machineId: string;

  previousState: MachineState;

  newState: MachineState;

  timestamp: number;

  reason?: string;

  duration?: number;
}

