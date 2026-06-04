import { useEffect, useState } from "react";

import { ref, onValue } from "firebase/database";

import { database } from "../services/firebase";

import ResetCountPanel from "../components/supervisor/ResetCountPanel";

import MaintenanceAlertPanel from "../components/supervisor/MaintenanceAlertPanel";

import EmergencyReassignmentPanel from "../components/supervisor/EmergencyReassignmentPanel";

import LineAssignmentPanel from "../components/supervisor/LineAssignmentPanel";

import LineAssignmentRemovePanel from "../components/supervisor/LineAssignmentRemovePanel";

import type { LineData } from "../types/production";

// ===============================================
// COMPONENT
// ===============================================

export default function Supervisor() {
  // ===========================================
  // STATES
  // ===========================================

  const [selectedFloor, setSelectedFloor] = useState("Manufacturing_Floor");

  const [lines, setLines] = useState<Record<string, LineData>>({});

  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

  const [activePanel, setActivePanel] = useState("assignment");

  // ===========================================
  // LOAD DATA
  // ===========================================

  useEffect(() => {
    // =======================================
    // LOAD LINES
    // =======================================

    const linesRef = ref(database, "Lines");

    const unsubscribeLines = onValue(
      linesRef,

      (snapshot) => {
        if (snapshot.exists()) {
          setLines(snapshot.val() as Record<string, LineData>);
        } else {
          setLines({});
        }
      },
    );

    // =======================================
    // LOAD MACHINES
    // =======================================

    const machinesRef = ref(database);

    const unsubscribeMachines = onValue(machinesRef, (snapshot) => {
      const counts: Record<string, number> = {};

      if (snapshot.exists()) {
        const data = snapshot.val();

        Object.keys(data).forEach((key) => {
          if (key.startsWith("Machine_")) {
            counts[key] = Number(data[key]?.LiveStatus?.Count || 0);
          }
        });
      }

      console.log("Live Counts:", counts);

      setLiveCounts(counts);
    });

    // =======================================
    // CLEANUP
    // =======================================

    return () => {
      unsubscribeLines();

      unsubscribeMachines();
    };
  }, []);

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="space-y-8">
      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          p-6
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
          "
        >
          <div>
            <h2
              className="
                text-3xl
                font-bold
                text-gray-800
              "
            >
              Supervisor Control Center
            </h2>

            <p className="text-gray-500 mt-2">Manage production lines, maintenance, machine assignments and reset operations.</p>
          </div>

          {/* FLOOR SELECT */}

          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="
              border
              border-gray-300
              rounded-2xl
              px-4
              py-3
              w-full
              md:w-80
              bg-white
              focus:outline-none
              focus:ring-2
              focus:ring-blue-200
              focus:border-blue-500
            "
          >
            <option value="Manufacturing_Floor">Manufacturing Floor</option>

            <option value="Assembly_Floor">Assembly Floor</option>
          </select>
        </div>
      </div>

      {/* =================================== */}
      {/* NAVIGATION */}
      {/* =================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          p-5
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-wrap
            gap-3
          "
        >
          {/* LINE ASSIGNMENT */}

          <button
            onClick={() => setActivePanel("assignment")}
            className={`
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition-all
              border
              ${
                activePanel === "assignment"
                  ? `
                    bg-blue-600
                    text-white
                    border-blue-600
                  `
                  : `
                    bg-white
                    text-gray-700
                    border-gray-200
                  `
              }
            `}
          >
            Line Assignment
          </button>

          {/* REMOVE ASSIGNMENT */}

          <button
            onClick={() => setActivePanel("remove")}
            className={`
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition-all
              border
              ${
                activePanel === "remove"
                  ? `
                    bg-blue-600
                    text-white
                    border-blue-600
                  `
                  : `
                    bg-white
                    text-gray-700
                    border-gray-200
                  `
              }
            `}
          >
            Remove Assignment
          </button>

          {/* RESET */}

          <button
            onClick={() => setActivePanel("reset")}
            className={`
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition-all
              border
              ${
                activePanel === "reset"
                  ? `
                    bg-blue-600
                    text-white
                    border-blue-600
                  `
                  : `
                    bg-white
                    text-gray-700
                    border-gray-200
                  `
              }
            `}
          >
            Reset Counts
          </button>

          {/* MAINTENANCE */}

          <button
            onClick={() => setActivePanel("maintenance")}
            className={`
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition-all
              border
              ${
                activePanel === "maintenance"
                  ? `
                    bg-blue-600
                    text-white
                    border-blue-600
                  `
                  : `
                    bg-white
                    text-gray-700
                    border-gray-200
                  `
              }
            `}
          >
            Maintenance
          </button>

          {/* EMERGENCY */}

          <button
            onClick={() => setActivePanel("emergency")}
            className={`
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition-all
              border
              ${
                activePanel === "emergency"
                  ? `
                    bg-blue-600
                    text-white
                    border-blue-600
                  `
                  : `
                    bg-white
                    text-gray-700
                    border-gray-200
                  `
              }
            `}
          >
            Emergency
          </button>
        </div>
      </div>

      {/* =================================== */}
      {/* ACTIVE PANEL */}
      {/* =================================== */}

      <div>
        {/* LINE ASSIGNMENT */}

        {activePanel === "assignment" && <LineAssignmentPanel />}

        {/* REMOVE ASSIGNMENT */}

        {activePanel === "remove" && <LineAssignmentRemovePanel />}

        {/* RESET PANEL */}

        {activePanel === "reset" && <ResetCountPanel lines={lines} liveCounts={liveCounts} />}

        {/* MAINTENANCE */}

        {activePanel === "maintenance" && <MaintenanceAlertPanel lines={lines} />}

        {/* EMERGENCY */}

        {activePanel === "emergency" && <EmergencyReassignmentPanel lines={lines} />}
      </div>
    </div>
  );
}
