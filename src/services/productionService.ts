
import {
  ref,
  get,
} from "firebase/database";

import { database } from "./firebase";

import type {
  CounterHistoryItem,
  LineData,
  TableRow,
} from "../types/production";

import { hours } from "../utils/timeHelpers";

import { generateHourlyData } from "../utils/productionHelpers";

// =======================================
// GET ALL PRODUCTION DATA
// =======================================

export async function getProductionData():
Promise<TableRow[]> {

  try {

    // ===================================
    // GET LINES
    // ===================================

    const linesSnapshot =
      await get(
        ref(
          database,
          "Lines"
        )
      );

    if (
      !linesSnapshot.exists()
    ) {
      return [];
    }

    const linesData =
      linesSnapshot.val() as Record<
        string,
        LineData
      >;

    const tableRows:
      TableRow[] = [];

    // ===================================
    // LOOP THROUGH LINES
    // ===================================

    for (
      const lineKey in
      linesData
    ) {

      const line =
        linesData[lineKey];

      // ===================================
      // GET MACHINE HISTORY
      // ===================================

      const historySnapshot =
        await get(
          ref(
            database,
            `Machines/${line.machineId}/CounterHistory`
          )
        );

      let hourlyData:
        Record<
          string,
          number
        > = {};

      // ===================================
      // GENERATE HOURLY DATA
      // ===================================

      if (
        historySnapshot.exists()
      ) {

        const historyData =
          historySnapshot.val() as Record<
            string,
            CounterHistoryItem
          >;

        hourlyData =
          generateHourlyData(
            historyData,
            hours
          );

      } else {

        // EMPTY HOURS

        hours.forEach(
          (hour) => {

            hourlyData[
              hour
            ] = 0;
          }
        );
      }

      // ===================================
      // PUSH TABLE ROW
      // ===================================

      tableRows.push({

        assemblyLine:
          lineKey.replace(
            "_",
            " "
          ),

        productCode:
          line.productCode,

        plannedMembers:
          line.plannedMembers,

        hourlyTarget:
          line.hourlyTarget,

        hourlyData,
      });
    }

    return tableRows;

  } catch (error) {

    console.error(
      "Production Data Error:",
      error
    );

    return [];
  }
}
