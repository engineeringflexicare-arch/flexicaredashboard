
import { ref, onValue } from "firebase/database";

import { database } from "./firebase";

import type {
  CounterHistoryPoint,
  LineRecord,
  MachineRecord,
  RealtimeMachineStatus,
} from "../types/analytics";

// ===============================================
// FIREBASE HISTORY ITEM TYPE
// ===============================================

type FirebaseHistoryItem = {
  Count?: number | string;
  Interval?: number | string;
  Time?: string;
  LineKey?: string;
  Line?: string;
  ProductCode?: string;
  productCode?: string;
};

// ===============================================
// PARSE TIMESTAMP
// ===============================================

function parseTimestamp(
  timeString?: unknown
): number {

  if (
    !timeString ||
    typeof timeString !== "string"
  ) {
    return Date.now();
  }

  const [
    datePart = "",
    timePart = "00:00:00",
  ] = String(timeString).split(" ");

  const normalizedTime =
    timePart.replace(/\./g, ":");

  const iso =
    `${datePart}T${normalizedTime}`;

  const parsed =
    Date.parse(iso);

  return Number.isNaN(parsed)
    ? Date.now()
    : parsed;
}

// ===============================================
// LISTEN LINES
// ===============================================

export function listenFloorLines(
  callback: (
    lines: Record<
      string,
      LineRecord
    >
  ) => void,
): () => void {

  // ESP DATABASE STRUCTURE

  const linesRef = ref(
    database,
    "Lines"
  );

  const unsubscribe = onValue(
    linesRef,
    (snapshot) => {

      callback(
        snapshot.exists()
          ? (
              snapshot.val() as Record<
                string,
                LineRecord
              >
            )
          : {}
      );
    }
  );

  return () => unsubscribe();
}

// ===============================================
// LISTEN MACHINES
// ===============================================

export function listenFloorMachines(
  callback: (
    machines: Record<
      string,
      MachineRecord
    >
  ) => void,
): () => void {

  // ESP DATABASE STRUCTURE

  const machinesRef = ref(
    database,
    "Machines"
  );

  const unsubscribe = onValue(
    machinesRef,
    (snapshot) => {

      callback(
        snapshot.exists()
          ? (
              snapshot.val() as Record<
                string,
                MachineRecord
              >
            )
          : {}
      );
    }
  );

  return () => unsubscribe();
}

// ===============================================
// LISTEN MACHINE HISTORY
// ===============================================

export function listenMachineHistory(
  machineId: string,

  callback: (
    history: Record<
      string,
      CounterHistoryPoint
    >
  ) => void,
): () => void {

  // ESP DATABASE STRUCTURE

  const historyRef = ref(
    database,
    `Machines/${machineId}/CounterHistory`,
  );

  const unsubscribe = onValue(
    historyRef,
    (snapshot) => {

      const raw = snapshot.exists()
        ? (
            snapshot.val() as Record<
              string,
              FirebaseHistoryItem
            >
          )
        : {};

      const parsed: Record<
        string,
        CounterHistoryPoint
      > = {};

      Object.entries(raw).forEach(
        ([key, value]) => {

          const item =
            value as FirebaseHistoryItem;

          parsed[key] = {
            id: key,

            lineKey:
              item.LineKey ||
              item.Line ||
              "",

            machineId,

            productCode:
              item.ProductCode ||
              item.productCode ||
              "",

            timestamp:
              parseTimestamp(
                item.Time
              ),

            count:
              Number(
                item.Count
              ) || 0,

            interval:
              Number(
                item.Interval
              ) || 0,
          };
        }
      );

      callback(parsed);
    }
  );

  return () => unsubscribe();
}

// ===============================================
// COMPUTE REALTIME STATUS
// ===============================================

export function computeRealtimeStatus(
  machines: Record<
    string,
    MachineRecord
  >,

  lines: Record<
    string,
    LineRecord
  >,
): RealtimeMachineStatus[] {

  const now =
    Math.floor(
      Date.now() / 1000
    );

  return Object.entries(lines).map(
    ([lineKey, line]) => {

      const machineInfo =
        machines[
          line.machineId
        ] || {};

      const heartbeat =
        Number(
          machineInfo.heartbeat || 0
        );

      const status =
        heartbeat &&
        now - heartbeat <= 15
          ? "online"
          : "offline";

      const currentCount =
        Number(
          machineInfo
            .LiveStatus?.Count || 0
        );

      const lastCycleTimeSec =
        Number(
          machineInfo
            .LiveStatus?.Interval || 0
        ) || undefined;

      return {
        lineKey,

        machineId:
          line.machineId,

        status,

        lastHeartbeat:
          heartbeat || undefined,

        currentCount,

        lastCycleTimeSec,
      };
    }
  );
}
