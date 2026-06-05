// import { useState } from "react";

// import {
//   Settings2,
//   Bell,
//   RefreshCcw,
//   Factory,
//   Save,
//   RotateCcw,
// } from "lucide-react";

// import { FLOORS } from "../constants/floors";

// // ===============================================
// // TYPES
// // ===============================================

// type AppSettings = {
//   defaultFloor: string;

//   refreshInterval: number;

//   enableNotifications: boolean;
// };

// // ===============================================
// // STORAGE
// // ===============================================

// const STORAGE_KEY = "appSettings";

// // ===============================================
// // DEFAULT SETTINGS
// // ===============================================

// const DEFAULTS: AppSettings = {
//   defaultFloor: FLOORS[0] || "Manufacturing_Floor",

//   refreshInterval: 30,

//   enableNotifications: false,
// };

// // ===============================================
// // SETTINGS PAGE
// // ===============================================

// export default function Settings() {
//   // ===========================================
//   // STATES
//   // ===========================================

//   const [settings, setSettings] = useState<AppSettings>(() => {
//     try {
//       const raw = localStorage.getItem(STORAGE_KEY);

//       if (!raw) {
//         return DEFAULTS;
//       }

//       return JSON.parse(raw) as AppSettings;
//     } catch (error) {
//       console.error("Failed loading settings", error);

//       return DEFAULTS;
//     }
//   });

//   const [saved, setSaved] = useState(false);

//   // ===========================================
//   // UPDATE SETTINGS
//   // ===========================================

//   const update = (patch: Partial<AppSettings>) => {
//     setSettings((current) => ({
//       ...current,

//       ...patch,
//     }));

//     setSaved(false);
//   };

//   // ===========================================
//   // SAVE SETTINGS
//   // ===========================================

//   const handleSave = () => {
//     try {
//       localStorage.setItem(
//         STORAGE_KEY,

//         JSON.stringify(settings),
//       );

//       setSaved(true);

//       setTimeout(() => setSaved(false), 2000);
//     } catch (error) {
//       console.error("Failed saving settings", error);
//     }
//   };

//   // ===========================================
//   // RESET SETTINGS
//   // ===========================================

//   const handleReset = () => {
//     setSettings(DEFAULTS);

//     localStorage.removeItem(STORAGE_KEY);

//     setSaved(true);

//     setTimeout(() => setSaved(false), 1500);
//   };

//   // ===========================================
//   // RENDER
//   // ===========================================

//   return (
//     <div className="min-h-screen bg-[#f3f4f6] p-4 md:p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* HEADER */}

//         <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
//             <div className="flex items-start gap-4">
//               <div className="bg-blue-100 p-4 rounded-2xl">
//                 <Settings2 className="text-blue-600" />
//               </div>

//               <div>
//                 <h1 className="text-3xl font-bold text-gray-800">Settings</h1>

//                 <p className="text-gray-500 mt-2">
//                   Manage dashboard preferences and system behavior.
//                 </p>
//               </div>
//             </div>

//             {saved && (
//               <div className="bg-green-100 border border-green-200 text-green-700 px-5 py-3 rounded-2xl text-sm font-medium">
//                 Settings Saved Successfully
//               </div>
//             )}
//           </div>
//         </div>

//         {/* SETTINGS PANEL */}

//         <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8">
//           <div className="space-y-8">
//             {/* DEFAULT FLOOR */}

//             <div>
//               <div className="flex items-center gap-3 mb-3">
//                 <Factory className="text-blue-600" size={18} />

//                 <label className="text-sm font-semibold text-gray-700">
//                   Default Floor
//                 </label>
//               </div>

//               <select
//                 className="w-full border border-gray-300 rounded-2xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={settings.defaultFloor}
//                 onChange={(e) =>
//                   update({
//                     defaultFloor: e.target.value,
//                   })
//                 }
//               >
//                 {FLOORS.map((floor) => (
//                   <option key={floor} value={floor}>
//                     {floor.replace("_", " ")}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* REFRESH INTERVAL */}

//             <div>
//               <div className="flex items-center gap-3 mb-3">
//                 <RefreshCcw className="text-orange-600" size={18} />

