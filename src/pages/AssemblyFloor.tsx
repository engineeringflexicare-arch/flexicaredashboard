import { useEffect, useState } from "react";

import { PackageCheck, Cpu, Wrench } from "lucide-react";

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
// COMPONENT
// ===============================================

export default function AssemblyFloor() {
  // ===========================================
  // CONSTANTS
  // ===========================================

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
  // LOAD REALTIME DATA
  // ===========================================

  useEffect(() => {
    const linesRef = ref(database, "Lines");

    const machinesRef = ref(database, "Machines");

    // =======================================
    // LOAD LINES
    // =======================================

    const unsubscribeLines = onValue(
      linesRef,

      (snapshot) => {
        if (snapshot.exists()) {
          setLines(snapshot.val() as Record<string, LineData>);
        } else {
          setLines({});
        }
      },
    );

    // =======================================
    // LOAD MACHINE COUNTS
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
            counts[machineId] = Number(
              machines[machineId]?.LiveStatus?.Count || 0,
            );
          });
        }

        setLiveCounts(counts);
      },
    );

    // =======================================
    // CLEANUP
    // =======================================

    return () => {
      unsubscribeLines();

      unsubscribeMachines();
    };
  }, []);

  // ===========================================
  // LOAD MACHINE STATUS + ALERTS
  // ===========================================

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statuses = await getFloorMachineStatuses();

        setMachineStatuses(statuses);

        const alerts = await getActiveMaintenanceAlerts();

        setMaintenanceAlerts(alerts);
      } catch (error) {
        console.error("Status Fetch Error:", error);
      }
    };

    void fetchStatuses();

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
    (machine) => machine.isOnline,
  ).length;

  // ===========================================
  // FILTER FLOOR LINES
  // ===========================================

  const filteredLines = Object.entries(lines).filter(
    ([, line]) => line.floor === floor,
  );

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          shadow-sm
          p-6
          mb-6
        "
      >
        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-5
          "
        >
          <div className="flex items-center gap-4">
            <div
              className="
                bg-orange-100
                p-4
                rounded-2xl
              "
            >
              <PackageCheck className="text-orange-600" size={32} />
            </div>

            <div>
              <h1
                className="
                  text-3xl
                  font-bold
                  text-gray-800
                "
              >
                {floorLabel}
              </h1>

              <p className="text-gray-500 mt-1">
                Real-time production monitoring dashboard
              </p>
            </div>
          </div>

          <div
            className="
              bg-green-100
              text-green-700
              px-5
              py-3
              rounded-2xl
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                w-3
                h-3
                rounded-full
                bg-green-500
                animate-pulse
              "
            ></div>

            <div>
              <p className="text-xs uppercase">Factory Status</p>

              <p className="font-bold">Production Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================== */}
      {/* FLOOR STATS */}
      {/* =================================== */}

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

      {/* =================================== */}
      {/* LINE CARDS */}
      {/* =================================== */}

      <div className="mb-6">
        <div
          className="
            flex
            items-center
            justify-between
            mb-4
          "
        >
          <h2
            className="
              text-2xl
              font-bold
              text-gray-800
            "
          >
            Production Lines
          </h2>

          <span className="text-sm text-gray-500">Live Tracking</span>
        </div>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-5
          "
        >
          {filteredLines.map(([lineKey, line]) => (
            <LineCard
              key={lineKey}
              line={lineKey}
              product={line.productCode || "N/A"}
              machine={line.machineId || "N/A"}
              target={Number(line.hourlyTarget || 0)}
              current={Number(liveCounts[line.machineId] || 0)}
            />
          ))}
        </div>
      </div>

      {/* =================================== */}
      {/* MACHINE STATUS + ALERTS */}
      {/* =================================== */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-6
          mb-6
        "
      >
        {/* ================================= */}
        {/* RUNNING MACHINES */}
        {/* ================================= */}

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
          <div className="flex items-center gap-3 mb-5">
            <div
              className="
                bg-green-100
                p-3
                rounded-2xl
              "
            >
              <Cpu className="text-green-600" size={24} />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-gray-800
                "
              >
                Running Machines
              </h2>

              <p className="text-sm text-gray-500">
                Active production machines
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {machineStatuses
              .filter((machine) => machine.isOnline)
              .map((machine) => (
                <div
                  key={machine.machineId}
                  className="
                    bg-gray-50
                    border
                    border-gray-200
                    rounded-2xl
                    p-4
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div>
                    <h3
                      className="
                        font-semibold
                        text-gray-800
                      "
                    >
                      {machine.machineId}
                    </h3>

                    <p
                      className="
                        text-sm
                        text-gray-500
                      "
                    >
                      Current Output: {machine.currentCount}
                    </p>
                  </div>

                  <div
                    className="
                      bg-green-100
                      text-green-700
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-semibold
                    "
                  >
                    Running
                  </div>
                </div>
              ))}

            {runningMachines === 0 && (
              <div
                className="
                  bg-gray-50
                  border
                  border-gray-200
                  rounded-2xl
                  p-5
                  text-center
                "
              >
                <p className="text-gray-500">No running machines</p>
              </div>
            )}
          </div>
        </div>

        {/* ================================= */}
        {/* MAINTENANCE ALERTS */}
        {/* ================================= */}

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
          <div className="flex items-center gap-3 mb-5">
            <div
              className="
                bg-red-100
                p-3
                rounded-2xl
              "
            >
              <Wrench className="text-red-600" size={24} />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-bold
                  text-gray-800
                "
              >
                Maintenance Alerts
              </h2>

              <p className="text-sm text-gray-500">
                Machines requiring attention
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {maintenanceAlerts.length > 0 ? (
              maintenanceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="
                    bg-red-50
                    border
                    border-red-200
                    rounded-2xl
                    p-4
                  "
                >
                  <div className="flex justify-between">
                    <div>
                      <h3
                        className="
                          font-semibold
                          text-red-700
                        "
                      >
                        {alert.machineId}
                      </h3>

                      <p
                        className="
                          text-sm
                          text-red-500
                          mt-1
                        "
                      >
                        {alert.breakdownDetails}
                      </p>
                    </div>

                    <span
                      className="
                        bg-red-100
                        text-red-700
                        text-xs
                        font-bold
                        px-3
                        py-1
                        rounded-full
                        h-fit
                      "
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="
                  bg-green-50
                  border
                  border-green-200
                  rounded-2xl
                  p-5
                "
              >
                <p className="text-green-700">No maintenance alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =================================== */}
      {/* TABLE */}
      {/* =================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          shadow-sm
          overflow-hidden
        "
      >
        <div
          className="
            bg-gray-900
            text-white
            px-6
            py-5
          "
        >
          <h2
            className="
              text-xl
              font-bold
            "
          >
            Production Table
          </h2>

          <p
            className="
              text-sm
              text-gray-300
              mt-1
            "
          >
            Real-time production monitoring
          </p>
        </div>

        <div className="p-4">
          <ProductionTable floor={floor} />
        </div>
      </div>
    </div>
  );
}
