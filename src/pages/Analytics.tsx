import { useEffect, useMemo, useState } from "react";

import type {
  AnalyticsFilters as AnalyticsFiltersType,
  CounterHistoryPoint,
  FloorName,
  Granularity,
  LineRecord,
  MachineRecord,
} from "../types/analytics";

import { FLOORS } from "../constants/floors";

import {
  listenFloorLines,
  listenFloorMachines,
  listenMachineHistory,
  computeRealtimeStatus,
} from "../services/analytics";

import {
  filterHistoryByRange,
  calculateCycleTimeStats,
  buildHeatmap,
  summarizePatterns,
} from "../utils/analyticsHelpers";

import AnalyticsFilters from "../components/dashboard/analytics/AnalyticsFilters";

import AnalyticsMetrics from "../components/dashboard/analytics/AnalyticsMetrics";

import AnalyticsCharts from "../components/dashboard/analytics/AnalyticsCharts";

import AnalyticsHeatmap from "../components/dashboard/analytics/AnalyticsHeatmap";

import RealtimeStatusPanel from "../components/dashboard/analytics/RealtimeStatusPanel";

// ===============================================
// FLOOR OPTIONS
// ===============================================

const floorOptions: FloorName[] = ["Combined", ...(FLOORS as FloorName[])];

// ===============================================
// FORMAT DATE
// ===============================================

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ===============================================
// DEFAULT DATES
// ===============================================

const defaultEndDate = formatDateInput(new Date());

const defaultStartDate = formatDateInput(
  new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
);

// ===============================================
// GRANULARITY SCALE
// ===============================================

const granularityScale: Record<Granularity, number> = {
  daily: 24,

  weekly: 24 * 7,

  monthly: 24 * 30,
};

// ===============================================
// LINE META
// ===============================================

interface LineMeta extends LineRecord {
  key: string;

  floor: FloorName;

  label: string;
}

// ===============================================
// ANALYTICS PAGE
// ===============================================