//                 <label className="text-sm font-semibold text-gray-700">
//                   Auto Refresh Interval
//                 </label>
//               </div>

//               <div className="flex items-center gap-4">
//                 <input
//                   type="number"
//                   min={5}
//                   max={300}
//                   className="w-40 border border-gray-300 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
//                   value={settings.refreshInterval}
//                   onChange={(e) =>
//                     update({
//                       refreshInterval: Math.max(
//                         5,

//                         Number(e.target.value) || 5,
//                       ),
//                     })
//                   }
//                 />

//                 <span className="text-sm text-gray-500">seconds</span>
//               </div>
//             </div>

//             {/* NOTIFICATIONS */}

//             <div>
//               <div className="flex items-center gap-3 mb-3">
//                 <Bell className="text-green-600" size={18} />

//                 <label className="text-sm font-semibold text-gray-700">
//                   Notifications
//                 </label>
//               </div>

//               <label className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={settings.enableNotifications}
//                   onChange={(e) =>
//                     update({
//                       enableNotifications: e.target.checked,
//                     })
//                   }
//                   className="w-5 h-5"
//                 />

//                 <span className="text-gray-700">
//                   Enable maintenance and emergency alerts
//                 </span>
//               </label>
//             </div>

//             {/* ACTION BUTTONS */}

//             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
//               <button
//                 onClick={handleSave}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition"
//               >
//                 <Save size={18} />
//                 Save Settings
//               </button>

