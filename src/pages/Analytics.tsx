// import { useEffect, useMemo, useState } from "react";

// import { Activity, BarChart3, TrendingUp, Clock3, Factory } from "lucide-react";

// import { ref, onValue } from "firebase/database";

// import { database } from "../services/firebase";

// import AnalyticsMetrics from "../components/dashboard/analytics/AnalyticsMetrics";

// import AnalyticsFilters from "../components/dashboard/analytics/AnalyticsFilters";

// import AnalyticsHeatmap from "../components/dashboard/analytics/AnalyticsHeatmap";

// import RealtimeStatusPanel from "../components//dashboard/analytics/RealtimeStatusPanel";

// import type { AnalyticsFilters as AnalyticsFilterType, FloorName, RealtimeMachineStatus } from "../types/analytics";
// import AnalyticsOverviewCard from "../components/dashboard/AnalyticsOverviewCard";
// import ProductionLineChart from "../components/dashboard/analytics/AnalyticsCharts";

// // ===============================================
// // TYPES
// // ===============================================

// interface LineData {
//   machineId?: string;

//   productCode?: string;

//   hourlyTarget?: number;

//   dailyTarget?: number;

//   plannedMembers?: number;
// }

// interface MachineData {
//   status?: string;

//   machineState?: string;

//   LiveStatus?: {
//     Count?: number;

//     LastCycleTime?: number;

//     LastUpdate?: string;
//   };
// }

// // ===============================================
// // COMPONENT
// // ===============================================

// export default function Analytics() {
//   // ===========================================
//   // STATES
//   // ===========================================

//   const [lines, setLines] = useState<Record<string, LineData>>({});

//   const [machines, setMachines] = useState<Record<string, MachineData>>({});

//   const [filters, setFilters] = useState<AnalyticsFilterType>({
//     floor: "Combined",

//     startDate: "",

//     endDate: "",

//     granularity: "daily",
//   });

//   // ===========================================
//   // LOAD FIREBASE
//   // ===========================================

//   useEffect(() => {
//     const linesRef = ref(database, "Lines");

//     const machinesRef = ref(database);

//     const unsubscribeLines = onValue(linesRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setLines(snapshot.val());
//       } else {
//         setLines({});
//       }
//     });

//     const unsubscribeMachines = onValue(machinesRef, (snapshot) => {
//       const machineData: Record<string, MachineData> = {};

//       if (snapshot.exists()) {
//         const data = snapshot.val();

//         Object.keys(data).forEach((key) => {
//           if (key.startsWith("Machine_")) {
//             machineData[key] = data[key];
//           }
//         });
//       }

//       setMachines(machineData);
//     });

//     return () => {
//       unsubscribeLines();

//       unsubscribeMachines();
//     };
//   }, []);

//   // ===========================================
//   // REALTIME STATUS
//   // ===========================================

//   const realtimeStatuses: RealtimeMachineStatus[] = useMemo(() => {
//     return Object.entries(lines).map(([lineKey, line]) => {
//       const machine = machines[line.machineId || ""];

//       // =====================================
//       // LAST UPDATE CHECK
//       // =====================================

//       const lastUpdate = machine?.LiveStatus?.LastUpdate;

//       let isOnline = false;

//       if (lastUpdate) {
//         const lastTime = new Date(lastUpdate.replace(/\//g, "-")).getTime();
//         // eslint-disable-next-line react-hooks/purity
//         const now = Date.now();

//         // 30 seconds timeout

//         isOnline = now - lastTime < 30000;
//       }

//       return {
//         lineKey,

//         machineId: line.machineId || "N/A",

//         currentCount: Number(machine?.LiveStatus?.Count || 0),

//         lastCycleTimeSec: Number(machine?.LiveStatus?.LastCycleTime || 0),

//         status: isOnline ? "online" : "offline",
//       };
//     });
//   }, [lines, machines]);
//   // ===========================================
//   // METRICS
//   // ===========================================

