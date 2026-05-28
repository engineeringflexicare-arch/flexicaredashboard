import { useEffect, useState } from "react";

import { ref, onValue } from "firebase/database";

import { database } from "../../services/firebase";

// ===============================================
// TYPES
// ===============================================

interface MachineSelectorProps {
  value: string;

  onChange: (value: string) => void;

  selectedFloor?: string;

  currentLine: string;
}

interface MachineData {
  assignedLine?: string;

  machineState?: string;

  status?: string;

  LiveStatus?: {
    Count?: number;
  };

  heartbeat?: number;
}

// ===============================================
// COMPONENT
// ===============================================

export default function MachineSelector({
  value,

  onChange,

  currentLine,
}: MachineSelectorProps) {
  // ===========================================
  // STATE
  // ===========================================

  const [machines, setMachines] = useState<Record<string, MachineData>>({});

  // ===========================================
  // LOAD MACHINES
  // ===========================================

  useEffect(() => {
    const machinesRef = ref(database, "Machines");

    const unsubscribe = onValue(
      machinesRef,

      (snapshot) => {
        if (snapshot.exists()) {
          const raw = snapshot.val();

          setMachines(raw as Record<string, MachineData>);
        } else {
          setMachines({});
        }
      },
    );

    return () => unsubscribe();
  }, []);

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Machine Selection
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          border
          border-gray-300
          focus:border-blue-500
          focus:ring-2
          focus:ring-blue-200
          outline-none
          p-3
          rounded-2xl
          w-full
          bg-white
        "
      >
        <option value="">Select Machine</option>

        {Object.entries(machines).map(([machineKey, machine]) => {
          // ===================================
          // MACHINE STATUS
          // ===================================

          const isRunning =
            machine.machineState === "running" || machine.status === "running";

          const assignedToAnotherLine = Boolean(
            machine.assignedLine && machine.assignedLine !== currentLine,
          );

          const isLocked = isRunning && assignedToAnotherLine;

          const currentCount = machine.LiveStatus?.Count || 0;

          // ===================================
          // OPTION
          // ===================================

          return (
            <option key={machineKey} value={machineKey} disabled={isLocked}>
              {machineKey}

              {currentCount > 0 ? ` (${currentCount})` : ""}

              {isLocked ? " - In Use" : ""}
            </option>
          );
        })}
      </select>
    </div>
  );
}
