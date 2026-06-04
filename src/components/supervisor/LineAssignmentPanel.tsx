import { useEffect, useState } from "react";
import { Factory, Save, Package, Users, Target, Cpu } from "lucide-react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../../services/firebase";
import type { LineData } from "../../types/production";

// ===============================================
// MACHINE TYPE
// ===============================================
interface MachineData {
  LiveStatus?: {
    Count?: number;
  };
}

// ===============================================
// HARDCODED LINES
// ===============================================
const availableLines = ["Line_01", "Line_02", "Line_03", "Line_04", "Line_05", "Line_06", "Line_07", "Line_08"];

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
  const [hourlyTarget, setHourlyTarget] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [totalProductCount, setTotalProductCount] = useState("");
  const [shift, setShift] = useState("Day");
  const [supervisor, setSupervisor] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ===========================================
  // LOAD DATA
  // ===========================================
  useEffect(() => {
    // LOAD LINES
    const linesRef = ref(database, "Lines");

    const unsubscribeLines = onValue(linesRef, (snapshot) => {
      if (snapshot.exists()) {
        setLines(snapshot.val() as Record<string, LineData>);
      } else {
        setLines({});
      }
    });

    // LOAD MACHINES FROM ROOT
    const machinesRef = ref(database);

    const unsubscribeMachines = onValue(machinesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setMachines({});
        return;
      }

      const data = snapshot.val();

      const machineData: Record<string, MachineData> = {};

      Object.keys(data).forEach((key) => {
        if (key.startsWith("Machine_")) {
          machineData[key] = data[key];
        }
      });

      setMachines(machineData);
    });

    return () => {
      unsubscribeLines();
      unsubscribeMachines();
    };
  }, []);

  useEffect(() => {
    console.log("Machines Loaded:", machines);
  }, [machines]);
  // ===========================================
  // SAVE ASSIGNMENT
  // ===========================================
  const handleSaveAssignment = async () => {
    if (!selectedLine || !selectedMachine || !productCode) {
      setMessage("Please fill required fields");
      return;
    }

    try {
      setLoading(true);

      await update(ref(database, `Lines/${selectedLine}`), {
        machineId: selectedMachine,
        floor: selectedFloor,
        productCode,
        dailyTarget: Number(dailyTarget),
        hourlyTarget: Number(hourlyTarget),
        plannedMembers: Number(teamMembers),
        totalProductCount: Number(totalProductCount),
        shift,
        supervisor,
        assignedDate: new Date().toISOString(),
        productionStartTime: new Date().toLocaleTimeString(),
      });

      setMessage("✓ Assignment saved successfully");

      window.setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setMessage("Failed to save assignment");
    } finally {
      setLoading(false);
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
        shadow-sm
        p-6
      "
    >
      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-3 rounded-2xl">
          <Factory className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Line Assignment Panel</h2>
          <p className="text-sm text-gray-500">Assign machines and configure production lines</p>
        </div>
      </div>

      {/* =================================== */}
      {/* MESSAGE */}
      {/* =================================== */}
      {message && (
        <div
          className={`
            mb-5
            rounded-2xl
            p-4
            border
            text-sm
            ${message.includes("✓") ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}
          `}
        >
          {message}
        </div>
      )}

      {/* =================================== */}
      {/* FORM */}
      {/* =================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* LINE */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Production Line</label>
          <select
            value={selectedLine}
            onChange={(e) => {
              const lineKey = e.target.value;
              setSelectedLine(lineKey);

              const lineData = lines[lineKey];
              if (!lineData) return;

              setSelectedMachine(lineData.machineId || "");
              setSelectedFloor(lineData.floor || "Manufacturing_Floor");
              setProductCode(lineData.productCode || "");
              setDailyTarget(String(lineData.dailyTarget || ""));
              setHourlyTarget(String(lineData.hourlyTarget || ""));
              setTeamMembers(String(lineData.plannedMembers || ""));
              setTotalProductCount(String(lineData.totalProductCount || ""));
              setShift(lineData.shift || "Day");
              setSupervisor(lineData.supervisor || "");
            }}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3"
          >
            <option value="">Select Line</option>
            {availableLines.map((lineKey) => (
              <option key={lineKey} value={lineKey}>
                {lineKey}
              </option>
            ))}
          </select>
        </div>

        {/* FLOOR */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Floor</label>
          <select value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-3">
            <option value="Manufacturing_Floor">Manufacturing Floor</option>
            <option value="Assembly_Floor">Assembly Floor</option>
          </select>
        </div>

        {/* MACHINE */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Cpu size={16} className="text-orange-600" />
            Machine
          </label>
          <select value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-3">
            <option value="">Select Machine</option>

            {Object.keys(machines).map((machineKey) => (
              <option key={machineKey} value={machineKey}>
                {machineKey}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Package size={16} className="text-purple-600" />
            Product Code
          </label>
          <input type="text" value={productCode} onChange={(e) => setProductCode(e.target.value)} placeholder="Enter product code" className="w-full border border-gray-300 rounded-2xl px-4 py-3" />
        </div>

        {/* DAILY TARGET */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Target size={16} className="text-green-600" />
            Daily Target
          </label>
          <input type="number" value={dailyTarget} onChange={(e) => setDailyTarget(e.target.value)} placeholder="Daily target" className="w-full border border-gray-300 rounded-2xl px-4 py-3" />
        </div>

        {/* HOURLY TARGET */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Target</label>
          <input type="number" value={hourlyTarget} onChange={(e) => setHourlyTarget(e.target.value)} placeholder="Hourly target" className="w-full border border-gray-300 rounded-2xl px-4 py-3" />
        </div>

        {/* TEAM MEMBERS */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Users size={16} className="text-blue-600" />
            Team Members
          </label>
          <input type="number" value={teamMembers} onChange={(e) => setTeamMembers(e.target.value)} placeholder="Number of members" className="w-full border border-gray-300 rounded-2xl px-4 py-3" />
        </div>

        {/* TOTAL PRODUCT COUNT */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Total Product Count</label>
          <input
            type="number"
            value={totalProductCount}
            onChange={(e) => setTotalProductCount(e.target.value)}
            placeholder="Total products"
            className="w-full border border-gray-300 rounded-2xl px-4 py-3"
          />
        </div>

        {/* SHIFT */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Shift</label>
          <select value={shift} onChange={(e) => setShift(e.target.value)} className="w-full border border-gray-300 rounded-2xl px-4 py-3">
            <option value="Day">Day Shift</option>
            <option value="Night">Night Shift</option>
          </select>
        </div>

        {/* SUPERVISOR */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Supervisor</label>
          <input type="text" value={supervisor} onChange={(e) => setSupervisor(e.target.value)} placeholder="Supervisor name" className="w-full border border-gray-300 rounded-2xl px-4 py-3" />
        </div>
      </div>

      {/* =================================== */}
      {/* BUTTON */}
      {/* =================================== */}
      <div className="mt-6">
        <button
          onClick={handleSaveAssignment}
          disabled={loading}
          className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            disabled:bg-gray-400
            text-white
            font-semibold
            py-4
            rounded-2xl
            transition
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <Save size={20} />
          {loading ? "Saving..." : "Save Assignment"}
        </button>
      </div>
    </div>
  );
}