//               <button
//                 onClick={handleReset}
//                 className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-2xl flex items-center gap-2 transition"
//               >
//                 <RotateCcw size={18} />
//                 Reset Defaults
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">{label}</p>
      <div>
        <p className={`text-3xl font-extrabold tracking-tight mb-1 ${colorClass ?? "text-slate-800"}`}>{value}</p>
        {sub && <p className="text-xs font-medium text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ label, current, target }: { label: string; current: number; target: number }) {
  const p = pct(current, target);
  const fillColor = p >= 100 ? "bg-emerald-500" : p >= 60 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between text-sm font-semibold text-slate-600 mb-2">
        <span>{label}</span>
        <span className="text-slate-800">
          {fmt(current)} <span className="text-slate-400 font-medium">/ {fmt(target)}</span>
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200/60">
        <div className={`h-full rounded-full transition-all duration-1000 ease-out ${fillColor}`} style={{ width: `${Math.min(p, 100)}%` }} />
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
    const machineRef: DatabaseReference = ref(database, "Machines/Machine_01");

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

  const dailyColorClass = dailyPct >= 100 ? "text-emerald-600" : dailyPct >= 60 ? "text-amber-500" : "text-rose-600";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans selection:bg-sky-100">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="bg-sky-50 text-sky-600 p-3 rounded-xl border border-sky-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13h2" />
              <path d="M8 17h2" />
              <path d="M14 13h2" />
              <path d="M14 17h2" />
            </svg>
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Line_01 — <span className="text-slate-500 font-medium">{lineData?.machineId ?? "Machine_01"}</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Detailed Line Overview</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {status === "live" && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${status === "live" ? "bg-emerald-500" : status === "error" ? "bg-rose-500" : "bg-slate-400"}`} />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-slate-700">{status === "live" ? "Live" : status === "error" ? "Connection Error" : "Connecting..."}</span>
          </div>
          {lastSync && (
            <div className="border-l border-slate-300 pl-3">
              <span className="text-xs font-bold text-slate-400">SYNCED: {lastSync}</span>
            </div>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <MetricCard label="Live count" value={fmt(liveCount)} sub="units produced" />
        <MetricCard label="Daily target" value={fmt(daily)} sub="units / day" />
        <MetricCard label="Hourly target" value={fmt(lineData?.hourlyTarget)} sub="units / hr" />
        <MetricCard label="Total goal" value={fmt(total)} sub="product count" />
        <MetricCard label="Team size" value={fmt(lineData?.plannedMembers)} sub="planned members" />
        <MetricCard label="Daily progress" value={`${dailyPct}%`} sub="of daily target" colorClass={dailyColorClass} />
      </div>

      {/* Progress bars */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 mb-8 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-sky-500 rounded-full inline-block"></span>
          Production Progress
        </h2>
        <div className="max-w-4xl">
          <ProgressBar label="Daily Goal Achievement" current={liveCount} target={daily} />
          <ProgressBar label="Total Order Completion" current={liveCount} target={total} />
        </div>
      </div>

      {/* Details + History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line details */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-slate-300 rounded-full inline-block"></span>
            Line Configuration
          </h2>

          <div className="bg-slate-50 rounded-xl border border-slate-100 p-2 flex-grow">
            {(
              [
                ["Product Code", lineData?.productCode],
                ["Floor Location", lineData?.floor?.replace("_", " ")],
                ["Assigned Shift", lineData?.shift],
                ["Production Start", lineData?.productionStartTime],
                ["Supervisor", lineData?.supervisor],
                ["Assigned Machine", lineData?.machineId],
              ] as [string, string | undefined][]
            ).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-3.5 px-4 border-b border-slate-200/60 last:border-0 hover:bg-slate-100/50 transition-colors rounded-lg">
                <span className="text-sm font-semibold text-slate-500">{key}</span>
                <span className="text-sm font-bold text-slate-800">
                  {key === "Assigned Shift" && val ? (
                    <span className="px-3 py-1 rounded-md text-xs uppercase tracking-wider font-bold bg-sky-100 text-sky-700 border border-sky-200">{val}</span>
                  ) : (
                    (val ?? "—")
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Counter history */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-400 rounded-full inline-block"></span>
            Counter History Log
          </h2>

          {counterHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-grow py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
              <p className="text-sm font-medium">No history data yet...</p>
            </div>
          ) : (
            <>
              <div className="overflow-y-auto max-h-56 pr-2 mb-6 custom-scrollbar">
                {counterHistory.map((entry, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      <span className="text-sm font-medium text-slate-500">{entry.Time}</span>
                    </div>
                    <span className="text-sm font-black text-slate-800 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">{fmt(entry.Count)}</span>
                  </div>
                ))}
              </div>

              {/* Count trend mini chart using inline SVG */}
              <div className="mt-auto bg-slate-50 p-5 rounded-xl border border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Output Trend Analysis</p>
                <CountTrendChart entries={counterHistory} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mini trend chart (pure SVG) ──────────────────────────────────────────────

function CountTrendChart({ entries }: { entries: CounterEntry[] }) {
  const W = 400;
  const H = 90;
  const PAD = { t: 10, r: 10, b: 24, l: 36 };

  const counts = entries.map((e) => e.Count);
  const maxC = Math.max(...counts, 1);
  const minC = Math.min(...counts);
  const range = maxC - minC || 1;

  const xStep = (W - PAD.l - PAD.r) / Math.max(counts.length - 1, 1);

  const points = counts.map((c, i) => `${PAD.l + i * xStep},${PAD.t + ((maxC - c) / range) * (H - PAD.t - PAD.b)}`);

  const polyline = points.join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full drop-shadow-sm" role="img" aria-label={`Count trend: ${counts.join(", ")}`}>
      {/* Y gridlines */}
      {[0, 0.5, 1].map((f) => (
        <line key={f} x1={PAD.l} x2={W - PAD.r} y1={PAD.t + f * (H - PAD.t - PAD.b)} y2={PAD.t + f * (H - PAD.t - PAD.b)} stroke="#cbd5e1" strokeOpacity="0.5" strokeDasharray="3 3" strokeWidth="1" />
      ))}

      {/* Line - Changed to Sky Blue theme to match the rest of the UI */}
      <polyline points={polyline} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {points.map((pt, i) => {
        const [x, y] = pt.split(",").map(Number);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4.5} fill="#ffffff" stroke="#0ea5e9" strokeWidth="2" />
          </g>
        );
      })}

      {/* Y labels */}
      {[maxC, minC].map((v, i) => (
        <text key={i} x={PAD.l - 8} y={i === 0 ? PAD.t + 4 : H - PAD.b + 3} textAnchor="end" fontSize="10" fontWeight="600" fill="#64748b">
          {v}
        </text>
      ))}
    </svg>
  );
}
