
import {
  ref,
  get,
  set,
} from "firebase/database";

import { database } from "./firebase";

import type {
  CounterHistoryItem,
  LineData,
} from "../types/production";

import { hours } from "../utils/timeHelpers";

// =======================================
// TYPES
// =======================================

interface HourlySummary {
  date: string;
  hour: string;
  lineId: string;
  machineId: string;
  productCode: string;
  hourlyOutput: number;
  hourlyTarget: number;
  completionPercentage: number;
  averageCycleTime: number;
  idleTime: number;
  downtimeMinutes: number;
  plannedMembers: number;
  efficiency: number;
  startTime: string;
  endTime: string;
  timestamp: number;
}

// =======================================
// GENERATE DAILY PRODUCTION SUMMARY
// =======================================

export async function generateProductionSummary() {

  try {

    // ===================================
    // GET ALL LINES
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
      return;
    }

    const lines =
      linesSnapshot.val() as Record<
        string,
        LineData
      >;

    // ===================================
    // LOOP LINES
    // ===================================

    for (
      const lineKey in lines
    ) {

      const line =
        lines[lineKey];

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

      if (
        !historySnapshot.exists()
      ) {
        continue;
      }

      const history =
        historySnapshot.val() as Record<
          string,
          CounterHistoryItem
        >;

      // ===================================
      // INIT HOURLY SUMMARY
      // ===================================

      const hourlySummary:
        Record<
          string,
          number
        > = {};

      hours.forEach(
        (hour) => {
          hourlySummary[
            hour
          ] = 0;
        }
      );

      // ===================================
      // PROCESS HISTORY
      // ===================================

      Object.values(history)
        .forEach((item) => {

          const time =
            item.Time;

          if (!time) {
            return;
          }

          const timePart =
            time.split(" ")[1];

          if (!timePart) {
            return;
          }

          const hour =
            parseInt(
              timePart.split(
                ":"
              )[0]
            );

          // SHIFT HOURS

          if (
            hour >= 8 &&
            hour < 20
          ) {

            const nextHour =
              hour + 1;

            const key =
              `${String(hour).padStart(2, "0")}:00-${String(nextHour).padStart(2, "0")}:00`;

            hourlySummary[
              key
            ] =
              item.Count;
          }
        });

      // ===================================
      // DATE KEY
      // ===================================

      const today =
        new Date();

      const dateKey =
        `${today.getFullYear()}-` +
        `${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-` +
        `${String(
          today.getDate()
        ).padStart(2, "0")}`;

      // ===================================
      // TOTAL PRODUCTION
      // ===================================

      const totalProduced =
        Math.max(
          ...Object.values(
            hourlySummary
          )
        );

      // ===================================
      // BALANCE
      // ===================================

      const orderTotalProducts =
        line.orderTotalProducts ??
        0;

      const remaining =
        orderTotalProducts -
        totalProduced;

      // ===================================
      // COMPLETION %
      // ===================================

      const completionPercentage =
        orderTotalProducts > 0
          ? (
              (totalProduced /
                orderTotalProducts) *
              100
            ).toFixed(1)
          : "0";

      // ===================================
      // SAVE SUMMARY
      // ===================================

      await set(
        ref(
          database,
          `ProductionSummary/${lineKey}/${dateKey}`
        ),

        {
          line:
            lineKey,

          floor:
            "default",

          productCode:
            line.productCode,

          machineId:
            line.machineId,

          plannedMembers:
            line.plannedMembers,

          hourlyTarget:
            line.hourlyTarget,

          orderTotalProducts:
            line.orderTotalProducts ||
            0,

          totalProduced,

          remaining,

          completionPercentage,

          generatedAt:
            new Date().toISOString(),

          hourlySummary,
        }
      );
    }

    console.log(
      "Production summary generated successfully"
    );

  } catch (error) {

    console.error(
      "Summary Error:",
      error,
    );
  }
}

// ===============================================
// GENERATE HOURLY SUMMARY
// ===============================================

