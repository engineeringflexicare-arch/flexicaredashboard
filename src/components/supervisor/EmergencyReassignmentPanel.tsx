import { useEffect, useState } from "react";

import { AlertTriangle, ArrowRightLeft, CheckCircle2 } from "lucide-react";

import {
  performEmergencyTransfer,
  getActiveTransfers,
  completeEmergencyTransfer,
} from "../../services/emergencyTransferService";

import type {
  EmergencyTransfer,
  TransferReason,
} from "../../types/emergencyTransfer";

import type { LineData } from "../../types/production";

// ===============================================
// PROPS
// ===============================================

interface EmergencyReassignmentPanelProps {
  lines: Record<string, LineData>;
}

// ===============================================
// COMPONENT
// ===============================================

const EmergencyReassignmentPanel = ({
  lines,
}: EmergencyReassignmentPanelProps) => {
  // ===========================================
  // STATES
  // ===========================================

  const [activeTransfers, setActiveTransfers] = useState<EmergencyTransfer[]>(
    [],
  );

  const [selectedLine, setSelectedLine] = useState("");

  const [newMachineId, setNewMachineId] = useState("");

  const [reason, setReason] = useState<TransferReason>("breakdown");

  const [breakdownReason, setBreakdownReason] = useState("");

  const [notes, setNotes] = useState("");

  const [supervisor, setSupervisor] = useState("Supervisor");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  // ===========================================
  // LOAD TRANSFERS
  // ===========================================

  const loadTransfers = async () => {
    try {
      const transfers = await getActiveTransfers();

      setActiveTransfers(transfers);
    } catch (error) {
      console.error(error);
    }
  };

  // ===========================================
  // INITIAL LOAD
  // ===========================================

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        const transfers = await getActiveTransfers();

        setActiveTransfers(transfers);
      } catch (error) {
        console.error(error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ===========================================
  // HANDLE TRANSFER
  // ===========================================

  const handleTransfer = async () => {
    if (!selectedLine || !newMachineId) {
      setMessage("Please fill all required fields");

      return;
    }

    const lineData = lines[selectedLine];

    if (!lineData) {
      setMessage("Invalid line selected");

      return;
    }

    try {
      setLoading(true);

      const transferId = await performEmergencyTransfer({
        lineId: selectedLine,

        oldMachineId: lineData.machineId,

        newMachineId,

        reason,

        breakdownReason,

        additionalNotes: notes,

        supervisor,

        productionCountAtTransfer: 0,
      });

      if (transferId) {
        setMessage("✓ Emergency transfer completed");

        setSelectedLine("");

        setNewMachineId("");

        setBreakdownReason("");

        setNotes("");

        await loadTransfers();
      } else {
        setMessage("Transfer failed");
      }
    } catch (error) {
      console.error(error);

      setMessage("Transfer error");
    } finally {
      setLoading(false);

      window.setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  };

  // ===========================================
  // COMPLETE TRANSFER
  // ===========================================

  const handleComplete = async (transferId: string) => {
    try {
      const success = await completeEmergencyTransfer(transferId);

      if (success) {
        await loadTransfers();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="space-y-6">
      {/* ===================================== */}
      {/* CREATE TRANSFER */}
      {/* ===================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-orange-100 p-2 rounded-xl">
            <ArrowRightLeft className="text-orange-600" size={20} />
          </div>

          <h3 className="text-lg font-bold text-gray-800">
            Emergency Machine Reassignment
          </h3>
        </div>

        {/* MESSAGE */}

        {message && (
          <div
            className={`
              mb-4
              p-3
              rounded-xl
              text-sm
              font-medium

              ${
                message.includes("✓")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }
            `}
          >
            {message}
          </div>
        )}

        {/* FORM */}

        <div className="space-y-4">
          {/* SUPERVISOR */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supervisor
            </label>

            <input
              type="text"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            />
          </div>

          {/* LINE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Production Line
            </label>

            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            >
              <option value="">Select Line</option>

              {Object.entries(lines).map(([lineKey, line]) => (
                <option key={lineKey} value={lineKey}>
                  {lineKey} ({line.machineId})
                </option>
              ))}
            </select>
          </div>

          {/* MACHINE */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replacement Machine
            </label>

            <input
              type="text"
              value={newMachineId}
              onChange={(e) => setNewMachineId(e.target.value)}
              placeholder="Machine_02"
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            />
          </div>

          {/* REASON */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Reason
            </label>

            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as TransferReason)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            >
              <option value="breakdown">Breakdown</option>

              <option value="emergency">Emergency</option>

              <option value="maintenance">Maintenance</option>

              <option value="urgent_transfer">Urgent Transfer</option>

              <option value="line_balancing">Line Balancing</option>

              <option value="quality_issue">Quality Issue</option>

              <option value="other">Other</option>
            </select>
          </div>

          {/* BREAKDOWN */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breakdown Details
            </label>

            <textarea
              rows={3}
              value={breakdownReason}
              onChange={(e) => setBreakdownReason(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            />
          </div>

          {/* NOTES */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>

            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2"
            />
          </div>

          {/* BUTTON */}

          <button
            onClick={handleTransfer}
            disabled={loading}
            className="
              w-full
              bg-orange-600
              hover:bg-orange-700
              text-white
              font-semibold
              py-3
              rounded-xl
              transition
              disabled:opacity-50
            "
          >
            {loading ? "Processing..." : "Execute Emergency Transfer"}
          </button>
        </div>
      </div>

      {/* ===================================== */}
      {/* ACTIVE TRANSFERS */}
      {/* ===================================== */}

      {activeTransfers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <AlertTriangle className="text-orange-600" size={20} />

            <h3 className="text-lg font-bold text-gray-800">
              Active Transfers
            </h3>
          </div>

          <div className="space-y-3">
            {activeTransfers.map((transfer) => (
              <div
                key={transfer.id}
                className="border border-orange-200 bg-orange-50 rounded-xl p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-bold text-sm text-gray-800">
                      {transfer.lineId}
                    </p>

                    <p className="text-sm text-gray-600 mt-1">
                      {transfer.oldMachineId}

                      {" → "}

                      {transfer.newMachineId}
                    </p>

                    <p className="text-xs text-gray-500 mt-2">
                      {transfer.reason}
                    </p>
                  </div>

                  <button
                    onClick={() => handleComplete(transfer.id)}
                    className="
                        bg-green-600
                        hover:bg-green-700
                        text-white
                        px-3
                        py-2
                        rounded-lg
                        text-sm
                        flex
                        items-center
                        gap-2
                      "
                  >
                    <CheckCircle2 size={16} />
                    Complete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyReassignmentPanel;
