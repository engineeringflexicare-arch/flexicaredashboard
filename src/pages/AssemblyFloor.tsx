// import { useEffect, useState } from "react";

// import { PackageCheck, Cpu, Wrench } from "lucide-react";

// import { ref, onValue } from "firebase/database";

// import { database } from "../services/firebase";

// import { getFloorMachineStatuses } from "../services/machineStatusService";

// import { getActiveMaintenanceAlerts } from "../services/maintenanceService";

// import ProductionTable from "../components/dashboard/ProductionTable";

// import LineCard from "../components/dashboard/LineCard";

// import FloorStatsCard from "../components/floor/FloorStatsCard";

// import type { LineData } from "../types/production";

// import type { MachineStatus } from "../types/machineStatus";

// import type { MaintenanceAlert } from "../types/maintenance";

// // ===============================================
// // COMPONENT
// // ===============================================

// export default function AssemblyFloor() {
//   // ===========================================
//   // CONSTANTS
//   // ===========================================

//   const floor = "Assembly_Floor";

//   const floorLabel = "Assembly Floor";

//   // ===========================================
//   // STATES
//   // ===========================================

//   const [lines, setLines] = useState<Record<string, LineData>>({});

//   const [liveCounts, setLiveCounts] = useState<Record<string, number>>({});

//   const [machineStatuses, setMachineStatuses] = useState<MachineStatus[]>([]);

//   const [maintenanceAlerts, setMaintenanceAlerts] = useState<
//     MaintenanceAlert[]
//   >([]);

//   // ===========================================
//   // LOAD REALTIME DATA
//   // ===========================================

//   useEffect(() => {
//     const linesRef = ref(database, "Lines");

//     const machinesRef = ref(database, "Machines");

//     // =======================================
//     // LOAD LINES
//     // =======================================

//     const unsubscribeLines = onValue(
//       linesRef,

//       (snapshot) => {
//         if (snapshot.exists()) {
//           setLines(snapshot.val() as Record<string, LineData>);
//         } else {
//           setLines({});
//         }
//       },
//     );

//     // =======================================
//     // LOAD MACHINE COUNTS
//     // =======================================

//     const unsubscribeMachines = onValue(
//       machinesRef,

//       (snapshot) => {
//         const counts: Record<string, number> = {};

//         if (snapshot.exists()) {
//           const machines = snapshot.val() as Record<
//             string,
//             {
//               LiveStatus?: {
//                 Count?: number;
//               };
//             }
//           >;

//           Object.keys(machines).forEach((machineId) => {
//             counts[machineId] = Number(
//               machines[machineId]?.LiveStatus?.Count || 0,
//             );
//           });
//         }

//         setLiveCounts(counts);
//       },
//     );

//     // =======================================
//     // CLEANUP
//     // =======================================

//     return () => {
//       unsubscribeLines();

//       unsubscribeMachines();
//     };
//   }, []);

//   // ===========================================
//   // LOAD MACHINE STATUS + ALERTS
//   // ===========================================

//   useEffect(() => {
//     const fetchStatuses = async () => {
//       try {
//         const statuses = await getFloorMachineStatuses();

//         setMachineStatuses(statuses);

//         const alerts = await getActiveMaintenanceAlerts();

//         setMaintenanceAlerts(alerts);
//       } catch (error) {
//         console.error("Status Fetch Error:", error);
//       }
//     };

//     void fetchStatuses();

//     const interval = window.setInterval(fetchStatuses, 30000);

//     return () => window.clearInterval(interval);
//   }, []);

//   // ===========================================
//   // CALCULATIONS
//   // ===========================================

//   const totalLines = Object.keys(lines).length;

//   const totalTarget = Object.values(lines).reduce(
//     (sum, line) => sum + Number(line.hourlyTarget || 0),

//     0,
//   );

//   const totalOutput = Object.values(lines).reduce(
//     (sum, line) => sum + Number(liveCounts[line.machineId] || 0),

//     0,
//   );

//   const runningMachines = machineStatuses.filter(
//     (machine) => machine.isOnline,
//   ).length;

//   // ===========================================
//   // FILTER FLOOR LINES
//   // ===========================================

//   const filteredLines = Object.entries(lines).filter(
//     ([, line]) => line.floor === floor,
//   );

