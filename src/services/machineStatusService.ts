
// ===============================================
// MACHINE STATUS SERVICE
// ===============================================

import {
  ref,
  set,
  get,
  onValue,
  type Unsubscribe,
} from "firebase/database";

import { database } from "./firebase";

import type {
  MachineStatus,
  MachineState,
  OfflineDetection,
  MachineStateChange,
} from "../types/machineStatus";

// ===============================================
// OFFLINE THRESHOLD
// ===============================================

const OFFLINE_THRESHOLD =
  5 * 60 * 1000;

// ===============================================
// PARSE LAST UPDATE
// ===============================================

function parseLastUpdate(
  value?: string
): number {

  if (!value) {
    return 0;
  }

  const parsed =
    Date.parse(
      value.replace(
        " ",
        "T"
      )
    );

  return Number.isNaN(parsed)
    ? 0
    : parsed;
}

// ===============================================
// CHECK MACHINE OFFLINE STATUS
// ===============================================

export async function checkMachineOfflineStatus(
  machineId: string,
): Promise<OfflineDetection | null> {

  try {

    const machineRef = ref(
      database,
      `Machines/${machineId}`,
    );

    const snapshot =
      await get(machineRef);

    if (
      !snapshot.exists()
    ) {
      return null;
    }

    const machine =
      snapshot.val();

    const lastUpdate =
      parseLastUpdate(
        machine.LiveStatus
          ?.LastUpdate
      );

    const now =
      Date.now();

    const timeSinceUpdate =
      now - lastUpdate;

    const isStale =
      timeSinceUpdate >
      OFFLINE_THRESHOLD;

    if (isStale) {

      const lineData =
        machine.assignedLine ||
        "unknown";

      return {

        machineId,

        lineId:
          lineData,

        floorId:
          "default",

        offlineTime:
          new Date(
            lastUpdate
          ).toISOString(),

        detectionTime:
          now,

        lastValidCount:
          machine.LiveStatus
            ?.Count || 0,

        lastValidTimestamp:
          lastUpdate,

        isStale: true,

        staleDuration:
          timeSinceUpdate,
      };
    }

    return null;

  } catch (error) {

    console.error(
      "Error checking machine offline status:",
      error,
    );

    return null;
  }
}

// ===============================================
// UPDATE MACHINE STATE
// ===============================================

export async function updateMachineState(

  machineId: string,

  newState: MachineState,

  reason?: string,
): Promise<boolean> {

  try {

    const machineRef = ref(
      database,
      `Machines/${machineId}`,
    );

    const snapshot =
      await get(machineRef);

    const currentData =
      snapshot.val() || {};

    const previousState =
      currentData.machineState ||
      "unknown";

    // UPDATE MACHINE STATE

    await set(
      ref(
        database,
        `Machines/${machineId}/machineState`,
      ),
      newState,
    );

    // LOG STATE CHANGE

    const stateChange:
      MachineStateChange = {

      machineId,

      previousState:
        previousState as MachineState,

      newState,

      timestamp:
        Date.now(),

      reason,
    };

    await set(
      ref(
        database,
        `MachineStateChanges/${Date.now()}`,
      ),
      stateChange,
    );

    console.log(
      `✓ Machine ${machineId} state changed: ${previousState} → ${newState}`,
    );

    return true;

  } catch (error) {

    console.error(
      "Error updating machine state:",
      error,
    );

    return false;
  }
}

// ===============================================
// GET MACHINE STATUS
// ===============================================

export async function getMachineStatus(

  machineId: string,
): Promise<MachineStatus | null> {

  try {

    const machineRef = ref(
      database,
      `Machines/${machineId}`,
    );

    const snapshot =
      await get(machineRef);

    if (
      !snapshot.exists()
    ) {
      return null;
    }

    const machine =
      snapshot.val();

    const lastUpdate =
      parseLastUpdate(
        machine.LiveStatus
          ?.LastUpdate
      );

    const now =
      Date.now();

    const timeSinceUpdate =
      now - lastUpdate;

    const isOnline =
      timeSinceUpdate <=
      OFFLINE_THRESHOLD;

    const state:
      MachineState =
      isOnline
        ? (
            machine.machineState ||
            "idle"
          )
        : "offline";

    return{

      machineId,

      lastHeartbeat:
        isOnline
          ? new Date(
              lastUpdate
            ).toLocaleTimeString()
          : "No heartbeat",
            

      lastHeartbeatTimestamp:
        lastUpdate,


      state,
            lastSeen:
              new Date(
                lastUpdate
              ).toISOString(),

            lastSeenTimestamp:
              lastUpdate,
            isOnline,

            currentLine:
              machine.assignedLine ||
              undefined,

            currentProduct:
              machine.CurrentProduct ||
              undefined,

            currentCount:
              machine.LiveStatus
                ?.Count || 0,

            status,
          }



  } catch (error) {

    console.error(
      "Error fetching machine status:",
      error,
    );

    return null;
  }
}

