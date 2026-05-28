
// ===============================================
// EMERGENCY MACHINE REASSIGNMENT TYPES
// ===============================================

// ===============================================
// TRANSFER REASONS
// ===============================================

export type TransferReason =
  | "breakdown"
  | "emergency"
  | "maintenance"
  | "urgent_transfer"
  | "line_balancing"
  | "quality_issue"
  | "other";

// ===============================================
// TRANSFER STATUS
// ===============================================

export type TransferStatus =
  | "active"
  | "completed"
  | "reversed";

// ===============================================
// MACHINE LINE HISTORY
// ===============================================

export interface MachineLineHistory {

  lineId: string;

  assignedAt: string;

  removedAt?: string;

  duration?: number;

  reason?: string;
}

// ===============================================
// EMERGENCY TRANSFER
// ===============================================

export interface EmergencyTransfer {

  id: string;

  floorId: string;

  lineId: string;

  oldMachineId: string;

  newMachineId: string;

  supervisor: string;

  reason:
    TransferReason;

  breakdownReason?: string;

  additionalNotes?: string;

  timestamp: string;

  timestampValue: number;

  productionCountAtTransfer:
    number;

  activeOrder?: string;

  downtimeStart?: string;

  downtimeDuration?: number;

  completedAt?: string;

  completionReason?: string;

  status:
    TransferStatus;
}

// ===============================================
// TRANSFER HISTORY
// ===============================================

export interface TransferHistory {

  transferId: string;

  lineId: string;

  machineFrom: string;

  machineTo: string;

  reason:
    TransferReason;

  supervisor: string;

  timestamp: string;

  completedAt?: string;

  completionReason?: string;

  productionCountPreserved:
    number;

  transferDuration?: number;

  productionCountRecovered:
    number;
}

// ===============================================
// MACHINE TRANSFER LOG
// ===============================================

export interface MachineTransferLog {

  machineId: string;

  lineHistory:
    MachineLineHistory[];

  transferCount: number;

  lastTransfer?:
    EmergencyTransfer;
}

// ===============================================
// TRANSFER METRICS
// ===============================================

export interface TransferMetrics {

  totalTransfers: number;

  averageTransferDuration:
    number;

  commonReasons:
    Record<
      TransferReason,
      number
    >;

  affectedMachines:
    string[];

  affectedLines:
    string[];

  productionPreserved:
    number;

  downtimeAvoided:
    number;
}