//   // ===========================================
//   // RENDER
//   // ===========================================

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 md:p-6">
//       {/* =================================== */}
//       {/* HEADER */}
//       {/* =================================== */}

//       <div
//         className="
//           bg-white
//           rounded-3xl
//           border
//           border-gray-200
//           shadow-sm
//           p-6
//           mb-6
//         "
//       >
//         <div
//           className="
//             flex
//             flex-col
//             lg:flex-row
//             lg:items-center
//             lg:justify-between
//             gap-5
//           "
//         >
//           <div className="flex items-center gap-4">
//             <div
//               className="
//                 bg-orange-100
//                 p-4
//                 rounded-2xl
//               "
//             >
//               <PackageCheck className="text-orange-600" size={32} />
//             </div>

//             <div>
//               <h1
//                 className="
//                   text-3xl
//                   font-bold
//                   text-gray-800
//                 "
//               >
//                 {floorLabel}
//               </h1>

//               <p className="text-gray-500 mt-1">
//                 Real-time production monitoring dashboard
//               </p>
//             </div>
//           </div>

//           <div
//             className="
//               bg-green-100
//               text-green-700
//               px-5
//               py-3
//               rounded-2xl
//               flex
//               items-center
//               gap-3
//             "
//           >
//             <div
//               className="
//                 w-3
//                 h-3
//                 rounded-full
//                 bg-green-500
//                 animate-pulse
//               "
//             ></div>

//             <div>
//               <p className="text-xs uppercase">Factory Status</p>

//               <p className="font-bold">Production Active</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* =================================== */}
//       {/* FLOOR STATS */}
//       {/* =================================== */}

//       <div className="mb-6">
//         <FloorStatsCard
//           floorLabel={floorLabel}
//           totalLines={totalLines}
//           totalOutput={totalOutput}
//           totalTarget={totalTarget}
//           runningMachines={runningMachines}
//           totalMachines={machineStatuses.length}
//           maintenanceAlerts={maintenanceAlerts.length}
//           machineStatuses={machineStatuses}
//         />
//       </div>

//       {/* =================================== */}
//       {/* LINE CARDS */}
//       {/* =================================== */}

//       <div className="mb-6">
//         <div
//           className="
//             flex
//             items-center
//             justify-between
//             mb-4
//           "
//         >
//           <h2
//             className="
//               text-2xl
//               font-bold
//               text-gray-800
//             "
//           >
//             Production Lines
//           </h2>

//           <span className="text-sm text-gray-500">Live Tracking</span>
//         </div>

//         <div
//           className="
//             grid
//             grid-cols-1
//             md:grid-cols-2
//             xl:grid-cols-3
//             gap-5
//           "
//         >
//           {filteredLines.map(([lineKey, line]) => (
//             <LineCard
//               key={lineKey}
//               line={lineKey}
//               product={line.productCode || "N/A"}
//               machine={line.machineId || "N/A"}
//               target={Number(line.hourlyTarget || 0)}
//               current={Number(liveCounts[line.machineId] || 0)}
//             />
//           ))}
//         </div>
//       </div>

//       {/* =================================== */}
//       {/* MACHINE STATUS + ALERTS */}
//       {/* =================================== */}

//       <div
//         className="
//           grid
//           grid-cols-1
//           xl:grid-cols-2
//           gap-6
//           mb-6
//         "
//       >
//         {/* ================================= */}
//         {/* RUNNING MACHINES */}
//         {/* ================================= */}

//         <div
//           className="
//             bg-white
//             rounded-3xl
//             border
//             border-gray-200
//             shadow-sm
//             p-6
//           "
//         >
//           <div className="flex items-center gap-3 mb-5">
//             <div
//               className="
//                 bg-green-100
//                 p-3
//                 rounded-2xl
//               "
//             >
//               <Cpu className="text-green-600" size={24} />
//             </div>

//             <div>
//               <h2
//                 className="
//                   text-xl
//                   font-bold
//                   text-gray-800
//                 "
//               >
//                 Running Machines
//               </h2>

//               <p className="text-sm text-gray-500">
//                 Active production machines
//               </p>
//             </div>
//           </div>

