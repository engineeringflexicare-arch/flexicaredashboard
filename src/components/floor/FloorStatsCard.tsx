import { Activity, Cpu, Zap, AlertCircle, Factory } from "lucide-react";

import type { MachineStatus } from "../../types/machineStatus";

// ===============================================
// PROPS
// ===============================================

interface FloorStatsCardProps {
  floorLabel: string;

  totalLines: number;

  totalOutput: number;

  totalTarget: number;

  runningMachines: number;

  totalMachines: number;

  maintenanceAlerts: number;

  machineStatuses: MachineStatus[];
}

// ===============================================
// COMPONENT
// ===============================================

export default function FloorStatsCard({
  floorLabel,

  totalLines,

  totalOutput,

  totalTarget,

  runningMachines,

  totalMachines,

  maintenanceAlerts,

  machineStatuses,
}: FloorStatsCardProps) {
  // ===========================================
  // CALCULATIONS
  // ===========================================

  const completionPercentage =
    totalTarget > 0 ? Math.round((totalOutput / totalTarget) * 100) : 0;

  const offlineMachines = machineStatuses.filter(
    (machine) => !machine.isOnline,
  ).length;

  // ===========================================
  // COMPLETION COLORS
  // ===========================================

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 100) {
      return "text-green-600";
    }

    if (percentage >= 80) {
      return "text-blue-600";
    }

    if (percentage >= 60) {
      return "text-yellow-600";
    }

    return "text-red-600";
  };

  // ===========================================
  // MACHINE CARD COLORS
  // ===========================================

  const getMachineCardStyle = (machine: MachineStatus) => {
    if (!machine.isOnline) {
      return `
        bg-gray-100
        border-gray-300
        text-gray-700
      `;
    }

    if (machine.state === "running") {
      return `
        bg-green-50
        border-green-300
        text-green-700
      `;
    }

    if (machine.state === "idle") {
      return `
        bg-yellow-50
        border-yellow-300
        text-yellow-700
      `;
    }

    return `
      bg-blue-50
      border-blue-300
      text-blue-700
    `;
  };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="space-y-5">
      {/* ===================================== */}
      {/* FLOOR HEADER */}
      {/* ===================================== */}

      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Factory className="text-blue-600" size={24} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">{floorLabel}</h2>

              <p className="text-sm text-gray-500 mt-1">
                Factory Floor Analytics
              </p>
            </div>
          </div>

          <div
            className={`
              text-3xl
              font-bold
              ${getCompletionColor(completionPercentage)}
            `}
          >
            {completionPercentage}%
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* STATS GRID */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* COMPLETION */}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Completion</p>

            <Zap className="text-yellow-600" size={18} />
          </div>

          <p
            className={`
              text-3xl
              font-bold
              ${getCompletionColor(completionPercentage)}
            `}
          >
            {completionPercentage}%
          </p>

          <p className="text-xs text-gray-500 mt-2">
            {totalOutput} / {totalTarget} units
          </p>
        </div>

        {/* RUNNING MACHINES */}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">
              Running Machines
            </p>

            <Activity className="text-green-600" size={18} />
          </div>

          <p className="text-3xl font-bold text-green-600">{runningMachines}</p>

          <p className="text-xs text-gray-500 mt-2">
            of {totalMachines} machines
          </p>
        </div>

        {/* ACTIVE LINES */}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Active Lines</p>

            <Cpu className="text-blue-600" size={18} />
          </div>

          <p className="text-3xl font-bold text-blue-600">{totalLines}</p>

          <p className="text-xs text-gray-500 mt-2">lines operational</p>
        </div>

        {/* ALERTS */}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">Issues</p>

            <AlertCircle
              className={
                maintenanceAlerts > 0 ? "text-red-600" : "text-green-600"
              }
              size={18}
            />
          </div>

          <p
            className={`
              text-3xl
              font-bold

              ${maintenanceAlerts > 0 ? "text-red-600" : "text-green-600"}
            `}
          >
            {maintenanceAlerts + offlineMachines}
          </p>

          <p className="text-xs text-gray-500 mt-2">
            {maintenanceAlerts} alerts • {offlineMachines} offline
          </p>
        </div>
      </div>

      {/* ===================================== */}
      {/* MACHINE STATUS */}
      {/* ===================================== */}

      {machineStatuses.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Machine Status Overview
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Real-time machine monitoring
              </p>
            </div>

            <div className="text-sm text-gray-500">
              {machineStatuses.length} Machines
            </div>
          </div>

          {/* MACHINE GRID */}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {machineStatuses.map((machine) => (
              <div
                key={machine.machineId}
                className={`
                    border
                    rounded-xl
                    p-3
                    text-center
                    transition-all
                    duration-200
                    hover:shadow-md

                    ${getMachineCardStyle(machine)}
                  `}
              >
                {/* MACHINE NAME */}

                <div className="font-semibold text-sm truncate">
                  {machine.machineId}
                </div>

                {/* STATUS */}

                <div className="text-xs mt-2 font-medium">
                  {machine.isOnline ? machine.state.toUpperCase() : "OFFLINE"}
                </div>

                {/* COUNT */}

                <div className="text-xs mt-2 opacity-80">
                  Count: {machine.currentCount}
                </div>

                {/* LAST HEARTBEAT */}

                {machine.lastHeartbeat && (
                  <div className="text-[10px] mt-2 opacity-60">
                    Live Signal Active
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
