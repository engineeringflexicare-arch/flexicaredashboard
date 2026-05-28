
import {
  ref,
  push,
  set,
  get,
  update,
} from "firebase/database";

import {
  database,
} from "./firebase";

import type {
  ResetHistoryItem,
} from "../types/reset";

// ===============================================
// INPUT TYPE
// ===============================================

interface ResetMachineCountInput {

  lineId: string;

  machineId: string;

  previousCount: number;

  reason: string;

  supervisorName: string;
}

// ===============================================
// RESET MACHINE COUNT
// ===============================================

export async function resetMachineCount(

  input:
    ResetMachineCountInput,

): Promise<boolean> {

  try {

    // ===========================================
    // SEND RESET COMMAND TO ESP
    // ===========================================

    await update(
      ref(
        database,
        `Machines/${input.machineId}/Control`,
      ),
      {

        ResetCommand:
          true,
      },
    );

    // ===========================================
    // SAVE RESET HISTORY
    // ===========================================

    const historyRef =
      push(
        ref(
          database,
          "ResetHistory",
        ),
      );

    const historyItem:
      ResetHistoryItem = {
        lineId: input.lineId,

        machineId: input.machineId,

        previousCount: input.previousCount,

        reason: input.reason,

        supervisorName: input.supervisorName,

        timestamp: new Date().toISOString(),
        floorId: "",
        resetCount: 0,
        date: "",
        hour: ""
      };

    await set(
      historyRef,
      historyItem,
    );

    return true;

  } catch (
    error
  ) {

    console.error(
      "Reset Machine Error:",
      error,
    );

    return false;
  }
}

// ===============================================
// GET RESET HISTORY
// ===============================================

export async function getResetHistory():
Promise<
  ResetHistoryItem[]
> {

  try {

    const snapshot =
      await get(
        ref(
          database,
          "ResetHistory",
        ),
      );

    if (
      !snapshot.exists()
    ) {

      return [];
    }

    const data =
      snapshot.val() as Record<
        string,
        ResetHistoryItem
      >;

    return Object.values(
      data,
    );

  } catch (
    error
  ) {

    console.error(
      "Get Reset History Error:",
      error,
    );

    return [];
  }
}