//           <div className="space-y-3">
//             {machineStatuses
//               .filter((machine) => machine.isOnline)
//               .map((machine) => (
//                 <div
//                   key={machine.machineId}
//                   className="
//                     bg-gray-50
//                     border
//                     border-gray-200
//                     rounded-2xl
//                     p-4
//                     flex
//                     items-center
//                     justify-between
//                   "
//                 >
//                   <div>
//                     <h3
//                       className="
//                         font-semibold
//                         text-gray-800
//                       "
//                     >
//                       {machine.machineId}
//                     </h3>

//                     <p
//                       className="
//                         text-sm
//                         text-gray-500
//                       "
//                     >
//                       Current Output: {machine.currentCount}
//                     </p>
//                   </div>

//                   <div
//                     className="
//                       bg-green-100
//                       text-green-700
//                       px-3
//                       py-1
//                       rounded-full
//                       text-sm
//                       font-semibold
//                     "
//                   >
//                     Running
//                   </div>
//                 </div>
//               ))}

//             {runningMachines === 0 && (
//               <div
//                 className="
//                   bg-gray-50
//                   border
//                   border-gray-200
//                   rounded-2xl
//                   p-5
//                   text-center
//                 "
//               >
//                 <p className="text-gray-500">No running machines</p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ================================= */}
//         {/* MAINTENANCE ALERTS */}
//         {/* ================================= */}

//         <div
//           className="
//             bg-white
//             rounded-3xl
//             border
//             border-gray-200
//             shadow-sm
//             p-6
//           "
//         >
//           <div className="flex items-center gap-3 mb-5">
//             <div
//               className="
//                 bg-red-100
//                 p-3
//                 rounded-2xl
//               "
//             >
//               <Wrench className="text-red-600" size={24} />
//             </div>

//             <div>
//               <h2
//                 className="
//                   text-xl
//                   font-bold
//                   text-gray-800
//                 "
//               >
//                 Maintenance Alerts
//               </h2>

//               <p className="text-sm text-gray-500">
//                 Machines requiring attention
//               </p>
//             </div>
//           </div>

//           <div className="space-y-3">
//             {maintenanceAlerts.length > 0 ? (
//               maintenanceAlerts.map((alert) => (
//                 <div
//                   key={alert.id}
//                   className="
//                     bg-red-50
//                     border
//                     border-red-200
//                     rounded-2xl
//                     p-4
//                   "
//                 >
//                   <div className="flex justify-between">
//                     <div>
//                       <h3
//                         className="
//                           font-semibold
//                           text-red-700
//                         "
//                       >
//                         {alert.machineId}
//                       </h3>

//                       <p
//                         className="
//                           text-sm
//                           text-red-500
//                           mt-1
//                         "
//                       >
//                         {alert.breakdownDetails}
//                       </p>
//                     </div>

//                     <span
//                       className="
//                         bg-red-100
//                         text-red-700
//                         text-xs
//                         font-bold
//                         px-3
//                         py-1
//                         rounded-full
//                         h-fit
//                       "
//                     >
//                       {alert.severity}
//                     </span>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div
//                 className="
//                   bg-green-50
//                   border
//                   border-green-200
//                   rounded-2xl
//                   p-5
//                 "
//               >
//                 <p className="text-green-700">No maintenance alerts</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* =================================== */}
//       {/* TABLE */}
//       {/* =================================== */}

//       <div
//         className="
//           bg-white
//           rounded-3xl
//           border
//           border-gray-200
//           shadow-sm
//           overflow-hidden
//         "
//       >
//         <div
//           className="
//             bg-gray-900
//             text-white
//             px-6
//             py-5
//           "
//         >
//           <h2
//             className="
//               text-xl
//               font-bold
//             "
//           >
//             Production Table
//           </h2>

//           <p
//             className="
//               text-sm
//               text-gray-300
//               mt-1
//             "
//           >
//             Real-time production monitoring
//           </p>
//         </div>

//         <div className="p-4">
//           <ProductionTable floor={floor} />
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "../services/firebase"; // ← ඔයාගේ path එකට match කරන්න
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineData {
  dailyTarget: number;
  hourlyTarget: number;
  totalProductCount: number;
  plannedMembers: number;
  productCode: string;
  shift: string;
  floor: string;
  supervisor: string;
  machineId: string;
  productionStartTime: string;
}

