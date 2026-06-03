import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

// Admin SDK ආරම්භ කිරීම
admin.initializeApp();
const db = admin.database();

/**
 * මෙම ක්‍රියාවලිය සෑම පැයකටම වරක් හරියටම මිනිත්තු 00 දී ක්‍රියාත්මක වේ.
 */
export const scheduledHourlySummary = onSchedule(
  {
    schedule: "0 * * * *",
    timeZone: "Asia/Colombo",
  },
  async () => {
    try {
      console.log("Starting automated hourly summary generation...");

      const now = new Date();
      // ලංකාවේ වේලාවට අනුව දවස සහ පැය ලබා ගැනීම
      const options = { timeZone: "Asia/Colombo" };
      const localNow = new Date(now.toLocaleString("en-US", options));
      
      const dateKey = localNow.toISOString().split("T")[0]; // YYYY-MM-DD
      const currentHour = String(localNow.getHours()).padStart(2, "0");
      const prevHour = String((localNow.getHours() - 1 + 24) % 24).padStart(2, "0");

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

        const machineSnapshot = await db.ref(`Machines/${line.machineId}/LiveStatus/Count`).once("value");
        const currentCount = machineSnapshot.exists() ? machineSnapshot.val() : 0;

        const prevHourSnapshot = await db.ref(`HourlySummaries/${dateKey}/${prevHour}/${lineKey}/hourlyOutput`).once("value");
        const prevOutput = prevHourSnapshot.exists() ? prevHourSnapshot.val() : 0;

        const hourlyOutput = Math.max(0, currentCount - prevOutput); 
        const hourlyTarget = line.hourlyTarget || 0;
        const completionPercentage = hourlyTarget > 0 ? Math.round((hourlyOutput / hourlyTarget) * 100) : 0;
        const averageCycleTime = hourlyOutput > 0 ? Math.round((3600 / hourlyOutput) * 1000) : 0;

        const summaryData = {
          date: dateKey,
          hour: currentHour,
          lineId: lineKey,
          machineId: line.machineId,
          productCode: line.productCode || "",
          hourlyOutput: hourlyOutput,
          hourlyTarget: hourlyTarget,
          completionPercentage: completionPercentage,
          averageCycleTime: averageCycleTime,
          plannedMembers: line.plannedMembers || 0,
          timestamp: admin.database.ServerValue.TIMESTAMP 
        };

        await db.ref(`HourlySummaries/${dateKey}/${currentHour}/${lineKey}`).set(summaryData);
        console.log(`✓ Saved hourly summary for ${lineKey} at ${currentHour}:00`);
      }

      console.log("Successfully generated all hourly summaries.");

    } catch (error) {
      console.error("Error generating automated hourly summary:", error);
    }
  }
);