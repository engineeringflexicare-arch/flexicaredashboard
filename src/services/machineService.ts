
import {
  ref,
  onValue,
} from "firebase/database";

import { database } from "./firebase";

import type {
  CycleHistoryItem,
} from "../types/analytics";

// =======================================
// COUNTER HISTORY ITEM
// =======================================

interface CounterHistoryItem {

  Interval?: number;

  Time?: string;
}

// =======================================
// LISTEN CYCLE HISTORY
// =======================================

export function listenCycleHistory(

  machineId: string,

  callback: (
    data: CycleHistoryItem[]
  ) => void
) {

  // ESP DATABASE STRUCTURE

  const historyRef = ref(
    database,
    `Machines/${machineId}/CounterHistory`
  );

  return onValue(
    historyRef,

    (snapshot) => {

      if (
        !snapshot.exists()
      ) {

        callback([]);

        return;
      }

      const history =
        snapshot.val() as Record<
          string,
          CounterHistoryItem
        >;

      const formattedData:
        CycleHistoryItem[] = [];

      Object.values(history)
        .slice(-20)

        .forEach((item) => {

          const time =
            item.Time
              ?.split(" ")[1] || "";

          formattedData.push({

            TimeLabel:
              time,

            CycleTime:
              item.Interval || 0,
          });
        });

      callback(
        formattedData
      );
    }
  );
}
