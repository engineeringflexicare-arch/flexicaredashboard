import { useEffect, useState } from "react";

import { ref, onValue, remove, update } from "firebase/database";

import { database } from "../../services/firebase";

import ResetCountPanel from "./ResetCountPanel";

import MaintenanceAlertPanel from "./MaintenanceAlertPanel";

import EmergencyReassignmentPanel from "./EmergencyReassignmentPanel";

import type { LineData } from "../../types/production";

// ===============================================
// COMPONENT
// ===============================================

export default function SupervisorForm() {
  // ===========================================
  // STATES
  // ===========================================

  const [selectedFloor, setSelectedFloor] = useState("Manufacturing_Floor");

  const [lines, setLines] = useState<Record<string, LineData>>({});

  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

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

    const machinesRef = ref(database, "Machines");

    const unsubscribeMachines = onValue(
      machinesRef,

      (snapshot) => {
        const counts: Record<string, number> = {};

        if (snapshot.exists()) {
          const machines = snapshot.val() as Record<
            string,
            {
              LiveStatus?: {
                Count?: number;
              };
            }
          >;

          Object.entries(machines).forEach(([machineKey, machine]) => {
            counts[machineKey] = Number(machine?.LiveStatus?.Count || 0);
          });
        }

        setLiveCounts(counts);
      },
    );

    // =======================================
    // CLEANUP
    // =======================================

    return () => {
      unsubscribeLines();

      unsubscribeMachines();
    };
  }, []);

  // ===========================================
  // CLEAR LINE ASSIGNMENT
  // ===========================================

  const handleClearLine = async (lineId: string, machineId: string) => {
    const confirmed = window.confirm(`Clear ${lineId} assignment?`);

    if (!confirmed) {
      return;
    }

    try {
      // REMOVE LINE

      await remove(ref(database, `Lines/${lineId}`));

      // REMOVE ASSIGNMENT

      await remove(ref(database, `Assignments/${lineId}`));

      // REMOVE MACHINE ASSIGNMENT

      await update(ref(database, `Machines/${machineId}`), {
        assignedLine: null,
      });

      // RESET MACHINE

      await update(ref(database, `Machines/${machineId}/Control`), {
        ResetCommand: true,
      });

      alert(`${lineId} cleared successfully`);
    } catch (error) {
      console.error("Clear Line Error:", error);

      alert("Failed to clear line");
    }
  };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="space-y-8">
      {/* =================================== */}
      {/* FLOOR SELECT */}
      {/* =================================== */}

      <div className="bg-white rounded-3xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Supervisor Controls
        </h2>

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
          "
        >
          <option value="Manufacturing_Floor">Manufacturing Floor</option>

          <option value="Assembly_Floor">Assembly Floor</option>
        </select>
      </div>

      {/* =================================== */}
      {/* CURRENT ASSIGNMENTS */}
      {/* =================================== */}

      <div className="bg-white rounded-3xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Current Assignments
        </h2>

        <div className="space-y-4">
          {Object.entries(lines).length === 0 && (
            <div className="text-gray-500 text-sm">No active assignments</div>
          )}

          {Object.entries(lines).map(([lineId, line]) => (
            <div
              key={lineId}
              className="
                  border
                  border-gray-200
                  rounded-2xl
                  p-4
                  flex
                  items-center
                  justify-between
                "
            >
              <div>
                <p className="font-bold text-gray-800">{lineId}</p>

                <p className="text-sm text-gray-500 mt-1">
                  Machine: {line.machineId}
                  {" | Product: "}
                  {line.productCode}
                </p>

                <p className="text-sm text-blue-600 mt-1">
                  Current Count: {liveCounts[line.machineId] || 0}
                </p>
              </div>

              <button
                onClick={() => handleClearLine(lineId, line.machineId)}
                className="
                    bg-red-500
                    hover:bg-red-600
                    text-white
                    px-4
                    py-2
                    rounded-xl
                    text-sm
                    font-medium
                  "
              >
                Clear Assignment
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* =================================== */}
      {/* RESET PANEL */}
      {/* =================================== */}

      <ResetCountPanel lines={lines} liveCounts={liveCounts} />

      {/* =================================== */}
      {/* MAINTENANCE PANEL */}
      {/* =================================== */}

      <MaintenanceAlertPanel lines={lines} />

      {/* =================================== */}
      {/* EMERGENCY PANEL */}
      {/* =================================== */}

      <EmergencyReassignmentPanel lines={lines} />
    </div>
  );
}