//   const totalOutput = realtimeStatuses.reduce((sum, item) => sum + item.currentCount, 0);

//   const totalTarget = Object.values(lines).reduce((sum, line) => sum + Number(line.dailyTarget || 0), 0);

//   const completionRate = totalTarget > 0 ? Number(((totalOutput / totalTarget) * 100).toFixed(0)) : 0;

//   const remaining = Math.max(totalTarget - totalOutput, 0);

//   const avgCycleTime = realtimeStatuses.length > 0 ? realtimeStatuses.reduce((sum, item) => sum + (item.lastCycleTimeSec || 0), 0) / realtimeStatuses.length : 0;

//   const onlineMachines = realtimeStatuses.filter((item) => item.status === "online").length;

//   const offlineMachines = realtimeStatuses.length - onlineMachines;

//   // ===========================================
//   // HEATMAP
//   // ===========================================

//   const hourlyHeatmap = [
//     { hour: "08:00", value: 40 },
//     { hour: "09:00", value: 65 },
//     { hour: "10:00", value: 82 },
//     { hour: "11:00", value: 90 },
//     { hour: "12:00", value: 35 },
//     { hour: "13:00", value: 74 },
//     { hour: "14:00", value: 98 },
//     { hour: "15:00", value: 110 },
//     { hour: "16:00", value: 76 },
//     { hour: "17:00", value: 50 },
//   ];

//   // ===========================================
//   // FILTER OPTIONS
//   // ===========================================

//   const floors: FloorName[] = ["Combined", "Manufacturing_Floor", "Assembly_Floor"];

//   const lineOptions = Object.keys(lines).map((line) => ({
//     value: line,

//     label: line.replace("_", " "),
//   }));

//   const machineOptions = Object.values(lines).map((line) => ({
//     value: line.machineId || "",

//     label: line.machineId || "",
//   }));

//   const productOptions = Object.values(lines).map((line) => ({
//     value: line.productCode || "",

//     label: line.productCode || "",
//   }));

//   // ===========================================
//   // RENDER
//   // ===========================================

//   return (
//     <div className="space-y-8">
//       {/* =================================== */}
//       {/* PAGE HEADER */}
//       {/* =================================== */}

//       <div
//         className="
//           bg-white
//           rounded-3xl
//           border
//           border-gray-200
//           p-8
//           shadow-sm
//         "
//       >
//         <div
//           className="
//             flex
//             flex-col
//             xl:flex-row
//             xl:items-center
//             xl:justify-between
//             gap-6
//           "
//         >
//           <div className="flex items-center gap-5">
//             <div
//               className="
//                 bg-blue-100
//                 p-5
//                 rounded-3xl
//               "
//             >
//               <BarChart3 className="text-blue-600" size={38} />
//             </div>

//             <div>
//               <h1
//                 className="
//                   text-4xl
//                   font-black
//                   text-gray-900
//                 "
//               >
//                 Analytics Dashboard
//               </h1>

//               <p className="text-gray-500 mt-2 text-lg">Real-time factory analytics and production insights</p>
//             </div>
//           </div>

//           <div
//             className="
//               flex
//               flex-wrap
//               gap-4
//             "
//           >
//             <div
//               className="
//                 bg-emerald-50
//                 border
//                 border-emerald-200
//                 rounded-3xl
//                 px-6
//                 py-5
//                 min-w-56
//               "
//             >
//               <div className="flex items-center gap-3">
//                 <Factory className="text-emerald-600" size={24} />

//                 <div>
//                   <p className="text-sm text-emerald-700">Factory Status</p>

//                   <h3
//                     className="
//                       text-2xl
//                       font-bold
//                       text-emerald-800
//                     "
//                   >
//                     Production Running
//                   </h3>
//                 </div>
//               </div>
//             </div>

