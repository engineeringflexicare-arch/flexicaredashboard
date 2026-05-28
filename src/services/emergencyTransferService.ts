
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
  EmergencyTransfer,
  TransferReason,
} from "../types/emergencyTransfer";

// ===============================================
// INPUT TYPE
// ===============================================

interface PerformTransferInput {

  lineId: string;

  oldMachineId: string;

  newMachineId: string;

  reason: TransferReason;

  breakdownReason?: string;

  additionalNotes?: string;

  supervisor: string;

  productionCountAtTransfer: number;
}

// ===============================================
// PERFORM EMERGENCY TRANSFER
// ===============================================

export async function performEmergencyTransfer(

  input: PerformTransferInput,

): Promise<string | null> {

  try {

    const transferRef =
      push(
        ref(
          database,
          "EmergencyTransfers",
        ),
      );

    const timestamp =
      new Date();

    const transferData:
      EmergencyTransfer = {

      id:
        transferRef.key || "",

      floorId:
        "Main",

      lineId:
        input.lineId,

      oldMachineId:
        input.oldMachineId,

      newMachineId:
        input.newMachineId,

      supervisor:
        input.supervisor,

      reason:
        input.reason,

      breakdownReason:
        input.breakdownReason || "",

      additionalNotes:
        input.additionalNotes || "",

      timestamp:
        timestamp.toISOString(),

      timestampValue:
        timestamp.getTime(),

      productionCountAtTransfer:
        input.productionCountAtTransfer,

      status:
        "active",
    };

    // SAVE TRANSFER

    await set(
      transferRef,
      transferData,
    );

    // UPDATE LINE

    await update(

      ref(
        database,
        `Lines/${input.lineId}`,
      ),

      {
        machineId:
          input.newMachineId,
      },
    );

    // UPDATE MACHINE ASSIGNMENTS

    await update(

      ref(
        database,
        `Machines/${input.oldMachineId}`,
      ),

      {
        assignedLine:
          "",
      },
    );

    await update(

      ref(
        database,
        `Machines/${input.newMachineId}`,
      ),

      {
        assignedLine:
          input.lineId,
      },
    );

    // SAVE ASSIGNMENT HISTORY

    await set(

      ref(

        database,

        `Assignments/${input.lineId}/currentMachine`,
      ),

      input.newMachineId,
    );

    return (
      transferRef.key || null
    );

  } catch (
    error
  ) {

    console.error(
      "Emergency Transfer Error:",
      error,
    );

    return null;
  }
}

// ===============================================
// GET ACTIVE TRANSFERS
// ===============================================

export async function getActiveTransfers():
Promise<
  EmergencyTransfer[]
> {

  try {

    const snapshot =
      await get(

        ref(
          database,
          "EmergencyTransfers",
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
        EmergencyTransfer
      >;

    return Object.values(
      data,
    ).filter(
      (transfer) =>

        transfer.status ===
        "active",
    );

  } catch (
    error
  ) {

    console.error(
      "Get Transfer Error:",
      error,
    );

    return [];
  }
}

// ===============================================
// COMPLETE TRANSFER
// ===============================================

export async function completeEmergencyTransfer(

  transferId: string,

): Promise<boolean> {

  try {

    await update(

      ref(
        database,
        `EmergencyTransfers/${transferId}`,
      ),

      {
        status:
          "completed",
      },
    );

    return true;

  } catch (
    error
  ) {

    console.error(
      "Complete Transfer Error:",
      error,
    );

    return false;
  }
}
