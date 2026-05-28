
import {
  ref,
  onValue,
} from "firebase/database";

import { database } from "./firebase";

import type {
  CounterHistoryPoint,
  LineRecord,
  MachineRecord,
  RealtimeMachineStatus,
} from "../types/analytics";

// ===============================================
// PARSE TIMESTAMP
// ===============================================

function parseTimestamp(
  timeString?: unknown,
): number {

  if (
    !timeString ||
    typeof timeString !==
      "string"
  ) {
    return Date.now();
  }

  const [
    datePart = "",
    timePart = "00:00:00",
  ] = String(
    timeString,
  ).split(" ");

  const normalizedTime =
    timePart.replace(
      /\./g,
      ":",
    );

  const iso =
    `${datePart}T${normalizedTime}`;

  const parsed =
    Date.parse(iso);

  return Number.isNaN(
    parsed,
  )
    ? Date.now()
    : parsed;
}

// ===============================================
// LISTEN FLOOR LINES
// ===============================================

export function listenFloorLines(

  callback: (
    lines: Record<
      string,
      LineRecord
    >
  ) => void,
): () => void {

  const linesRef = ref(
    database,
    "Lines",
  );

  const unsubscribe =
    onValue(
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

            : {},
        );
      },
    );

  return () =>
    unsubscribe();
}

// ===============================================
// LISTEN FLOOR MACHINES
// ===============================================

export function listenFloorMachines(

  callback: (
    machines: Record<
      string,
      MachineRecord
    >
  ) => void,
): () => void {

  const machinesRef =
    ref(
      database,
      "Machines",
    );

  const unsubscribe =
    onValue(
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

            : {},
        );
      },
    );

  return () =>
    unsubscribe();
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

  const historyRef = ref(
    database,
    `Machines/${machineId}/CounterHistory`,
  );

  const unsubscribe =
    onValue(
      historyRef,

      (snapshot) => {

        const raw =
          snapshot.exists()

            ? (
                snapshot.val() as Record<
                  string,
                  Record<
                    string,
                    unknown
                  >
                >
              )

            : {};

        const parsed:
          Record<
            string,
            CounterHistoryPoint
          > = {};

        Object.entries(
          raw,
        ).forEach(
          ([
            key,
            value,
          ]) => {

            parsed[key] = {

              id: key,

              lineKey:
                String(
                  value
                    .LineKey ||
                    value
                      .Line ||
                    "",
                ),

              machineId,

              productCode:
                String(
                  value
                    .ProductCode ||
                    value
                      .productCode ||
                    "",
                ),

              timestamp:
                parseTimestamp(
                  value.Time,
                ),

              count:
                Number(
                  value.Count,
                ) || 0,

              interval:
                Number(
                  value.Interval,
                ) || 0,
            };
          },
        );

        callback(
          parsed,
        );
      },
    );

  return () =>
    unsubscribe();
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
      Date.now() / 1000,
    );

  return Object.entries(
    lines,
  ).map(
    ([
      lineKey,
      line,
    ]) => {

      const machineInfo =
        machines[
          line.machineId
        ] || {};

      const heartbeat =
        Number(
          machineInfo
            .heartbeat || 0,
        );

      const status =
        heartbeat &&
        now -
          heartbeat <=
          15

          ? "online"

          : "offline";

      const currentCount =
        Number(
          machineInfo
            .LiveStatus
            ?.Count || 0,
        );

      const lastCycleTimeSec =
        Number(
          machineInfo
            .LiveStatus
            ?.Interval || 0,
        ) || undefined;

      return {

        lineKey,

        machineId:
          line.machineId,

        status,

        lastHeartbeat:
          heartbeat ||
          undefined,

        currentCount,

        lastCycleTimeSec,
      };
    },
  );
}

