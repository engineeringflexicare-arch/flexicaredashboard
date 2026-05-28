
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
  MaintenanceAlert,
} from "../types/maintenance";

// ===============================================
// INPUT TYPES
// ===============================================

interface CreateMaintenanceAlertInput {

  lineId: string;

  machineId: string;

  issueType:
    MaintenanceAlert["issueType"];

  breakdownDetails: string;

  severity:
    MaintenanceAlert["severity"];

  notes?: string;

  supervisor: string;
}

// ===============================================
// CREATE ALERT
// ===============================================

export async function createMaintenanceAlert(

  input:
    CreateMaintenanceAlertInput,

): Promise<string | null> {

  try {

    const alertRef =
      push(
        ref(
          database,
          "MaintenanceAlerts",
        ),
      );

    const now =
      new Date();

    // ===========================================
    // ALERT OBJECT
    // ===========================================

    const alert:
      MaintenanceAlert = {
        id: alertRef.key || "",

        lineId: input.lineId,

        machineId: input.machineId,

        issueType: input.issueType,

        breakdownDetails: input.breakdownDetails,

        severity: input.severity,

        notes: input.notes || "",

        startTime: now.toISOString(),

        status: "open",
        floorId: "",
        startTimestamp: 0,
        createdBy: "",
        createdAt: ""
      };

    // ===========================================
    // SAVE ALERT
    // ===========================================

    await set(
      alertRef,
      alert,
    );

    return (
      alertRef.key || null
    );

  } catch (
    error
  ) {

    console.error(
      "Create Maintenance Alert Error:",
      error,
    );

    return null;
  }
}

// ===============================================
// GET ACTIVE ALERTS
// ===============================================

export async function getActiveMaintenanceAlerts():
Promise<
  MaintenanceAlert[]
> {

  try {

    const snapshot =
      await get(
        ref(
          database,
          "MaintenanceAlerts",
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
        MaintenanceAlert
      >;

    // ===========================================
    // FILTER OPEN ALERTS
    // ===========================================

    return Object.values(
      data,
    ).filter(
      (alert) =>

        alert.status ===
        "open",
    );

  } catch (
    error
  ) {

    console.error(
      "Get Maintenance Alerts Error:",
      error,
    );

    return [];
  }
}

// ===============================================
// RESOLVE ALERT
// ===============================================

export async function resolveMaintenanceAlert(

  alertId: string,

  repairNotes: string,

  supervisor: string,

): Promise<boolean> {

  try {

    // ===========================================
    // UPDATE ALERT
    // ===========================================

    await update(
      ref(
        database,
        `MaintenanceAlerts/${alertId}`,
      ),
      {

        status:
          "closed",

        repairNotes,

        resolvedBy:
          supervisor,

        resolvedAt:
          new Date().toISOString(),
      },
    );

    return true;

  } catch (
    error
  ) {

    console.error(
      "Resolve Maintenance Alert Error:",
      error,
    );

    return false;
  }
}

