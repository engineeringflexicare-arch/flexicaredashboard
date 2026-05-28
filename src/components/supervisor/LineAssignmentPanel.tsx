import { useEffect, useState } from "react";

import { ref, onValue, update } from "firebase/database";

import { database } from "../../services/firebase";

// ===============================================
// TYPES
// ===============================================

interface MachineData {
  status?: string;

  machineState?: string;
}

interface LineData {
  machineId?: string;

  productCode?: string;

  dailyTarget?: number;

  plannedMembers?: number;

  totalProductCount?: number;

  floor?: string;
}

// ===============================================
// COMPONENT
// ===============================================

export default function LineAssignmentPanel() {
  // ===========================================
  // STATES
  // ===========================================

  const [lines, setLines] = useState<Record<string, LineData>>({});

  const [machines, setMachines] = useState<Record<string, MachineData>>({});

  const [selectedLine, setSelectedLine] = useState("");

  const [selectedMachine, setSelectedMachine] = useState("");

  const [selectedFloor, setSelectedFloor] = useState("Manufacturing_Floor");

  const [productCode, setProductCode] = useState("");

  const [dailyTarget, setDailyTarget] = useState("");

  const [teamMembers, setTeamMembers] = useState("");

  const [totalProductCount, setTotalProductCount] = useState("");

  const [message, setMessage] = useState("");

  // ===========================================
  // LOAD FIREBASE DATA
  // ===========================================

  useEffect(() => {
    const linesRef = ref(database, "Lines");

    const machinesRef = ref(database, "Machines");

    const unsubscribeLines = onValue(linesRef, (snapshot) => {
      if (snapshot.exists()) {
        setLines(snapshot.val() as Record<string, LineData>);
      } else {
        setLines({});
      }
    });

    const unsubscribeMachines = onValue(machinesRef, (snapshot) => {
      if (snapshot.exists()) {
        setMachines(snapshot.val() as Record<string, MachineData>);
      } else {
        setMachines({});
      }
    });

    return () => {
      unsubscribeLines();

      unsubscribeMachines();
    };
  }, []);

  // ===========================================
  // HANDLE LINE CHANGE
  // ===========================================

  const handleLineChange = (lineKey: string) => {
    setSelectedLine(lineKey);

    const lineData = lines[lineKey];

    if (!lineData) {
      setSelectedMachine("");

      setProductCode("");

      setDailyTarget("");

      setTeamMembers("");

      setTotalProductCount("");

      setSelectedFloor("Manufacturing_Floor");

      return;
    }

    setSelectedMachine(lineData.machineId || "");

    setProductCode(lineData.productCode || "");

    setDailyTarget(String(lineData.dailyTarget || ""));

    setTeamMembers(String(lineData.plannedMembers || ""));

    setTotalProductCount(String(lineData.totalProductCount || ""));

    setSelectedFloor(lineData.floor || "Manufacturing_Floor");
  };

  // ===========================================
  // SAVE ASSIGNMENT
  // ===========================================

  const saveAssignment = async () => {
    if (!selectedLine || !selectedMachine) {
      setMessage("Select line and machine");

      return;
    }

    try {
      await update(ref(database, `Lines/${selectedLine}`), {
        machineId: selectedMachine,

        productCode,

        dailyTarget: Number(dailyTarget),

        plannedMembers: Number(teamMembers),

        totalProductCount: Number(totalProductCount),

        floor: selectedFloor,
      });

      setMessage("✓ Line assignment saved");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);

      setMessage("Save failed");
    }
  };

  // ===========================================
  // REMOVE ASSIGNMENT
  // ===========================================

  const removeAssignment = async () => {
    if (!selectedLine) {
      setMessage("Select line");

      return;
    }

    try {
      await update(ref(database, `Lines/${selectedLine}`), {
        machineId: "",

        productCode: "",

        dailyTarget: 0,

        plannedMembers: 0,

        totalProductCount: 0,

        floor: "",
      });

      setSelectedMachine("");

      setProductCode("");

      setDailyTarget("");

      setTeamMembers("");

      setTotalProductCount("");

      setMessage("✓ Assignment removed");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);

      setMessage("Remove failed");
    }
  };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div
      className="
        bg-white
        rounded-3xl
        border
        border-gray-200
        p-6
      "
    >
      {/* HEADER */}

      <h2
        className="
          text-2xl
          font-bold
          text-gray-800
          mb-6
        "
      >
        Line Assignment
      </h2>

      {/* MESSAGE */}

      {message && (
        <div
          className="
            mb-5
            p-4
            rounded-2xl
            bg-blue-100
            text-blue-700
          "
        >
          {message}
        </div>
      )}

      {/* FORM */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          gap-4
        "
      >
        {/* FLOOR */}

        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="
            border
            border-gray-300
            rounded-2xl
            px-4
            py-3
          "
        >
          <option value="Manufacturing_Floor">Manufacturing Floor</option>

          <option value="Assembly_Floor">Assembly Floor</option>
        </select>

        {/* LINE */}

        <select
          value={selectedLine}
          onChange={(e) => handleLineChange(e.target.value)}
          className="
            border
            border-gray-300
            rounded-2xl
            px-4
            py-3
          "
        >
          <option value="">Select Line</option>

          {Object.keys(lines).map((lineKey) => (
            <option key={lineKey} value={lineKey}>
              {lineKey}
            </option>
          ))}
        </select>

        {/* MACHINE */}

        <select
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
          className="
            border
            border-gray-300
            rounded-2xl
            px-4
            py-3
          "
        >
          <option value="">Select Machine</option>

          {Object.keys(machines).map((machineKey) => (
            <option key={machineKey} value={machineKey}>
              {machineKey}
            </option>
          ))}
        </select>

        {/* PRODUCT CODE */}

        <input
          type="text"
          value={productCode}
          onChange={(e) => setProductCode(e.target.value)}
          placeholder="Product Code"
          className="
            border
            border-gray-300
            rounded-2xl
            px-4
            py-3
          "
        />

        {/* DAILY TARGET */}

        <input
          type="number"
          value={dailyTarget}
          onChange={(e) => setDailyTarget(e.target.value)}
          placeholder="Daily Target"
          className="
            border
            border-gray-300
            rounded-2xl
            px-4
            py-3
          "
        />

        {/* TEAM MEMBERS */}

        <input
          type="number"
          value={teamMembers}
          onChange={(e) => setTeamMembers(e.target.value)}
          placeholder="Team Members"
          className="
            border
            border-gray-300
            rounded-2xl
            px-4
            py-3
          "
        />

        {/* TOTAL PRODUCT COUNT */}

        <input
          type="number"
          value={totalProductCount}
          onChange={(e) => setTotalProductCount(e.target.value)}
          placeholder="Total Product Count"
          className="
            border
            border-gray-300
            rounded-2xl
            px-4
            py-3
          "
        />
      </div>

      {/* BUTTONS */}

      <div
        className="
          flex
          gap-4
          mt-6
        "
      >
        <button
          onClick={saveAssignment}
          className="
            flex-1
            bg-blue-600
            hover:bg-blue-700
            text-white
            py-3
            rounded-2xl
            font-semibold
          "
        >
          Save Assignment
        </button>

        <button
          onClick={removeAssignment}
          className="
            flex-1
            bg-red-600
            hover:bg-red-700
            text-white
            py-3
            rounded-2xl
            font-semibold
          "
        >
          Remove Assignment
        </button>
      </div>

      {/* CURRENT ASSIGNMENTS */}

      <div className="mt-8">
        <h3
          className="
            font-bold
            text-gray-800
            mb-4
          "
        >
          Current Assignments
        </h3>

        <div className="space-y-3">
          {Object.entries(lines).map(([lineKey, line]) => (
            <div
              key={lineKey}
              className="
                  bg-gray-100
                  rounded-2xl
                  p-4
                "
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-bold text-gray-800">{lineKey}</p>

                  <p className="text-sm text-gray-500 mt-1">
                    {line.productCode}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-blue-600">
                    {line.machineId || "No Machine"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">{line.floor}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-gray-500">Daily Target</p>

                  <p className="font-bold text-gray-800">
                    {line.dailyTarget || 0}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-gray-500">Team</p>

                  <p className="font-bold text-gray-800">
                    {line.plannedMembers || 0}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-3">
                  <p className="text-xs text-gray-500">Total Qty</p>

                  <p className="font-bold text-gray-800">
                    {line.totalProductCount || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
