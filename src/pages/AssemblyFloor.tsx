import { PackageCheck, Cpu, Wrench } from "lucide-react";

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
// ASSEMBLY FLOOR PAGE
// ===============================================

export default function AssemblyFloor() {
  const floor = "Assembly_Floor";

  const floorLabel = "Assembly Floor";

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
    // ESP DATABASE STRUCTURE

    const linesRef = ref(database, "Lines");

    const machinesRef = ref(database, "Machines");

    // =======================================
    // LISTEN LINES
    // =======================================

    const unsubscribeLines = onValue(
      linesRef,

      (snapshot) => {
        setLines(
          snapshot.exists() ? (snapshot.val() as Record<string, LineData>) : {},
        );
      },
    );

    // =======================================
    // LISTEN MACHINES
    // =======================================

    const unsubscribeMachines = onValue(
      machinesRef,

      (snapshot) => {
        const counts: Record<string, number> = {};

        if (snapshot.exists()) {
          const machines = snapshot.val() as Record<
            string,
            {
              LiveStatus?: {
                Count?: number;
              };
            }
          >;

          Object.keys(machines).forEach((machineId) => {
            counts[machineId] = machines[machineId]?.LiveStatus?.Count || 0;
          });
        }

        setLiveCounts(counts);
      },
    );

    return () => {
      unsubscribeLines();

      unsubscribeMachines();
    };
  }, []);

  // ===========================================
  // FETCH MACHINE STATUS
  // ===========================================

  useEffect(() => {
    const fetchStatuses = async () => {
      const statuses = await getFloorMachineStatuses();

      setMachineStatuses(statuses);

      const alerts = await getActiveMaintenanceAlerts();

      setMaintenanceAlerts(alerts);
    };

    fetchStatuses();

    const interval = setInterval(fetchStatuses, 30000);

    return () => clearInterval(interval);
  }, []);

  // ===========================================
  // CALCULATIONS
  // ===========================================

  const totalLines = Object.keys(lines).length;

  const totalTarget = Object.values(lines).reduce(
    (sum, line) => sum + line.hourlyTarget,

    0,
  );

  const totalOutput = Object.values(lines).reduce(
    (sum, line) => sum + (liveCounts[line.machineId] || 0),

    0,
  );

  const runningMachines = Object.values(liveCounts).filter(
    (count) => count > 0,
  ).length;

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
      {/* HEADER */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5 md:p-7 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="bg-orange-100 p-4 rounded-2xl">
              <PackageCheck className="text-orange-600" />
            </div>

            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
                {floorLabel}
              </h1>

              <p className="text-gray-500 mt-2 text-sm md:text-base">
                Real-time assembly production monitoring and machine performance
                analytics.
              </p>
            </div>
          </div>

          <div className="bg-green-100 border border-green-200 text-green-700 px-5 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

            <div>
              <p className="text-xs uppercase font-medium tracking-wide">
                Assembly Status
              </p>

              <p className="font-bold">Production Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* FLOOR STATS */}

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

      {/* LINE CARDS */}

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Assembly Lines
          </h2>

          <span className="text-sm text-gray-500">Live Assembly Tracking</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Object.entries(lines).map(([lineKey, line]) => (
            <LineCard
              key={lineKey}
              line={lineKey.replace("_", " ")}
              product={line.productCode}
              machine={line.machineId}
              target={line.hourlyTarget}
              current={liveCounts[line.machineId] || 0}
            />
          ))}
        </div>
      </div>

      {/* MACHINE + ALERT PANELS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* RUNNING MACHINES */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-green-100 p-3 rounded-2xl">
              <Cpu className="text-green-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Running Machines
              </h2>

              <p className="text-sm text-gray-500">
                Currently active assembly machines
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(liveCounts).map(([machineId, count]) => (
              <div
                key={machineId}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{machineId}</h3>

                  <p className="text-sm text-gray-500">Assembly Production</p>
                </div>

                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  Running ({count})
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAINTENANCE ALERTS */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-red-100 p-3 rounded-2xl">
              <Wrench className="text-red-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Maintenance Alerts
              </h2>

              <p className="text-sm text-gray-500">
                Machines requiring inspection
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {maintenanceAlerts.length > 0 ? (
              maintenanceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="bg-red-50 border border-red-200 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-red-700">
                        {alert.machineId}
                      </h3>

                      <p className="text-sm text-red-500 mt-1">
                        {alert.breakdownDetails}
                      </p>
                    </div>

                    <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                <p className="text-green-700 font-medium">
                  No active maintenance alerts
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTION TABLE */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-[#111827] text-white px-6 py-5">
          <h2 className="text-xl font-bold">Assembly Production Monitoring</h2>

          <p className="text-sm text-gray-300 mt-1">
            Real-time hourly assembly output tracking.
          </p>
        </div>

        <div className="p-4">
          <ProductionTable floor={floor} />
        </div>
      </div>
    </div>
  );
}