//             <div
//               className="
//                 bg-blue-50
//                 border
//                 border-blue-200
//                 rounded-3xl
//                 px-6
//                 py-5
//                 min-w-56
//               "
//             >
//               <div className="flex items-center gap-3">
//                 <Activity className="text-blue-600" size={24} />

//                 <div>
//                   <p className="text-sm text-blue-700">Monitoring</p>

//                   <h3
//                     className="
//                       text-2xl
//                       font-bold
//                       text-blue-800
//                     "
//                   >
//                     Live Analytics
//                   </h3>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* =================================== */}
//       {/* FILTERS */}
//       {/* =================================== */}

//       <AnalyticsFilters
//         filters={filters}
//         floors={floors}
//         lines={lineOptions}
//         machines={machineOptions}
//         products={productOptions}
//         onFilterChange={(patch) =>
//           setFilters((prev) => ({
//             ...prev,
//             ...patch,
//           }))
//         }
//       />

//       {/* =================================== */}
//       {/* METRICS */}
//       {/* =================================== */}

//       <AnalyticsMetrics
//         totalOutput={totalOutput}
//         totalTarget={totalTarget}
//         completionRate={completionRate}
//         remaining={remaining}
//         avgCycleTime={avgCycleTime}
//         onlineMachines={onlineMachines}
//         offlineMachines={offlineMachines}
//       />

//       {/* =================================== */}
//       {/* REALTIME STATUS PANEL */}
//       {/* =================================== */}

//       <RealtimeStatusPanel statuses={realtimeStatuses} />

//       {/* =================================== */}
//       {/* OVERVIEW CARDS */}
//       {/* =================================== */}

//       <div
//         className="
//           grid
//           gap-6
//           md:grid-cols-2
//           xl:grid-cols-3
//         "
//       >
//         {Object.entries(lines).map(([lineKey, line]) => {
//           const machine = machines[line.machineId || ""];

//           return (
//             <AnalyticsOverviewCard
//               key={lineKey}
//               line={lineKey.replace("_", " ")}
//               product={line.productCode || "N/A"}
//               machine={line.machineId || "N/A"}
//               output={Number(machine?.LiveStatus?.Count || 0)}
//               target={Number(line.dailyTarget || 0)}
//               status={machine?.status === "online" ? "online" : "offline"}
//               onClick={() => {}}
//             />
//           );
//         })}
//       </div>

//       {/* =================================== */}
//       {/* CHART PLACEHOLDER */}
//       {/* =================================== */}

//       <div
//         className="
//           grid
//           gap-6
//           xl:grid-cols-2
//         "
//       >
//         {/* PRODUCTION TREND */}

//         <div
//           className="
//             bg-white
//             rounded-3xl
//             border
//             border-gray-200
//             p-6
//             shadow-sm
//           "
//         >
//           <div className="flex items-center gap-3 mb-6">
//             <TrendingUp className="text-green-600" size={24} />

//             <div>
//               <h2
//                 className="
//                   text-2xl
//                   font-bold
//                   text-gray-900
//                 "
//               >
//                 Production Trend
//               </h2>

//               <p className="text-gray-500">Live production analytics</p>
//             </div>
//           </div>
//           <div className="h-80">
//             <ProductionLineChart />
//           </div>
//         </div>

//         {/* CYCLE TIME */}

//         <div
//           className="
//             bg-white
//             rounded-3xl
//             border
//             border-gray-200
//             p-6
//             shadow-sm
//           "
//         >
//           <div className="flex items-center gap-3 mb-6">
//             <Clock3 className="text-orange-600" size={24} />

//             <div>
//               <h2
//                 className="
//                   text-2xl
//                   font-bold
//                   text-gray-900
//                 "
//               >
//                 Cycle Time Trend
//               </h2>

//               <p className="text-gray-500">Machine performance analysis</p>
//             </div>
//           </div>

