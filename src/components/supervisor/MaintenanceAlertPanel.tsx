import { useState, useEffect, useCallback } from "react";

import { AlertTriangle, Wrench } from "lucide-react";

import {
  createMaintenanceAlert,
  resolveMaintenanceAlert,
  getActiveMaintenanceAlerts,
} from "../../services/maintenanceService";

import type { LineData } from "../../types/production";

import type { MaintenanceAlert } from "../../types/maintenance";

// ===============================================
// TYPES
// ===============================================

interface MaintenanceAlertPanelProps {
  lines: Record<string, LineData>;
}

type IssueType =
  | "breakdown"
  | "error"
  | "calibration"
  | "inspection"
  | "cleaning"
  | "repair"
  | "replacement"
  | "other";

// ===============================================
// COMPONENT
// ===============================================

export default function MaintenanceAlertPanel({
  lines,
}: MaintenanceAlertPanelProps) {
  // ===========================================
  // STATES
  // ===========================================

  const [activeAlerts, setActiveAlerts] = useState<MaintenanceAlert[]>([]);

  const [selectedMachine, setSelectedMachine] = useState("");

  const [issueType, setIssueType] = useState<IssueType>("breakdown");

  const [breakdownDetails, setBreakdownDetails] = useState("");

  const [severity, setSeverity] = useState<
    "low" | "medium" | "high" | "critical"
  >("high");

  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [supervisorName, setSupervisorName] = useState("Supervisor");

  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);

  const [repairNotes, setRepairNotes] = useState("");

  // ===========================================
  // FETCH ALERTS
  // ===========================================

  const fetchAlerts = useCallback(async () => {
    try {
      const alerts = await getActiveMaintenanceAlerts();

      setActiveAlerts(alerts);
    } catch (error) {
      console.error("Alert Fetch Error:", error);
    }
  }, []);

  // ===========================================
  // AUTO REFRESH
  // ===========================================

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchAlerts();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [fetchAlerts]);

  // ===========================================
  // CREATE ALERT
  // ===========================================

  const handleCreateAlert = async () => {
    if (!selectedMachine.trim() || !breakdownDetails.trim()) {
      setMessage("Please fill all required fields");

      return;
    }

    try {
      setLoading(true);

      const lineKey = Object.entries(lines).find(
        ([, line]) => line.machineId === selectedMachine,
      )?.[0];

      if (!lineKey) {
        setMessage("Machine not found");

        return;
      }

      const alertId = await createMaintenanceAlert({
        lineId: lineKey,

        machineId: selectedMachine,

        issueType,

        breakdownDetails,

        severity,

        notes,

        supervisor: supervisorName,
      });

      if (alertId) {
        setMessage("✓ Alert created successfully");

        setSelectedMachine("");

        setBreakdownDetails("");

        setNotes("");

        await fetchAlerts();

        window.setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to create alert");
      }
    } catch (error) {
      setMessage("Error creating alert");

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ===========================================
  // RESOLVE ALERT
  // ===========================================

  const handleResolveAlert = async (alertId: string) => {
    if (!repairNotes.trim()) {
      setMessage("Please enter repair notes");

      return;
    }

    try {
      const success = await resolveMaintenanceAlert(
        alertId,

        repairNotes,

        supervisorName,
      );

      if (success) {
        setMessage("✓ Alert resolved");

        setResolvingAlertId(null);

        setRepairNotes("");

        await fetchAlerts();

        window.setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to resolve alert");
      }
    } catch (error) {
      setMessage("Error resolving alert");

      console.error(error);
    }
  };

  // ===========================================
  // COLORS
  // ===========================================

  const severityColors = {
    critical: "bg-red-100 border-red-300 text-red-800",

    high: "bg-orange-100 border-orange-300 text-orange-800",

    medium: "bg-yellow-100 border-yellow-300 text-yellow-800",

    low: "bg-blue-100 border-blue-300 text-blue-800",
  };

  // ===========================================
  // LINE ENTRIES
  // ===========================================

  const lineEntries = Object.entries(lines) as Array<[string, LineData]>;

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="space-y-6">
      {/* CREATE ALERT */}

      <div className="bg-white rounded-3xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="bg-red-100 p-3 rounded-2xl">
            <AlertTriangle className="text-red-600" size={22} />
          </div>

          <h3 className="text-xl font-bold text-gray-800">
            Create Maintenance Alert
          </h3>
        </div>

        {message && (
          <div
            className={`p-4 rounded-2xl mb-5 text-sm border ${
              message.includes("✓")
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-red-100 text-red-700 border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="text"
            value={supervisorName}
            onChange={(e) => setSupervisorName(e.target.value)}
            placeholder="Supervisor Name"
            className="w-full border border-gray-300 rounded-2xl px-4 py-3"
          />

          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3"
          >
            <option value="">Select Machine</option>

            {lineEntries.map(([lineId, line]) => (
              <option key={line.machineId} value={line.machineId}>
                {lineId} — {line.machineId}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value as IssueType)}
              className="border border-gray-300 rounded-2xl px-4 py-3"
            >
              <option value="breakdown">Breakdown</option>

              <option value="error">Error</option>

              <option value="calibration">Calibration</option>

              <option value="inspection">Inspection</option>

              <option value="cleaning">Cleaning</option>

              <option value="repair">Repair</option>

              <option value="replacement">Replacement</option>

              <option value="other">Other</option>
            </select>

            <select
              value={severity}
              onChange={(e) =>
                setSeverity(
                  e.target.value as "low" | "medium" | "high" | "critical",
                )
              }
              className="border border-gray-300 rounded-2xl px-4 py-3"
            >
              <option value="low">Low</option>

              <option value="medium">Medium</option>

              <option value="high">High</option>

              <option value="critical">Critical</option>
            </select>
          </div>

          <textarea
            rows={4}
            value={breakdownDetails}
            onChange={(e) => setBreakdownDetails(e.target.value)}
            placeholder="Describe issue..."
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 resize-none"
          />

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes..."
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 resize-none"
          />

          <button
            onClick={handleCreateAlert}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-2xl transition"
          >
            {loading ? "Creating..." : "Create Alert"}
          </button>
        </div>
      </div>

      {/* ACTIVE ALERTS */}

      {activeAlerts.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Wrench className="text-yellow-600" size={22} />

            <h3 className="text-xl font-bold text-gray-800">
              Active Alerts ({activeAlerts.length})
            </h3>
          </div>

          <div className="space-y-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-2 rounded-2xl p-5 ${
                  severityColors[alert.severity]
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold">
                      {alert.machineId}

                      {" • "}

                      {alert.lineId}
                    </p>

                    <p className="text-sm mt-1">
                      {alert.issueType}

                      {" • "}

                      {alert.severity}
                    </p>
                  </div>

                  <span className="text-xs font-semibold">
                    {new Date(alert.startTime).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm mb-4">{alert.breakdownDetails}</p>

                {resolvingAlertId === alert.id ? (
                  <div className="space-y-3">
                    <textarea
                      rows={2}
                      value={repairNotes}
                      onChange={(e) => setRepairNotes(e.target.value)}
                      placeholder="Repair notes..."
                      className="w-full border border-gray-400 rounded-xl px-3 py-2"
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
                      >
                        Resolve
                      </button>

                      <button
                        onClick={() => setResolvingAlertId(null)}
                        className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResolvingAlertId(alert.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