interface CounterEntry {
  Count: number;
  Time: string;
}

interface MachineData {
  LiveStatus: { Count: number; LastUpdate: string };
  CounterHistory: Record<string, CounterEntry>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n?: number | null) => (n == null ? "—" : Number(n).toLocaleString());

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

const TEAL = "#0ea5e9"; // Modern sky blue for primary
const GRAY = "#94a3b8"; // Slate 400 for secondary
const AMBER = "#f59e0b"; // Amber 500 for warnings/daily targets

// ─── Tooltip ──────────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-xl">
      {label && <p className="text-slate-500 text-xs mb-2 font-semibold tracking-wide uppercase">{label}</p>}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: p.color }} />
            <p className="font-medium text-slate-700">
              {p.name}: <span className="font-bold text-slate-900">{fmt(p.value)}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
        active ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/60" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "green" | "amber" | "red" }) {
  const colors = {
    green: "text-emerald-600",
    amber: "text-amber-600",
    red: "text-rose-600",
  };

  const bgColors = {
    green: "bg-emerald-50",
    amber: "bg-amber-50",
    red: "bg-rose-50",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</p>
      <div>
        <p className={`text-3xl font-extrabold tracking-tight mb-1 ${accent ? colors[accent] : "text-slate-800"}`}>{value}</p>
        {sub && (
          <div className="flex items-center gap-2">
            {accent && <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[accent]} ${bgColors[accent]}`}>Status</span>}
            <p className="text-xs font-medium text-slate-500">{sub}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────

function ChartCard({ title, legend, children }: { title: string; legend?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-slate-100 pb-4">
        <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
        {legend}
      </div>
      <div className="pt-2">{children}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/60">
      <span className="inline-block w-2 h-2 rounded-full shadow-sm" style={{ background: color }} />
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = "line" | "bar" | "donut";

export default function ProductionCharts() {
  const [lineData, setLineData] = useState<LineData | null>(null);
  const [machineData, setMachineData] = useState<MachineData | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [lastSync, setLastSync] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("line");

  // Firebase listeners ─────────────────────────────────────────────────────
  useEffect(() => {
    const lineRef = ref(database, "Lines/Line_01");
    const machineRef = ref(database, "Machine_01");

    const u1 = onValue(lineRef, (snap) => {
      if (snap.exists()) setLineData(snap.val());
    });
    const u2 = onValue(
      machineRef,
      (snap) => {
        if (snap.exists()) {
          setMachineData(snap.val());
          setStatus("live");
          setLastSync(new Date().toLocaleTimeString());
        }
      },
      () => setStatus("error"),
    );

    return () => {
      off(lineRef);
      off(machineRef);
      u1();
      u2();
    };
  }, []);

  // Derived data ────────────────────────────────────────────────────────────
  const liveCount = machineData?.LiveStatus?.Count ?? 0;
  const daily = lineData?.dailyTarget ?? 0;
  const hourly = lineData?.hourlyTarget ?? 0;
  const achieved = pct(liveCount, daily);

  const history = Object.values(machineData?.CounterHistory ?? {}).sort((a, b) => a.Time.localeCompare(b.Time));

  // Line chart data
  const lineChartData = history.map((e) => ({
    time: e.Time.split(" ")[1] ?? e.Time,
    count: e.Count,
    target: hourly,
  }));

  // Bar chart data
  const barData = [
    { name: "Live count", value: liveCount, fill: TEAL },
    { name: "Hourly target", value: hourly, fill: GRAY },
    { name: "Daily target", value: daily, fill: AMBER },
  ];

  // Donut chart data
  const remaining = Math.max(daily - liveCount, 0);
  const donutData = [
    { name: "Completed", value: liveCount, fill: TEAL },
    { name: "Remaining", value: remaining, fill: GRAY },
  ];

  const accentColor = achieved >= 100 ? "green" : achieved >= 60 ? "amber" : "red";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 font-sans text-slate-800 bg-slate-50 min-h-screen selection:bg-sky-100">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <span className="bg-sky-50 text-sky-600 p-2.5 rounded-xl border border-sky-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </span>
            {lineData?.machineId ?? "Machine_01"} Production
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 font-medium ml-[52px]">Live monitoring dashboard</p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {status === "live" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${status === "live" ? "bg-emerald-500" : status === "error" ? "bg-rose-500" : "bg-slate-400"}`} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700">{status === "live" ? "Online" : status === "error" ? "Error" : "Connecting"}</span>
          </div>
          {lastSync && (
            <div className="border-l border-slate-300 pl-3">
              <span className="text-xs font-bold text-slate-400">SYNCED: {lastSync}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard label="Live count" value={fmt(liveCount)} sub="units right now" />
        <MetricCard label="Daily target" value={fmt(daily)} sub="units / day" />
        <MetricCard label="Hourly target" value={fmt(hourly)} sub="units / hr" />
        <MetricCard label="Achievement" value={`${achieved}%`} sub="of daily target" accent={accentColor} />
      </div>

      {/* Tab switcher */}
      <div className="flex bg-slate-200/60 p-1.5 rounded-xl mb-6 w-fit border border-slate-200 shadow-inner">
        <TabBtn label="Count Over Time" active={activeTab === "line"} onClick={() => setActiveTab("line")} />
        <TabBtn label="Target vs Actual" active={activeTab === "bar"} onClick={() => setActiveTab("bar")} />
        <TabBtn label="Daily Progress" active={activeTab === "donut"} onClick={() => setActiveTab("donut")} />
      </div>

      {/* ── Line chart ── */}
      {activeTab === "line" && (
        <ChartCard
          title="Production Output Timeline"
          legend={
            <div className="flex gap-2">
              <LegendDot color={TEAL} label="Unit count" />
              <LegendDot color={GRAY} label="Hourly target" />
            </div>
          }
        >
          {lineChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-4 opacity-50"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <p className="text-sm font-medium">Waiting for counter history...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={lineChartData} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 12, fill: GRAY, fontWeight: 500 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis tick={{ fontSize: 12, fill: GRAY, fontWeight: 500 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} width={60} dx={-10} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.8 }} />
                <ReferenceLine
                  y={hourly}
                  stroke={GRAY}
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={{ value: "Hourly Target", fill: GRAY, fontSize: 11, fontWeight: 700, position: "insideTopRight", dy: -10 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Count"
                  stroke={TEAL}
                  strokeWidth={3.5}
                  dot={{ r: 4, fill: "white", stroke: TEAL, strokeWidth: 2.5 }}
                  activeDot={{ r: 7, strokeWidth: 0, fill: TEAL }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      )}

      {/* ── Bar chart ── */}
      {activeTab === "bar" && (
        <ChartCard
          title="Performance Targets Overview"
          legend={
            <div className="flex gap-2">
              <LegendDot color={TEAL} label="Actual" />
              <LegendDot color={GRAY} label="Targets" />
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600, fill: GRAY }} tickLine={false} axisLine={false} dy={10} />
              <YAxis tick={{ fontSize: 12, fill: GRAY, fontWeight: 500 }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} width={60} dx={-10} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="value" name="Units" radius={[6, 6, 0, 0]} maxBarSize={80} animationDuration={1000}>
                {barData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* ── Donut chart ── */}
      {activeTab === "donut" && (
        <ChartCard title="Daily Target Completion">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={85} outerRadius={115} dataKey="value" startAngle={90} endAngle={-270} paddingAngle={3} animationDuration={1200}>
                    {donutData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} className="stroke-white stroke-2" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="relative pl-6">
                <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full shadow-sm" style={{ background: TEAL }} />
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Completed Units</p>
                <div className="flex items-end gap-3">
                  <p className="text-4xl font-black text-slate-800">{fmt(liveCount)}</p>
                  <p className="text-sm font-bold text-emerald-600 mb-1.5 bg-emerald-100/50 px-2.5 py-0.5 rounded-md border border-emerald-200">{achieved}% of goal</p>
                </div>
              </div>

              <div className="relative pl-6">
                <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full shadow-sm" style={{ background: GRAY }} />
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Remaining Units</p>
                <div className="flex items-end gap-3">
                  <p className="text-3xl font-bold text-slate-600">{fmt(remaining)}</p>
                  <p className="text-sm font-semibold text-slate-500 mb-1">{Math.max(100 - achieved, 0)}% left to reach</p>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
