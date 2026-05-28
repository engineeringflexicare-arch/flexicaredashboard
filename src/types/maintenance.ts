// ===============================================
// MAINTENANCE ALERT TYPES
// ===============================================

export type MaintenanceSeverity = "low" | "medium" | "high" | "critical";
export type MaintenanceStatus = "open" | "in-progress" | "resolved" | "closed";
export type IssueType =
  | "breakdown"
  | "error"
  | "calibration"
  | "inspection"
  | "cleaning"
  | "repair"
  | "replacement"
  | "other";

export interface MaintenanceAlert {
  id: string;
  floorId: string;
  lineId: string;
  machineId: string;
  issueType: IssueType;
  breakdownDetails: string;
  severity: MaintenanceSeverity;
  notes: string;
  startTime: string;
  startTimestamp: number;
  status: MaintenanceStatus;
  createdBy: string;
  createdAt: string;
}

export interface MaintenanceResolution {
  id: string;
  alertId: string;
  repairNotes: string;
  fixedBy: string;
  resolvedTime: string;
  resolvedTimestamp: number;
  downtimeDuration: number; // in seconds
  estimatedDowntime: number;
}

export interface MaintenanceHistory {
  alertId: string;
  machineId: string;
  lineId: string;
  issueType: IssueType;
  severity: MaintenanceSeverity;
  createdAt: string;
  resolvedAt: string;
  downtimeDuration: number;
}
