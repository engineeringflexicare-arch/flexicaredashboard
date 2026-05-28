import { useEffect, useMemo, useState } from "react";

import { Activity, BarChart3, TrendingUp, Clock3, Factory } from "lucide-react";

import { ref, onValue } from "firebase/database";

import { database } from "../services/firebase";

import AnalyticsMetrics from "../components/dashboard/analytics/AnalyticsMetrics";

import AnalyticsFilters from "../components/dashboard/analytics/AnalyticsFilters";

import AnalyticsHeatmap from "../components/dashboard/analytics/AnalyticsHeatmap";

import RealtimeStatusPanel from "../components//dashboard/analytics/RealtimeStatusPanel";

import type {
  AnalyticsFilters as AnalyticsFilterType,
  FloorName,
  RealtimeMachineStatus,
} from "../types/analytics";

// ===============================================
// TYPES
// ===============================================

interface LineData {
  machineId?: string;

  productCode?: string;

  hourlyTarget?: number;

  dailyTarget?: number;

  plannedMembers?: number;
}

interface MachineData {
  status?: string;

  machineState?: string;

  LiveStatus?: {
    Count?: number;

    LastCycleTime?: number;

    LastUpdate?: string;
  };
}

// ===============================================
// COMPONENT
// ===============================================

export default function Analytics() {
  // ===========================================
  // STATES
  // ===========================================

  const [lines, setLines] = useState<Record<string, LineData>>({});

  const [machines, setMachines] = useState<Record<string, MachineData>>({});

  const [filters, setFilters] = useState<AnalyticsFilterType>({
    floor: "Combined",

    startDate: "",

    endDate: "",

    granularity: "daily",
  });

  // ===========================================
  // LOAD FIREBASE
  // ===========================================

  useEffect(() => {
    const linesRef = ref(database, "Lines");

    const machinesRef = ref(database, "Machines");

    const unsubscribeLines = onValue(linesRef, (snapshot) => {
      if (snapshot.exists()) {
        setLines(snapshot.val());
      } else {
        setLines({});
      }
    });

    const unsubscribeMachines = onValue(machinesRef, (snapshot) => {
      if (snapshot.exists()) {
        setMachines(snapshot.val());
      } else {
        setMachines({});
      }
    });

    return () => {
      unsubscribeLines();

      unsubscribeMachines();
    };
  }, []);

  // ===========================================
  // REALTIME STATUS
  // ===========================================

  const realtimeStatuses: RealtimeMachineStatus[] = useMemo(() => {
    return Object.entries(lines).map(([lineKey, line]) => {
      const machine = machines[line.machineId || ""];

      // =====================================
      // LAST UPDATE CHECK
      // =====================================

      const lastUpdate = machine?.LiveStatus?.LastUpdate;

      let isOnline = false;

      if (lastUpdate) {
        const lastTime = new Date(lastUpdate).getTime();

        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();

        // 30 seconds timeout

        isOnline = now - lastTime < 30000;
      }

      return {
        lineKey,

        machineId: line.machineId || "N/A",

        currentCount: Number(machine?.LiveStatus?.Count || 0),

        lastCycleTimeSec: Number(machine?.LiveStatus?.LastCycleTime || 0),

        status: isOnline ? "online" : "offline",
      };
    });
  }, [lines, machines]);
  // ===========================================
  // METRICS
  // ===========================================

  const totalOutput = realtimeStatuses.reduce(
    (sum, item) => sum + item.currentCount,
    0,
  );

  const totalTarget = Object.values(lines).reduce(
    (sum, line) => sum + Number(line.dailyTarget || 0),
    0,
  );

  const completionRate =
    totalTarget > 0
      ? Number(((totalOutput / totalTarget) * 100).toFixed(0))
      : 0;

  const remaining = Math.max(totalTarget - totalOutput, 0);

  const avgCycleTime =
    realtimeStatuses.length > 0
      ? realtimeStatuses.reduce(
          (sum, item) => sum + (item.lastCycleTimeSec || 0),
          0,
        ) / realtimeStatuses.length
      : 0;

  const onlineMachines = realtimeStatuses.filter(
    (item) => item.status === "online",
  ).length;

  const offlineMachines = realtimeStatuses.length - onlineMachines;

  // ===========================================
  // HEATMAP
  // ===========================================

  const hourlyHeatmap = [
    { hour: "08:00", value: 40 },
    { hour: "09:00", value: 65 },
    { hour: "10:00", value: 82 },
    { hour: "11:00", value: 90 },
    { hour: "12:00", value: 35 },
    { hour: "13:00", value: 74 },
    { hour: "14:00", value: 98 },
    { hour: "15:00", value: 110 },
    { hour: "16:00", value: 76 },
    { hour: "17:00", value: 50 },
  ];

  // ===========================================
  // FILTER OPTIONS
  // ===========================================

  const floors: FloorName[] = [
    "Combined",
    "Manufacturing_Floor",
    "Assembly_Floor",
  ];

  const lineOptions = Object.keys(lines).map((line) => ({
    value: line,

    label: line.replace("_", " "),
  }));

  const machineOptions = Object.values(lines).map((line) => ({
    value: line.machineId || "",

    label: line.machineId || "",
  }));

  const productOptions = Object.values(lines).map((line) => ({
    value: line.productCode || "",

    label: line.productCode || "",
  }));

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="space-y-8">
      {/* =================================== */}
      {/* PAGE HEADER */}
      {/* =================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-gray-200
          p-8
          shadow-sm
        "
      >
        <div
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-6
          "
        >
          <div className="flex items-center gap-5">
            <div
              className="
                bg-blue-100
                p-5
                rounded-3xl
              "
            >
              <BarChart3 className="text-blue-600" size={38} />
            </div>

            <div>
              <h1
                className="
                  text-4xl
                  font-black
                  text-gray-900
                "
              >
                Analytics Dashboard
              </h1>

              <p className="text-gray-500 mt-2 text-lg">
                Real-time factory analytics and production insights
              </p>
            </div>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-4
            "
          >
            <div
              className="
                bg-emerald-50
                border
                border-emerald-200
                rounded-3xl
                px-6
                py-5
                min-w-56
              "
            >
              <div className="flex items-center gap-3">
                <Factory className="text-emerald-600" size={24} />

                <div>
                  <p className="text-sm text-emerald-700">Factory Status</p>

                  <h3
                    className="
                      text-2xl
                      font-bold
                      text-emerald-800
                    "
                  >
                    Production Running
                  </h3>
                </div>
              </div>
            </div>

            <div
              className="
                bg-blue-50
                border
                border-blue-200
                rounded-3xl
                px-6
                py-5
                min-w-56
              "
            >
              <div className="flex items-center gap-3">
                <Activity className="text-blue-600" size={24} />

                <div>
                  <p className="text-sm text-blue-700">Monitoring</p>

                  <h3
                    className="
                      text-2xl
                      font-bold
                      text-blue-800
                    "
                  >
                    Live Analytics
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================== */}
      {/* FILTERS */}
      {/* =================================== */}

      <AnalyticsFilters
        filters={filters}
        floors={floors}
        lines={lineOptions}
        machines={machineOptions}
        products={productOptions}
        onFilterChange={(patch) =>
          setFilters((prev) => ({
            ...prev,
            ...patch,
          }))
        }
      />

      {/* =================================== */}
      {/* METRICS */}
      {/* =================================== */}

      <AnalyticsMetrics
        totalOutput={totalOutput}
        totalTarget={totalTarget}
        completionRate={completionRate}
        remaining={remaining}
        avgCycleTime={avgCycleTime}
        onlineMachines={onlineMachines}
        offlineMachines={offlineMachines}
      />

      {/* =================================== */}
      {/* REALTIME STATUS PANEL */}
      {/* =================================== */}

      <RealtimeStatusPanel statuses={realtimeStatuses} />

      {/* =================================== */}
      {/* OVERVIEW CARDS */}
      {/* =================================== */}

      {/* <div
        className="
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {Object.entries(lines).map(([lineKey, line]) => {
          const machine = machines[line.machineId || ""];

          return (
            <AnalyticsOverviewCard
              key={lineKey}
              line={lineKey.replace("_", " ")}
              product={line.productCode || "N/A"}
              machine={line.machineId || "N/A"}
              output={Number(machine?.LiveStatus?.Count || 0)}
              target={Number(line.dailyTarget || 0)}
              status={machine?.status === "online" ? "online" : "offline"}
              onClick={() => {}}
            />
          );
        })}
      </div> */}

      {/* =================================== */}
      {/* CHART PLACEHOLDER */}
      {/* =================================== */}

      <div
        className="
          grid
          gap-6
          xl:grid-cols-2
        "
      >
        {/* PRODUCTION TREND */}

        <div
          className="
            bg-white
            rounded-3xl
            border
            border-gray-200
            p-6
            shadow-sm
          "
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="text-green-600" size={24} />

            <div>
              <h2
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                "
              >
                Production Trend
              </h2>

              <p className="text-gray-500">Live production analytics</p>
            </div>
          </div>

          <div
            className="
              h-80
              rounded-3xl
              border-2
              border-dashed
              border-gray-200
              flex
              items-center
              justify-center
            "
          >
            <div className="text-center">
              <TrendingUp
                className="
                  mx-auto
                  text-gray-300
                  mb-4
                "
                size={60}
              />

              <p className="text-gray-500 text-lg">Production chart area</p>
            </div>
          </div>
        </div>

        {/* CYCLE TIME */}

        <div
          className="
            bg-white
            rounded-3xl
            border
            border-gray-200
            p-6
            shadow-sm
          "
        >
          <div className="flex items-center gap-3 mb-6">
            <Clock3 className="text-orange-600" size={24} />

            <div>
              <h2
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                "
              >
                Cycle Time Trend
              </h2>

              <p className="text-gray-500">Machine performance analysis</p>
            </div>
          </div>

          <div
            className="
              h-80
              rounded-3xl
              border-2
              border-dashed
              border-gray-200
              flex
              items-center
              justify-center
            "
          >
            <div className="text-center">
              <Clock3
                className="
                  mx-auto
                  text-gray-300
                  mb-4
                "
                size={60}
              />

              <p className="text-gray-500 text-lg">Cycle time chart area</p>
            </div>
          </div>
        </div>
      </div>

      {/* =================================== */}
      {/* HEATMAP */}
      {/* =================================== */}

      <AnalyticsHeatmap hourlyHeatmap={hourlyHeatmap} />
    </div>
  );
}