//           <div
//             className="
//               h-80
//               rounded-3xl
//               border-2
//               border-dashed
//               border-gray-200
//               flex
//               items-center
//               justify-center
//             "
//           >
//             <div className="text-center">
//               <Clock3
//                 className="
//                   mx-auto
//                   text-gray-300
//                   mb-4
//                 "
//                 size={60}
//               />

//               <p className="text-gray-500 text-lg">Cycle time chart area</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* =================================== */}
//       {/* HEATMAP */}
//       {/* =================================== */}

//       <AnalyticsHeatmap hourlyHeatmap={hourlyHeatmap} />
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { ref, onValue, off, type DatabaseReference } from "firebase/database";
import { database } from "../services/firebase"; // ← ඔයාගේ firebase config path එකට match කරන්න

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineData {
  assignedDate: string;
  dailyTarget: number;
  floor: string;
  hourlyTarget: number;
  machineId: string;
  plannedMembers: number;
  productCode: string;
  productionStartTime: string;
  shift: string;
  supervisor: string;
  totalProductCount: number;
}

interface LiveStatus {
  Count: number;
  LastUpdate: string;
}

interface CounterEntry {
  Count: number;
  Time: string;
}

interface MachineData {
  LiveStatus: LiveStatus;
  CounterHistory: Record<string, CounterEntry>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n?: number | null) => (n == null ? "—" : Number(n).toLocaleString());

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, colorClass }: { label: string; value: string; sub?: string; colorClass?: string }) {
  return (
    <div className="bg-secondary rounded-lg p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-medium leading-none ${colorClass ?? "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function ProgressBar({ label, current, target }: { label: string; current: number; target: number }) {
  const p = pct(current, target);
  const fillColor = p >= 100 ? "bg-green-600" : p >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm text-muted-foreground mb-1">
        <span>{label}</span>
        <span>
          {fmt(current)} / {fmt(target)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${fillColor}`} style={{ width: `${Math.min(p, 100)}%` }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductionDashboard() {
  const [lineData, setLineData] = useState<LineData | null>(null);
  const [machineData, setMachineData] = useState<MachineData | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [lastSync, setLastSync] = useState<string>("");

  // Firebase real-time listeners ─────────────────────────────────────────────
  useEffect(() => {
    const lineRef: DatabaseReference = ref(database, "Lines/Line_01");
    const machineRef: DatabaseReference = ref(database, "Machine_01");

    const unsubLine = onValue(
      lineRef,
      (snap) => {
        if (snap.exists()) setLineData(snap.val() as LineData);
      },
      () => setStatus("error"),
    );

    const unsubMachine = onValue(
      machineRef,
      (snap) => {
        if (snap.exists()) {
          setMachineData(snap.val() as MachineData);
          setStatus("live");
          setLastSync(new Date().toLocaleTimeString());
        }
      },
      () => setStatus("error"),
    );

    return () => {
      off(lineRef);
      off(machineRef);
      unsubLine();
      unsubMachine();
    };
  }, []);

  // Derived values ───────────────────────────────────────────────────────────
  const liveCount = machineData?.LiveStatus?.Count ?? 0;
  const daily = lineData?.dailyTarget ?? 0;
  const total = lineData?.totalProductCount ?? 0;
  const dailyPct = pct(liveCount, daily);

  const counterHistory = Object.values(machineData?.CounterHistory ?? {}).sort((a, b) => a.Time.localeCompare(b.Time));

  const dailyColorClass = dailyPct >= 100 ? "text-green-600" : dailyPct >= 60 ? "text-amber-500" : "text-red-500";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ${status === "live" ? "bg-green-600 animate-pulse" : status === "error" ? "bg-red-500" : "bg-muted-foreground"}`} />
          <h1 className="text-xl font-medium">Line_01 — {lineData?.machineId ?? "Machine_01"}</h1>
          <span className="text-xs px-3 py-1 rounded-full border border-border bg-secondary text-muted-foreground capitalize">
            {status === "live" ? "Live" : status === "error" ? "Connection error" : "Connecting..."}
          </span>
        </div>
        {lastSync && <span className="text-xs text-muted-foreground">Last sync: {lastSync}</span>}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <MetricCard label="Live count" value={fmt(liveCount)} sub="units produced" />
        <MetricCard label="Daily target" value={fmt(daily)} sub="units / day" />
        <MetricCard label="Hourly target" value={fmt(lineData?.hourlyTarget)} sub="units / hr" />
        <MetricCard label="Total goal" value={fmt(total)} sub="product count" />
        <MetricCard label="Team size" value={fmt(lineData?.plannedMembers)} sub="planned members" />
        <MetricCard label="Daily progress" value={`${dailyPct}%`} sub="of daily target" colorClass={dailyColorClass} />
      </div>

      {/* Progress bars */}
      <div className="rounded-xl border border-border bg-background p-5 mb-6">
        <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">Production progress</h2>
        <ProgressBar label="Daily target" current={liveCount} target={daily} />
        <ProgressBar label="Total production goal" current={liveCount} target={total} />
      </div>

      {/* Details + History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Line details */}
        <div className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">Line details</h2>
          {(
            [
              ["Product code", lineData?.productCode],
              ["Floor", lineData?.floor?.replace("_", " ")],
              ["Shift", lineData?.shift],
              ["Start time", lineData?.productionStartTime],
              ["Supervisor", lineData?.supervisor],
              ["Machine", lineData?.machineId],
            ] as [string, string | undefined][]
          ).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-0 text-sm">
              <span className="text-muted-foreground">{key}</span>
              <span className="font-medium">
                {key === "Shift" && val ? <span className="px-3 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{val}</span> : (val ?? "—")}
              </span>
            </div>
          ))}
        </div>

        {/* Counter history */}
        <div className="rounded-xl border border-border bg-background p-5">
          <h2 className="text-xs uppercase tracking-wide text-muted-foreground mb-4">Counter history</h2>
          {counterHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No history data yet</p>
          ) : (
            <div className="overflow-y-auto max-h-52">
              {counterHistory.map((entry, i) => (
                <div key={i} className="flex justify-between text-xs py-1.5 border-b border-border last:border-0 text-muted-foreground">
                  <span>{entry.Time}</span>
                  <span className="font-medium text-foreground">{fmt(entry.Count)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Count trend mini chart using inline SVG */}
          {counterHistory.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Count trend</p>
              <CountTrendChart entries={counterHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mini trend chart (pure SVG, no Chart.js dependency) ─────────────────────

function CountTrendChart({ entries }: { entries: CounterEntry[] }) {
  const W = 400;
  const H = 80;
  const PAD = { t: 8, r: 8, b: 20, l: 30 };

  const counts = entries.map((e) => e.Count);
  const maxC = Math.max(...counts, 1);
  const minC = Math.min(...counts);
  const range = maxC - minC || 1;

  const xStep = (W - PAD.l - PAD.r) / Math.max(counts.length - 1, 1);

  const points = counts.map((c, i) => `${PAD.l + i * xStep},${PAD.t + ((maxC - c) / range) * (H - PAD.t - PAD.b)}`);

  const polyline = points.join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Count trend: ${counts.join(", ")}`}>
      {/* Y gridlines */}
      {[0, 0.5, 1].map((f) => (
        <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + f * (H - PAD.t - PAD.b)} y2={PAD.t + f * (H - PAD.t - PAD.b)} stroke="currentColor" strokeOpacity="0.1" strokeWidth="0.5" />
      ))}
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {points.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={3} fill="#1D9E75" />;
      })}
      {/* Y labels */}
      {[maxC, minC].map((v, i) => (
        <text key={i} x={PAD.l - 4} y={i === 0 ? PAD.t + 4 : H - PAD.b} textAnchor="end" fontSize="9" fill="currentColor" opacity="0.5">
          {v}
        </text>
      ))}
    </svg>
  );
}
