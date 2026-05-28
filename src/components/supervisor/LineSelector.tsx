import { useEffect, useState } from "react";

import { ref, onValue } from "firebase/database";

import { database } from "../../services/firebase";

// ===============================================
// TYPES
// ===============================================

interface LineSelectorProps {
  value: string;

  onChange: (value: string) => void;

  floor?: string;
}

// ===============================================
// DEFAULT LINES
// ===============================================

const defaultLines = ["Line_01", "Line_02", "Line_03", "Line_04"];

// ===============================================
// COMPONENT
// ===============================================

export default function LineSelector({
  value,

  onChange,
}: LineSelectorProps) {
  // ===========================================
  // STATES
  // ===========================================

  const [lines, setLines] = useState<string[]>(defaultLines);

  // ===========================================
  // FIREBASE LISTENER
  // ===========================================

  useEffect(() => {
    // ESP DATABASE STRUCTURE

    const linesRef = ref(database, "Lines");

    const unsubscribe = onValue(
      linesRef,

      (snapshot) => {
        if (!snapshot.exists()) {
          setLines(defaultLines);

          return;
        }

        const data = snapshot.val() as Record<string, unknown>;

        setLines(Object.keys(data));
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
        Production Line
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-2xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select Line</option>

        {lines.map((line) => (
          <option key={line} value={line}>
            {line.replace("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