export default function Analytics() {
  // ===========================================
  // STATES
  // ===========================================

  const [filters, setFilters] = useState<AnalyticsFiltersType>({
    floor: "Combined",

    startDate: defaultStartDate,

    endDate: defaultEndDate,

    granularity: "daily",
  });

  const [,] = useState<string | null>(null);

  const [,] = useState<string | null>(null);

  const [linesByFloor, setLinesByFloor] = useState<
    Record<FloorName, Record<string, LineRecord>>
  >({
    Combined: {},

    Manufacturing_Floor: {},

    Assembly_Floor: {},
  });

  const [machinesByFloor, setMachinesByFloor] = useState<
    Record<FloorName, Record<string, MachineRecord>>
  >({
    Combined: {},

    Manufacturing_Floor: {},

    Assembly_Floor: {},
  });

  const [historyByMachine, setHistoryByMachine] = useState<
    Record<string, CounterHistoryPoint[]>
  >({});

  // ===========================================
  // LISTEN LINES
  // ===========================================

  useEffect(() => {
    const unsubscribeLines = listenFloorLines(
      (lines: Record<string, LineRecord>) => {
        setLinesByFloor({
          Combined: lines,

          Manufacturing_Floor: lines,

          Assembly_Floor: lines,
        });
      },
    );

    const unsubscribeMachines = listenFloorMachines(
      (machines: Record<string, MachineRecord>) => {
        setMachinesByFloor({
          Combined: machines,

          Manufacturing_Floor: machines,

          Assembly_Floor: machines,
        });
      },
    );

    return () => {
      unsubscribeLines();

      unsubscribeMachines();
    };
  }, []);

  // ===========================================
  // NORMALIZED LINES
  // ===========================================

  const normalizedLines = useMemo<LineMeta[]>(() => {
    const build = (
      floor: FloorName,

      lines: Record<string, LineRecord>,
    ) =>
      Object.entries(lines).map(([lineKey, line]) => ({
        ...line,

        key: `${floor}/${lineKey}`,

        floor,

        label: `${floor.replace("_", " ")} ${lineKey.replace("_", " ")}`,
      }));

    if (filters.floor === "Combined") {
      return [
        ...build("Manufacturing_Floor", linesByFloor.Manufacturing_Floor),

        ...build("Assembly_Floor", linesByFloor.Assembly_Floor),
      ];
    }

    return build(
      filters.floor,

      linesByFloor[filters.floor],
    );
  }, [filters.floor, linesByFloor]);

  // ===========================================
  // OPTIONS
  // ===========================================

  const lineOptions = useMemo(
    () =>
      normalizedLines.map((line) => ({
        value: line.key,

        label: line.label,
      })),

    [normalizedLines],
  );

  const machineOptions = useMemo(
    () =>
      Array.from(
        new Set(normalizedLines.map((line) => line.machineId).sort()),
      ).map((machineId) => ({
        value: machineId,

        label: machineId,
      })),

    [normalizedLines],
  );

  const productOptions = useMemo(
    () =>
      Array.from(
        new Set(
          normalizedLines.map((line) => line.productCode).filter(Boolean),
        ),
      ).map((product) => ({
        value: product,

        label: product,
      })),

    [normalizedLines],
  );

  // ===========================================
  // SELECTED LINE
  // ===========================================

  // ===========================================
  // COMBINED DATA
  // ===========================================

  const combinedLineRecords = useMemo(
    () => ({
      ...linesByFloor.Manufacturing_Floor,

      ...linesByFloor.Assembly_Floor,
    }),

    [linesByFloor],
  );

  const combinedMachineRecords = useMemo(
    () => ({
      ...machinesByFloor.Manufacturing_Floor,

      ...machinesByFloor.Assembly_Floor,
    }),

    [machinesByFloor],
  );

  // ===========================================
  // MACHINE LISTENERS
  // ===========================================

  const machineHistoryListeners = useMemo(
    () =>
      normalizedLines.map((line) => ({
        floor: line.floor,

        machineId: line.machineId,
      })),

    [normalizedLines],
  );

  // ===========================================
  // MACHINE HISTORY
  // ===========================================

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    machineHistoryListeners.forEach((entry) => {
      const historyKey = `${entry.floor}/${entry.machineId}`;

      const unsubscribe = listenMachineHistory(
        entry.machineId,

        (history: Record<string, CounterHistoryPoint>) => {
          setHistoryByMachine((prev) => ({
            ...prev,

            [historyKey]: (
              Object.values(history) as CounterHistoryPoint[]
            ).sort((a, b) => a.timestamp - b.timestamp),
          }));
        },
      );

      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  }, [machineHistoryListeners]);

  // ===========================================
  // FILTERED HISTORY
  // ===========================================

  const selectedRangeHistory = useMemo(() => {
    const startTime = new Date(filters.startDate).setHours(0, 0, 0, 0);

    const endTime = new Date(filters.endDate).setHours(23, 59, 59, 999);

    return Object.entries(historyByMachine).flatMap(([historyKey, history]) => {
      const line = normalizedLines.find(
        (line) => `${line.floor}/${line.machineId}` === historyKey,
      );

      if (!line) {
        return [];
      }

      if (filters.line && line.key !== filters.line) {
        return [];
      }

      if (filters.machine && line.machineId !== filters.machine) {
        return [];
      }

      if (filters.product && line.productCode !== filters.product) {
        return [];
      }

      return filterHistoryByRange(history, startTime, endTime);
    });
  }, [filters, historyByMachine, normalizedLines]);

  // ===========================================
  // REALTIME STATUS
  // ===========================================

  const machineStatuses = computeRealtimeStatus(
    filters.floor === "Combined"
      ? combinedMachineRecords
      : machinesByFloor[filters.floor],

    filters.floor === "Combined"
      ? combinedLineRecords
      : linesByFloor[filters.floor],
  );

  // ===========================================
  // ANALYTICS
  // ===========================================

  const cycleStats = calculateCycleTimeStats(selectedRangeHistory);

  const hourlyIntensity = buildHeatmap(selectedRangeHistory);

  const patternSummary = summarizePatterns(selectedRangeHistory);

  const lineComparisonData = normalizedLines.map((line) => ({
    label: line.label,

    actual: selectedRangeHistory
      .filter((item) => item.machineId === line.machineId)
      .reduce((sum, item) => sum + item.count, 0),

    target: line.hourlyTarget * granularityScale[filters.granularity],
  }));

  // ===========================================
  // TOTALS
  // ===========================================

  const totalTarget =
    normalizedLines.reduce((sum, line) => sum + line.hourlyTarget, 0) *
    granularityScale[filters.granularity];

  const totalOutput = selectedRangeHistory.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const completionRate =
    totalTarget > 0 ? Math.round((totalOutput / totalTarget) * 100) : 0;

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Enterprise Production Analytics
        </h1>

        <p className="mt-2 text-gray-600">
          Real-time production analytics dashboard
        </p>
      </div>

      <AnalyticsFilters
        filters={filters}
        floors={floorOptions}
        lines={lineOptions}
        machines={machineOptions}
        products={productOptions}
        onFilterChange={(patch) =>
          setFilters((current) => ({
            ...current,
            ...patch,
          }))
        }
      />

      <div className="mt-8">
        <AnalyticsMetrics
          totalOutput={totalOutput}
          totalTarget={totalTarget}
          completionRate={completionRate}
          remaining={Math.max(totalTarget - totalOutput, 0)}
          avgCycleTime={cycleStats.average}
          onlineMachines={
            machineStatuses.filter((status) => status.status === "online")
              .length
          }
          offlineMachines={
            machineStatuses.filter((status) => status.status === "offline")
              .length
          }
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[2fr_1fr]">
        <AnalyticsCharts
          productionTrend={[]}
          cycleTimeTrend={[]}
          lineComparison={lineComparisonData}
          floorContribution={[]}
          cycleTimeDistribution={[]}
          hourlyIntensity={hourlyIntensity}
        />

        <RealtimeStatusPanel statuses={machineStatuses} />
      </div>

      <div className="mt-8">
        <AnalyticsHeatmap hourlyHeatmap={hourlyIntensity} />
      </div>

      <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">
          Production Patterns
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500">Peak Hour</p>

            <p className="text-lg font-semibold">
              {patternSummary.peakHour || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Slow Hour</p>

            <p className="text-lg font-semibold">
              {patternSummary.slowHour || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