export async function generateHourlySummary(

  lineId: string,

  machineId: string,

  productCode: string,

  hourlyOutput: number,

  hourlyTarget: number,

  plannedMembers: number,
): Promise<boolean> {

  try {

    const now =
      new Date();

    const date =
      now.toISOString()
        .split("T")[0];

    const hour =
      String(
        now.getHours()
      ).padStart(2, "0");

    const prevHour =
      String(
        (
          now.getHours() -
          1 +
          24
        ) % 24
      ).padStart(2, "0");

    // ===================================
    // GET PREVIOUS HOUR
    // ===================================

    const prevHourRef = ref(
      database,
      `HourlySummaries/${date}/${prevHour}/${lineId}`,
    );

    const prevSnapshot =
      await get(prevHourRef);

    const prevOutput =
      prevSnapshot.exists()
        ? (
            prevSnapshot.val() as HourlySummary
          ).hourlyOutput
        : 0;

    // ===================================
    // CALCULATIONS
    // ===================================

    const cyclesInHour =
      hourlyOutput -
      prevOutput;

    const averageCycleTime =
      cyclesInHour > 0
        ? Math.round(
            (
              3600 /
              cyclesInHour
            ) * 1000
          )
        : 0;

    const completionPercentage =
      hourlyTarget > 0
        ? Math.round(
            (
              hourlyOutput /
              hourlyTarget
            ) * 100
          )
        : 0;

    const summary:
      HourlySummary = {

      date,

      hour,

      lineId,

      machineId,

      productCode,

      hourlyOutput,

      hourlyTarget,

      completionPercentage,

      averageCycleTime,

      idleTime: 0,

      downtimeMinutes: 0,

      plannedMembers,

      efficiency:
        completionPercentage,

      startTime:
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          parseInt(hour),
          0,
          0,
        ).toISOString(),

      endTime:
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          parseInt(hour),
          59,
          59,
        ).toISOString(),

      timestamp:
        now.getTime(),
    };

    // ===================================
    // SAVE SUMMARY
    // ===================================

    await set(
      ref(
        database,
        `HourlySummaries/${date}/${hour}/${lineId}`,
      ),

      summary,
    );

    console.log(
      `✓ Generated hourly summary for ${lineId} at ${hour}:00`,
    );

    return true;

  } catch (error) {

    console.error(
      "Error generating hourly summary:",
      error,
    );

    return false;
  }
}

// ===============================================
// GET HOURLY SUMMARIES
// ===============================================

export async function getHourlySummariesForLine(

  lineId: string,

  date: string,
): Promise<HourlySummary[]> {

  try {

    const summariesRef = ref(
      database,
      `HourlySummaries/${date}`,
    );

    const snapshot =
      await get(summariesRef);

    if (
      !snapshot.exists()
    ) {
      return [];
    }

    const data =
      snapshot.val() as Record<
        string,
        Record<
          string,
          HourlySummary
        >
      >;

    const summaries:
      HourlySummary[] = [];

    Object.values(data)
      .forEach(
        (hourData) => {

          if (
            hourData[lineId]
          ) {

            summaries.push(
              hourData[
                lineId
              ]
            );
          }
        }
      );

    return summaries.sort(
      (a, b) =>
        parseInt(a.hour) -
        parseInt(b.hour),
    );

  } catch (error) {

    console.error(
      "Error fetching hourly summaries:",
      error,
    );

    return [];
  }
}

// ===============================================
// GET DAILY SUMMARY
// ===============================================

export async function getDailySummary(

  lineId: string,

  date: string,
) {

  try {

    const summaries =
      await getHourlySummariesForLine(
        lineId,
        date,
      );

    if (
      summaries.length === 0
    ) {
      return null;
    }

    const totalOutput =
      summaries.reduce(
        (sum, s) =>
          sum +
          s.hourlyOutput,
        0,
      );

    const totalTarget =
      summaries.reduce(
        (sum, s) =>
          sum +
          s.hourlyTarget,
        0,
      );

    const completionPercentage =
      totalTarget > 0
        ? Math.round(
            (
              totalOutput /
              totalTarget
            ) * 100
          )
        : 0;

    const totalDowntime =
      summaries.reduce(
        (sum, s) =>
          sum +
          s.downtimeMinutes,
        0,
      );

    const avgEfficiency =
      Math.round(
        summaries.reduce(
          (sum, s) =>
            sum +
            s.efficiency,
          0,
        ) /
        summaries.length,
      );

    const machineId =
      summaries[0].machineId;

    const productCode =
      summaries[0].productCode;

    return {

      date,

      floorId:
        "default",

      lineId,

      machineId,

      productCode,

      totalOutput,

      totalTarget,

      completionPercentage,

      totalDowntime,

      averageEfficiency:
        avgEfficiency,

      hourlyBreakdown:
        Object.fromEntries(
          summaries.map(
            (s) => [
              s.hour,
              s,
            ]
          ),
        ),
    };

  } catch (error) {

    console.error(
      "Error fetching daily summary:",
      error,
    );

    return null;
  }
}

// ===============================================
// GET ALL FLOOR SUMMARIES
// ===============================================

export async function getAllFloorSummaries(

  date: string,
): Promise<
  Record<
    string,
    HourlySummary[]
  >
> {

  try {

    const summariesRef = ref(
      database,
      `HourlySummaries/${date}`,
    );

    const snapshot =
      await get(summariesRef);

    if (
      !snapshot.exists()
    ) {
      return {};
    }

    const data =
      snapshot.val() as Record<
        string,
        Record<
          string,
          HourlySummary
        >
      >;

    const result:
      Record<
        string,
        HourlySummary[]
      > = {};

    Object.values(data)
      .forEach(
        (hourData) => {

          Object.entries(
            hourData
          ).forEach(
            ([
              lineId,
              summary,
            ]) => {

              if (
                !result[
                  lineId
                ]
              ) {

                result[
                  lineId
                ] = [];
              }

              result[
                lineId
              ].push(
                summary
              );
            }
          );
        }
      );

    return result;

  } catch (error) {

    console.error(
      "Error fetching floor summaries:",
      error,
    );

    return {};
  }
}

