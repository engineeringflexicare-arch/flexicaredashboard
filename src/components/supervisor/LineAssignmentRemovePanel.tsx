import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { database } from "../../services/firebase";

// ===============================================
// TYPES
// ===============================================

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

export default function LineAssignmentRemovePanel() {
  // ===========================================
  // STATES
  // ===========================================
  const [lines, setLines] = useState<Record<string, LineData>>({});
  const [selectedLine, setSelectedLine] = useState("");
  const [message, setMessage] = useState("");

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

    return () => {
      unsubscribeLines();
    };
  }, []);

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

      setSelectedLine("");
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
    <div className="bg-white rounded-3xl border border-gray-200 p-6">
      {/* HEADER */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Remove Line Assignment
      </h2>

      {/* MESSAGE */}
      {message && (
        <div className="mb-5 p-4 rounded-2xl bg-red-100 text-red-700">
          {message}
        </div>
      )}

      {/* FORM */}
      <div className="flex flex-col gap-4">
        {/* LINE SELECTOR */}
        <select
          value={selectedLine}
          onChange={(e) => setSelectedLine(e.target.value)}
          className="border border-gray-300 rounded-2xl px-4 py-3 w-full md:w-1/2"
        >
          <option value="">Select Line to Remove</option>
          {Object.keys(lines).map((lineKey) => (
            <option key={lineKey} value={lineKey}>
              {lineKey}
            </option>
          ))}
        </select>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={removeAssignment}
          className="w-full md:w-1/2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-semibold"
        >
          Remove Assignment
        </button>
      </div>
    </div>
  );
}
