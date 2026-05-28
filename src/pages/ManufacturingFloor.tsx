import { Factory, Activity, Target, Cpu } from "lucide-react";

import { useEffect, useState } from "react";

import { ref, onValue } from "firebase/database";

import { database } from "../services/firebase";

import { getFloorMachineStatuses } from "../services/machineStatusService";

import { getActiveMaintenanceAlerts } from "../services/maintenanceService";

import ProductionTable from "../components/dashboard/ProductionTable";

import LineCard from "../components/dashboard/LineCard";

import FloorStatsCard from "../components/floor/FloorStatsCard";

import type { LineData } from "../types/production";

import type { MachineStatus } from "../types/machineStatus";

import type { MaintenanceAlert } from "../types/maintenance";

// ===============================================
// MACHINE DATA TYPE
// ===============================================

interface MachineData {
  LiveStatus?: {
    Count?: number;
  };
}

// ===============================================
// MANUFACTURING FLOOR PAGE
// ===============================================

export default function ManufacturingFloor() {
  const floor = "Manufacturing_Floor";

  const floorLabel = "Manufacturing Floor";

  // ===========================================
  // STATES
  // ===========================================

  const [lines, setLines] = useState<Record<string, LineData>>({});

  const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

  const [machineStatuses, setMachineStatuses] = useState<MachineStatus[]>([]);

  const [maintenanceAlerts, setMaintenanceAlerts] = useState<
    MaintenanceAlert[]
  >([]);

  // ===========================================
  // REALTIME FIREBASE LISTENERS
  // ===========================================

  useEffect(() => {
    // =======================================
    // LINES
    // =======================================

    const linesRef = ref(database, "Lines");

    const unsubscribeLines = onValue(linesRef, (snapshot) => {
      if (snapshot.exists()) {
        setLines(snapshot.val() as Record<string, LineData>);
      } else {
        setLines({});
      }
    });

    // =======================================
    // MACHINES
    // =======================================

    const machinesRef = ref(database, "Machines");

    const unsubscribeMachines = onValue(machinesRef, (snapshot) => {
      const counts: Record<string, number> = {};

      if (snapshot.exists()) {
        const machines = snapshot.val() as Record<string, MachineData>;

        Object.entries(machines).forEach(([machineId, machine]) => {
          counts[machineId] = Number(machine?.LiveStatus?.Count || 0);
        });
      }

      setLiveCounts(counts);
    });

    // =======================================
    // CLEANUP
    // =======================================

    return () => {
      unsubscribeLines();

      unsubscribeMachines();
    };
  }, []);

  // ===========================================
  // MACHINE STATUS + ALERTS
  // ===========================================

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statuses = await getFloorMachineStatuses();

        setMachineStatuses(statuses);

        const alerts = await getActiveMaintenanceAlerts();

        setMaintenanceAlerts(alerts);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStatuses();

    const interval = window.setInterval(fetchStatuses, 30000);

    return () => window.clearInterval(interval);
  }, []);

  // ===========================================
  // CALCULATIONS
  // ===========================================

  const totalLines = Object.keys(lines).length;

  const totalTarget = Object.values(lines).reduce(
    (sum, line) => sum + Number(line.hourlyTarget || 0),
    0,
  );

  const totalOutput = Object.values(lines).reduce(
    (sum, line) => sum + Number(liveCounts[line.machineId] || 0),
    0,
  );

  const runningMachines = machineStatuses.filter(
    (machine) => machine.state === "running",
  ).length;

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5 md:p-7 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <Factory className="text-blue-600" size={32} />
            </div>

            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
                {floorLabel}
              </h1>

              <p className="text-gray-500 mt-2 text-sm md:text-base">
                Real-time production floor monitoring and machine analytics
                dashboard.
              </p>
            </div>
          </div>

          <div className="bg-green-100 border border-green-200 text-green-700 px-5 py-4 rounded-2xl flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

            <div>
              <p className="text-xs uppercase font-medium tracking-wide">
                Factory Status
              </p>

              <p className="font-bold text-lg">Production Running</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* FLOOR STATS */}
      {/* ===================================== */}

      <div className="mb-6">
        <FloorStatsCard
          floorLabel={floorLabel}
          totalLines={totalLines}
          totalOutput={totalOutput}
          totalTarget={totalTarget}
          runningMachines={runningMachines}
          totalMachines={machineStatuses.length}
          maintenanceAlerts={maintenanceAlerts.length}
          machineStatuses={machineStatuses}
        />
      </div>

      {/* ===================================== */}
      {/* LINE CARDS */}
      {/* ===================================== */}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Production Lines
          </h2>

          <span className="text-sm text-gray-500">Real-time Monitoring</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(lines).map(([lineKey, line]) => (
            <LineCard
              key={lineKey}
              line={lineKey.replace("_", " ")}
              product={line.productCode}
              machine={line.machineId}
              target={Number(line.hourlyTarget || 0)}
              current={Number(liveCounts[line.machineId] || 0)}
            />
          ))}
        </div>
      </div>

      {/* ===================================== */}
      {/* QUICK STATS */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* TOTAL OUTPUT */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Output</p>

              <h2 className="text-4xl font-bold text-green-600 mt-2">
                {totalOutput}
              </h2>
            </div>

            <div className="bg-green-100 p-4 rounded-2xl">
              <Activity className="text-green-600" size={28} />
            </div>
          </div>
        </div>

        {/* TARGET */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hourly Target</p>

              <h2 className="text-4xl font-bold text-blue-600 mt-2">
                {totalTarget}
              </h2>
            </div>

            <div className="bg-blue-100 p-4 rounded-2xl">
              <Target className="text-blue-600" size={28} />
            </div>
          </div>
        </div>

        {/* RUNNING */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Running Machines</p>

              <h2 className="text-4xl font-bold text-orange-600 mt-2">
                {runningMachines}
              </h2>
            </div>

            <div className="bg-orange-100 p-4 rounded-2xl">
              <Cpu className="text-orange-600" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* ===================================== */}
      {/* TABLE */}
      {/* ===================================== */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#111827] text-white px-6 py-5">
          <h2 className="text-2xl font-bold">Hourly Production Monitoring</h2>

          <p className="text-sm text-gray-300 mt-1">
            Real-time hourly production tracking for manufacturing lines.
          </p>
        </div>

        <div className="p-4 overflow-x-auto">
          <ProductionTable floor={floor} />
        </div>
      </div>
    </div>
  );
}
