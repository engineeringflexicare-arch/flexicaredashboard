import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

// Admin SDK ආරම්භ කිරීම
admin.initializeApp();
const db = admin.database();

/**
 * සෑම පැයකටම වරක් (මිනිත්තු 00 දී) ක්‍රියාත්මක වේ.
 * Timezone: Asia/Colombo
 */
export const scheduledHourlySummary = functions.scheduler.onSchedule(
  {
    schedule: "0 * * * *",
    timeZone: "Asia/Colombo",
    region: "asia-southeast1", // අවශ්‍ය නම් මෙය වෙනස් කළ හැක
  },
  async () => {
    try {
      console.log("Starting automated hourly summary generation...");

      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { timeZone: "Asia/Colombo" };
      const localNow = new Date(now.toLocaleString("en-US", options));

      const dateKey = localNow.toISOString().split("T")[0]; // YYYY-MM-DD
      const currentHour = String(localNow.getHours()).padStart(2, "0");

      // පෙර පැය ගණනය කිරීම
      const prevHourDate = new Date(localNow);
      prevHourDate.setHours(localNow.getHours() - 1);
      const prevHour = String(prevHourDate.getHours()).padStart(2, "0");
      const prevDateKey = prevHourDate.toISOString().split("T")[0];

      // 1. සියලුම Lines ලබා ගැනීම
      const linesSnapshot = await db.ref("Lines").once("value");
      if (!linesSnapshot.exists()) {
        console.log("No lines found. Exiting.");
        return;
      }

      const lines = linesSnapshot.val();

      // 2. සෑම Line එකක් සඳහාම ක්‍රියාවලිය සිදු කිරීම
      for (const lineKey in lines) {
        const line = lines[lineKey];
        if (!line.machineId) continue;

        // Current Count ලබා ගැනීම
        const machineSnapshot = await db.ref(`Machines/${line.machineId}/LiveStatus/Count`).once("value");
        const currentCount = machineSnapshot.exists() ? machineSnapshot.val() : 0;

        // පෙර පැයේ අවසාන Count එක ලබා ගැනීම
        const prevHourSnapshot = await db.ref(`HourlySummaries/${prevDateKey}/${prevHour}/${lineKey}/totalCountAtEndOfHour`).once("value");
        const prevOutputTotal = prevHourSnapshot.exists() ? prevHourSnapshot.val() : 0;

        // ගණනය කිරීම්
        const hourlyOutput = Math.max(0, currentCount - prevOutputTotal);
        const hourlyTarget = line.hourlyTarget || 0;
        const completionPercentage = hourlyTarget > 0 ? Math.round((hourlyOutput / hourlyTarget) * 100) : 0;
        const averageCycleTime = hourlyOutput > 0 ? Math.round((3600 / hourlyOutput) * 1000) : 0;

        // Database එකට Save කිරීම සඳහා දත්ත සැකසීම
        const summaryData = {
          date: dateKey,
          hour: currentHour,
          lineId: lineKey,
          machineId: line.machineId,
          productCode: line.productCode || "",
          hourlyOutput: hourlyOutput,
          totalCountAtEndOfHour: currentCount,
          hourlyTarget: hourlyTarget,
          completionPercentage: completionPercentage,
          averageCycleTime: averageCycleTime,
          plannedMembers: line.plannedMembers || 0,
          timestamp: admin.database.ServerValue.TIMESTAMP
        };

        // අදාළ පැය සඳහා Firebase හි සේව් කිරීම
        await db.ref(`HourlySummaries/${dateKey}/${currentHour}/${lineKey}`).set(summaryData);
        console.log(`✓ Saved hourly summary for ${lineKey} at ${currentHour}:00`);
      }

      console.log("Successfully generated all hourly summaries.");
    } catch (error) {
      console.error("Error generating automated hourly summary:", error);
    }
  }
);