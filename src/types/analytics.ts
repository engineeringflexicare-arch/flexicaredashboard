
// ===============================================
// ANALYTICS TYPES
// ===============================================

export type FloorName =
  | "Manufacturing_Floor"
  | "Assembly_Floor"
  | "Combined";

// ===============================================
// GRANULARITY
// ===============================================

export type Granularity =
  | "daily"
  | "weekly"
  | "monthly";

// ===============================================
// FILTERS
// ===============================================

export interface AnalyticsFilters {

  floor: FloorName;

  line?: string;

  machine?: string;

  product?: string;

  startDate: string;

  endDate: string;

  granularity:
    Granularity;
}

// ===============================================
// LINE RECORD
// ===============================================

export interface LineRecord {

  machineId: string;

  productCode: string;

  hourlyTarget: number;

  plannedMembers?: number;

  orderTotalProducts?: number;

  activeOrder?: string;
}

// ===============================================
// LIVE STATUS
// ===============================================

export interface LiveStatus {

  Count?: number | string;

  Interval?: number | string;

  LastUpdate?: string;
}

// ===============================================
// MACHINE RECORD
// ===============================================

export interface MachineRecord {

  heartbeat?:
    number | string;

  machineState?:
    | "running"
    | "idle"
    | "maintenance"
    | "offline";

  assignedLine?: string;

  CurrentProduct?: string;

  LiveStatus?:
    LiveStatus;
}

// ===============================================
// COUNTER HISTORY
// ===============================================

export interface CounterHistoryPoint {

  id: string;

  lineKey: string;

  machineId: string;

  productCode: string;

  timestamp: number;

  count: number;

  interval: number;
}

// ===============================================
// REALTIME MACHINE STATUS
// ===============================================

export interface RealtimeMachineStatus {

  lineKey: string;

  machineId: string;

  status:
    | "online"
    | "offline";

  lastHeartbeat?: number;

  currentCount: number;

  lastCycleTimeSec?: number;
}

// ===============================================
// CYCLE HISTORY ITEM
// ===============================================

export interface CycleHistoryItem {

  TimeLabel: string;

  CycleTime: number;
}