// ===============================================
// GET FLOOR MACHINE STATUSES
// ===============================================

export async function getFloorMachineStatuses():
Promise<MachineStatus[]> {

  try {

    const machinesRef = ref(
      database,
      "Machines",
    );

    const snapshot =
      await get(machinesRef);

    if (
      !snapshot.exists()
    ) {
      return [];
    }

    const machines =
      snapshot.val();

    const statuses:
      MachineStatus[] = [];

    for (
      const machineId of
      Object.keys(machines)
    ) {

      const status =
        await getMachineStatus(
          machineId,
        );

      if (status) {
        statuses.push(status);
      }
    }

    return statuses;

  } catch (error) {

    console.error(
      "Error fetching floor machine statuses:",
      error,
    );

    return [];
  }
}

// ===============================================
// LISTEN TO MACHINE STATUS
// ===============================================

export function listenToMachineStatus(

  machineId: string,

  callback: (
    status:
      | MachineStatus
      | null
  ) => void,
): Unsubscribe {

  const machineRef = ref(
    database,
    `Machines/${machineId}`,
  );

  return onValue(
    machineRef,

    (snapshot) => {

      if (
        !snapshot.exists()
      ) {

        callback(null);

        return;
      }

      const machine =
        snapshot.val();

      const lastUpdate =
        parseLastUpdate(
          machine.LiveStatus
            ?.LastUpdate
        );

      const now =
        Date.now();

      const timeSinceUpdate =
        now - lastUpdate;

      const isOnline =
        timeSinceUpdate <=
        OFFLINE_THRESHOLD;

      const state:
        MachineState =
        isOnline
          ? (
              machine.machineState ||
              "idle"
            )
          : "offline";

      const status:
        MachineStatus = {
          machineId,

          state,

          lastSeen: new Date(
            lastUpdate
          ).toISOString(),

          lastSeenTimestamp: lastUpdate,

          isOnline,

          currentLine: machine.assignedLine ||
            undefined,

          currentProduct: machine.CurrentProduct ||
            undefined,

          currentCount: machine.LiveStatus
            ?.Count || 0,

          status: `${state.toUpperCase()} - Last update: ${formatTime(timeSinceUpdate)} ago`,
          lastHeartbeat: isOnline
            ? new Date(
                lastUpdate
              ).toLocaleTimeString()
          : "No heartbeat",

        lastHeartbeatTimestamp: lastUpdate
          
        };

      callback(status);
    }
  );
}

// ===============================================
// DETECT OFFLINE MACHINES
// ===============================================

export async function detectOfflineMachines():
Promise<OfflineDetection[]> {

  try {

    const machinesRef = ref(
      database,
      "Machines",
    );

    const snapshot =
      await get(machinesRef);

    if (
      !snapshot.exists()
    ) {
      return [];
    }

    const machines =
      snapshot.val();

    const offlineDetections:
      OfflineDetection[] = [];

    for (
      const machineId of
      Object.keys(machines)
    ) {

      const detection =
        await checkMachineOfflineStatus(
          machineId,
        );

      if (detection) {
        offlineDetections.push(
          detection
        );
      }
    }

    return offlineDetections;

  } catch (error) {

    console.error(
      "Error detecting offline machines:",
      error,
    );

    return [];
  }
}

// ===============================================
// FORMAT TIME
// ===============================================

function formatTime(
  ms: number
): string {

  const seconds =
    Math.floor(ms / 1000);

  const minutes =
    Math.floor(
      seconds / 60
    );

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${seconds}s`;
}

