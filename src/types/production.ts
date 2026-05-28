export interface CounterHistoryItem {
  Count: number;
  Time: string;
}

export interface LineData {
  floor: string;
  machineId: string;
  productCode: string;
  plannedMembers: number;
  hourlyTarget: number;
  orderTotalProducts?: number;
}

export interface MachineData {
  status: string;
  firmware: string;
  ip: string;
}

export interface AssignmentData {
  currentMachine: string;

  history: Record<string, string>;
}

export interface TableRow {
  assemblyLine: string;
  productCode: string;
  plannedMembers: number;
  hourlyTarget: number;
  hourlyData: Record<string, number>;
}
export interface LineData {
  machineId: string;

  productCode: string;

  plannedMembers: number;

  hourlyTarget: number;

  orderTotalProducts?: number;
}