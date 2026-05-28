import { useEffect, useState } from "react";

import { ref, onValue, remove, update } from "firebase/database";

import {
  LayoutDashboard,
  Settings,
  RotateCcw,
  Wrench,
  AlertTriangle,
  Database,
} from "lucide-react";

import { database } from "../../services/firebase";

import ResetCountPanel from "./ResetCountPanel";

import MaintenanceAlertPanel from "./MaintenanceAlertPanel";

import EmergencyReassignmentPanel from "./EmergencyReassignmentPanel";

import LineAssignmentPanel from "./LineAssignmentPanel";

import ProductionDataPanel from "./ProductionDataPanel";

import type { LineData } from "../../types/production";

// ===============================================
// PANEL TYPES
// ===============================================

type PanelType =
  | "dashboard"
  | "assignment"
  | "reset"
  | "maintenance"
  | "emergency"
  | "database";

// ===============================================
// NAV BUTTON TYPES
// ===============================================

interface NavButtonProps {
  label: string;

  icon: React.ReactNode;

  panel: PanelType;

  activePanel: PanelType;

  onClick: (panel: PanelType) => void;
}

// ===============================================
// NAV BUTTON
// ===============================================

function NavButton({
  label,
  icon,
  panel,
  activePanel,
  onClick,
}: NavButtonProps) {
  return (
    <button
      onClick={() => onClick(panel)}
      className={`
        flex
        items-center
        gap-2
        px-5
        py-3
        rounded-2xl
        transition-all
        font-medium
        text-sm

        ${
          activePanel === panel
            ? "bg-blue-600 text-white shadow-lg"
            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
        }
      `}
    >
      {icon}

      {label}
    </button>
  );
}

// ===============================================
// COMPONENT
// ===============================================

export default function SupervisorForm() {
  // ===========================================
  // STATES
  // ===========================================

  const [activePanel, setActivePanel] = useState<PanelType>("dashboard");

  const [lines, setLines] = useState<Record<string, LineData>>({});

  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

  // ===========================================
  // LOAD FIREBASE DATA
  // ===========================================

  useEffect(() => {
    const linesRef = ref(database, "Lines");

    const unsubscribeLines = onValue(linesRef, (snapshot) => {
      if (snapshot.exists()) {
        setLines(snapshot.val() as Record<string, LineData>);
      } else {
        setLines({});
      }
    });

    const machinesRef = ref(database, "Machines");

    const unsubscribeMachines = onValue(machinesRef, (snapshot) => {
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
    });

    return () => {
      unsubscribeLines();

      unsubscribeMachines();
    };
  }, []);

  // ===========================================
  // CLEAR LINE
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

      // CLEAR MACHINE ASSIGNMENT

      await update(ref(database, `Machines/${machineId}`), {
        assignedLine: null,
      });

      // RESET MACHINE

      await update(ref(database, `Machines/${machineId}/Control`), {
        ResetCommand: true,
      });

      alert(`${lineId} cleared successfully`);
    } catch (error) {
      console.error(error);

      alert("Failed to clear assignment");
    }
  };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="space-y-6 w-full">
      {/* =================================== */}
      {/* TOP NAVIGATION */}
      {/* =================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          p-4
          shadow-sm
        "
      >
        <div className="flex flex-wrap gap-3">
          <NavButton
            label="Dashboard"
            panel="dashboard"
            activePanel={activePanel}
            onClick={setActivePanel}
            icon={<LayoutDashboard size={18} />}
          />

          <NavButton
            label="Line Assignment"
            panel="assignment"
            activePanel={activePanel}
            onClick={setActivePanel}
            icon={<Settings size={18} />}
          />

          <NavButton
            label="Reset Count"
            panel="reset"
            activePanel={activePanel}
            onClick={setActivePanel}
            icon={<RotateCcw size={18} />}
          />

          <NavButton
            label="Maintenance"
            panel="maintenance"
            activePanel={activePanel}
            onClick={setActivePanel}
            icon={<Wrench size={18} />}
          />

          <NavButton
            label="Emergency"
            panel="emergency"
            activePanel={activePanel}
            onClick={setActivePanel}
            icon={<AlertTriangle size={18} />}
          />

          <NavButton
            label="Database"
            panel="database"
            activePanel={activePanel}
            onClick={setActivePanel}
            icon={<Database size={18} />}
          />
        </div>
      </div>

      {/* =================================== */}
      {/* CONTENT */}
      {/* =================================== */}

      <div className="w-full">
        {/* DASHBOARD */}

        {activePanel === "dashboard" && (
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
            <h2
              className="
                text-2xl
                font-bold
                text-gray-800
                mb-6
              "
            >
              Current Assignments
            </h2>

            <div className="space-y-4">
              {Object.entries(lines).map(([lineId, line]) => (
                <div
                  key={lineId}
                  className="
                      border
                      border-gray-200
                      rounded-2xl
                      p-5
                      flex
                      items-center
                      justify-between
                    "
                >
                  <div>
                    <p
                      className="
                          text-xl
                          font-bold
                          text-gray-800
                        "
                    >
                      {lineId}
                    </p>

                    <p
                      className="
                          text-gray-500
                          mt-2
                        "
                    >
                      Machine: {line.machineId}
                      {" | Product: "}
                      {line.productCode}
                    </p>

                    <p
                      className="
                          text-blue-600
                          font-semibold
                          mt-2
                        "
                    >
                      Count: {liveCounts[line.machineId] || 0}
                    </p>
                  </div>

                  <button
                    onClick={() => handleClearLine(lineId, line.machineId)}
                    className="
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        px-5
                        py-3
                        rounded-2xl
                        font-semibold
                        transition-all
                      "
                  >
                    Clear
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSIGNMENT */}

        {activePanel === "assignment" && <LineAssignmentPanel />}

        {/* RESET */}

        {activePanel === "reset" && (
          <ResetCountPanel lines={lines} liveCounts={liveCounts} />
        )}

        {/* MAINTENANCE */}

        {activePanel === "maintenance" && (
          <MaintenanceAlertPanel lines={lines} />
        )}

        {/* EMERGENCY */}

        {activePanel === "emergency" && (
          <EmergencyReassignmentPanel lines={lines} />
        )}

        {/* DATABASE */}

        {activePanel === "database" && <ProductionDataPanel />}
      </div>
    </div>
  );
}
