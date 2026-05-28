import { useState, useEffect, useCallback } from "react";

import { RotateCcw, History } from "lucide-react";

import {
  resetMachineCount,
  getResetHistory,
} from "../../services/resetService";

import type { LineData } from "../../types/production";

import type { ResetHistoryItem } from "../../types/reset";

// ===============================================
// TYPES
// ===============================================

interface ResetCountPanelProps {
  lines: Record<string, LineData>;

  liveCounts: Record<string, number>;
}

// ===============================================
// COMPONENT
// ===============================================

export default function ResetCountPanel({
  lines,

  liveCounts,
}: ResetCountPanelProps) {
  // ===========================================
  // STATES
  // ===========================================

  const [resetHistory, setResetHistory] = useState<ResetHistoryItem[]>([]);

  const [selectedMachine, setSelectedMachine] = useState("");

  const [resetReason, setResetReason] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [supervisorName, setSupervisorName] = useState("Supervisor");

  // ===========================================
  // FETCH HISTORY
  // ===========================================

  const fetchHistory = useCallback(async () => {
    try {
      const history = await getResetHistory();

      setResetHistory(history);
    } catch (error) {
      console.error("Reset History Error:", error);
    }
  }, []);

  // ===========================================
  // LOAD HISTORY
  // ===========================================

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchHistory();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchHistory]);

  // ===========================================
  // HANDLE RESET
  // ===========================================

  const handleReset = async () => {
    if (!selectedMachine.trim() || !resetReason.trim()) {
      setMessage("Please select a machine and provide a reason");

      return;
    }

    try {
      setLoading(true);

      // =====================================
      // FIND LINE
      // =====================================

      const lineKey =
        (Object.entries(lines) as Array<[string, LineData]>).find(
          ([, line]) => line.machineId === selectedMachine,
        )?.[0] || "Unknown_Line";

      // =====================================
      // CURRENT COUNT
      // =====================================

      const currentCount = Number(liveCounts[selectedMachine] || 0);

      // =====================================
      // RESET MACHINE
      // =====================================

      const success = await resetMachineCount({
        lineId: lineKey,

        machineId: selectedMachine,

        previousCount: currentCount,

        reason: resetReason,

        supervisorName,
      });

      // =====================================
      // SUCCESS
      // =====================================

      if (success) {
        setMessage(`✓ Count reset successfully from ${currentCount} to 0`);

        setSelectedMachine("");

        setResetReason("");

        await fetchHistory();

        window.setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setMessage("Failed to reset count");
      }
    } catch (error) {
      console.error(error);

      setMessage("Error resetting count");
    } finally {
      setLoading(false);
    }
  };

  // ===========================================
  // RECENT RESETS
  // ===========================================

  const recentResets = resetHistory.slice(-5).reverse();

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="space-y-6">
      {/* =================================== */}
      {/* FORM */}
      {/* =================================== */}

      <div className="bg-white rounded-3xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-orange-100 p-3 rounded-2xl">
            <RotateCcw className="text-orange-600" size={22} />
          </div>

          <h3 className="text-xl font-bold text-gray-800">
            Reset Production Count
          </h3>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            className={`
              p-4
              rounded-2xl
              mb-5
              text-sm
              border

              ${
                message.includes("✓")
                  ? `
                    bg-green-100
                    text-green-700
                    border-green-200
                  `
                  : `
                    bg-red-100
                    text-red-700
                    border-red-200
                  `
              }
            `}
          >
            {message}
          </div>
        )}

        <div className="space-y-4">
          {/* SUPERVISOR */}

          <input
            type="text"
            value={supervisorName}
            onChange={(e) => setSupervisorName(e.target.value)}
            placeholder="Supervisor Name"
            className="
              w-full
              border
              border-gray-300
              rounded-2xl
              px-4
              py-3
            "
          />

          {/* MACHINE SELECT */}

          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="
              w-full
              border
              border-gray-300
              rounded-2xl
              px-4
              py-3
            "
          >
            <option value="">Select Machine</option>

            {Object.keys(liveCounts || {}).length === 0 ? (
              <option disabled>No Machines Found</option>
            ) : (
              Object.keys(liveCounts).map((machineId) => (
                <option key={machineId} value={machineId}>
                  {machineId}

                  {" (Count: "}

                  {Number(liveCounts[machineId] || 0)}

                  {")"}
                </option>
              ))
            )}
          </select>

          {/* RESET REASON */}

          <select
            value={resetReason}
            onChange={(e) => setResetReason(e.target.value)}
            className="
              w-full
              border
              border-gray-300
              rounded-2xl
              px-4
              py-3
            "
          >
            <option value="">Select Reason</option>

            <option value="manual-correction">Manual Correction</option>

            <option value="calibration">Calibration</option>

            <option value="end-of-shift">End of Shift</option>

            <option value="production-error">Production Error</option>

            <option value="maintenance">Maintenance</option>

            <option value="order-complete">Order Complete</option>

            <option value="quality-issue">Quality Issue</option>

            <option value="other">Other</option>
          </select>

          {/* RESET BUTTON */}

          <button
            onClick={handleReset}
            disabled={loading || !selectedMachine}
            className="
              w-full
              bg-orange-600
              hover:bg-orange-700
              disabled:bg-gray-400
              text-white
              font-semibold
              py-3
              rounded-2xl
              transition
            "
          >
            {loading ? "Resetting..." : "Reset Count to 0"}
          </button>
        </div>
      </div>

      {/* =================================== */}
      {/* HISTORY */}
      {/* =================================== */}

      {recentResets.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <History className="text-blue-600" size={22} />

            <h3 className="text-xl font-bold text-gray-800">Recent Resets</h3>
          </div>

          <div className="space-y-3">
            {recentResets.map((reset, idx) => (
              <div
                key={idx}
                className="
                    border
                    border-gray-200
                    rounded-2xl
                    p-4
                    text-sm
                  "
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {reset.machineId}

                      {" ("}

                      {reset.lineId}

                      {")"}
                    </p>

                    <p className="text-gray-600 text-xs mt-1">
                      {reset.previousCount}

                      {" → 0 | "}

                      {reset.reason}
                    </p>

                    <p className="text-gray-500 text-xs mt-1">
                      {reset.supervisorName}

                      {" • "}

                      {reset.timestamp}
                    </p>
                  </div>

                  <span className="text-orange-600 font-bold">
                    -{reset.previousCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
