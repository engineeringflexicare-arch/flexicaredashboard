import { useEffect, useState, useRef } from "react";
import { ref, onValue, off, type DatabaseReference } from "firebase/database";
import { database } from "../services/firebase";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";

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

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };

    requestAnimationFrame(tick);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

// ─── Radial Arc Progress ──────────────────────────────────────────────────────

function ArcProgress({ value, max, label, accent }: { value: number; max: number; label: string; accent: string }) {
  const p = Math.min(pct(value, max), 100);
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (p / 100) * circ;

  const color = p >= 100 ? "#10b981" : p >= 60 ? "#f59e0b" : p >= 30 ? "#f97316" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#f1f5f9" /* Light theme unfilled track */ strokeWidth="10" />
        <circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ * 0.25}
          style={{ transition: "stroke-dasharray 1s ease-out" }}
        />
        <text x="56" y="52" textAnchor="middle" fontSize="16" fontWeight="800" fill={color} fontFamily="'DM Mono', monospace">
          {p}%
        </text>
        <text x="56" y="68" textAnchor="middle" fontSize="8" fill="#64748b" fontWeight="600" letterSpacing="1" fontFamily="'DM Sans', sans-serif">
          {accent}
        </text>
      </svg>
      <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">{label}</span>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  label,
  value,
  sub,
  icon,
  accent = "#0ea5e9", // Adjusted slightly for light mode contrast
  animate = false,
  rawValue,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  animate?: boolean;
  rawValue?: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 group shadow-sm hover:shadow-md transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-1 opacity-80" style={{ background: accent }} />
      <div className="flex items-start justify-between mb-4 mt-1">
        <div className="p-2 rounded-lg" style={{ background: accent + "15", color: accent }}>
          {icon}
        </div>
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{label}</span>
      </div>
      <div className="text-3xl font-black tracking-tight mb-1" style={{ color: accent, fontFamily: "'DM Mono', monospace" }}>
        {animate && rawValue != null ? <AnimatedNumber value={rawValue} /> : value}
      </div>
      {sub && <p className="text-xs font-medium text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-slate-500 font-bold tracking-wider mb-1 uppercase">{label}</p>
      <p className="text-lg font-black" style={{ color: payload[0].stroke || "#0ea5e9", fontFamily: "'DM Mono', monospace" }}>
        {payload[0].value?.toLocaleString()} <span className="text-xs text-slate-500 font-medium font-sans">units</span>
      </p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ProductionDashboard() {
  const [lineData, setLineData] = useState<LineData | null>(null);
  const [machineData, setMachineData] = useState<MachineData | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [lastSync, setLastSync] = useState<string>("");
  // Removed the unused 'tick' variable to fix the ESLint warning,
  // but kept the state setter if a re-render is still desired by the interval.
  const [, setTick] = useState(0);

  // Blink ticker for live indicator (forces a small re-render every second if needed for external logic)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Firebase listeners
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

  // Derived
  const liveCount = machineData?.LiveStatus?.Count ?? 0;
  const daily = lineData?.dailyTarget ?? 0;
  const total = lineData?.totalProductCount ?? 0;
  const hourly = lineData?.hourlyTarget ?? 0;
  const dailyPct = pct(liveCount, daily);

  const counterHistory = Object.values(machineData?.CounterHistory ?? {})
    .sort((a, b) => a.Time.localeCompare(b.Time))
    .map((e) => ({ time: e.Time, count: e.Count }));

  // Cumulative chart data
  const cumulativeData = counterHistory.map((e, i) => ({
    time: e.time,
    count: e.count,
    cumulative: counterHistory.slice(0, i + 1).reduce((s, x) => s + x.count, 0),
  }));

  // Hourly target reference line value
  const hourlyRef = hourly;

  return (
    <div
      className="min-h-screen text-slate-800 p-4 md:p-6 lg:p-8 selection:bg-sky-100"
      style={{
        background: "#f8fafc",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google Fonts & CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500;600;700&display=swap');
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .pulse-dot { animation: pulse-dot 1.5s ease-in-out infinite; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slide-up 0.5s ease-out forwards; }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 slide-up">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
                <path d="M6 8h4M14 8h4M6 12h2M16 12h2" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-slate-900" style={{ fontFamily: "'DM Mono', monospace" }}>
                LINE_01
              </h1>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-bold tracking-widest border border-slate-200 text-slate-500 bg-slate-100">{lineData?.machineId ?? "MACHINE_01"}</span>
            </div>
            <p className="text-sm font-medium text-slate-500 mt-0.5 tracking-wide">Production Line · Real-Time Operations Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Date badge */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-bold text-slate-500 tracking-widest">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {lineData?.assignedDate ?? "—"}
          </div>

          {/* Shift badge */}
          <div
            className="px-4 py-2 rounded-xl border text-xs font-black tracking-widest uppercase shadow-sm"
            style={{
              background: "#0ea5e910",
              borderColor: "#0ea5e930",
              color: "#0ea5e9",
            }}
          >
            ⬡ {lineData?.shift ?? "—"} SHIFT
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: status === "live" ? "#10b981" : status === "error" ? "#ef4444" : "#94a3b8",
                boxShadow: status === "live" ? "0 0 0 3px #10b98130" : undefined,
              }}
            />
            <span className="text-xs font-bold tracking-widest text-slate-700 uppercase">{status === "live" ? "LIVE" : status === "error" ? "ERROR" : "CONNECTING"}</span>
            {lastSync && <span className="hidden sm:inline text-[10px] text-slate-400 font-mono border-l border-slate-200 pl-2.5">{lastSync}</span>}
          </div>
        </div>
      </header>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 slide-up" style={{ animationDelay: "0.05s" }}>
        <KPICard
          label="Live Count"
          value={liveCount}
          rawValue={liveCount}
          animate
          sub="units produced"
          accent="#0ea5e9"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          }
        />
        <KPICard
          label="Daily Target"
          value={fmt(daily)}
          sub="units required"
          accent="#6366f1"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
        />
        <KPICard
          label="Hourly Target"
          value={fmt(hourly)}
          sub="units / hr"
          accent="#8b5cf6"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          }
        />
        <KPICard
          label="Total Order"
          value={fmt(total)}
          sub="product count"
          accent="#f59e0b"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              <path d="M16 3H8L6 7h12z" />
            </svg>
          }
        />
        <KPICard
          label="Team Size"
          value={fmt(lineData?.plannedMembers)}
          sub="planned members"
          accent="#10b981"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <KPICard
          label="Supervisor"
          value={lineData?.supervisor ?? "—"}
          sub={lineData?.floor?.replace("_", " ") ?? "Floor"}
          accent="#f43f5e"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
      </div>

      {/* ── Progress Arc Row ─────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 mb-6 slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-6 rounded-full bg-sky-500" />
          <h2 className="text-xs font-black tracking-widest text-slate-700 uppercase">Goal Completion Status</h2>
        </div>
        <div className="flex flex-wrap gap-8 justify-around items-center">
          <ArcProgress value={liveCount} max={daily} label="Daily Goal" accent="DAILY" />
          <ArcProgress value={liveCount} max={total} label="Total Order" accent="ORDER" />
          <ArcProgress value={liveCount} max={hourly} label="Hourly Rate" accent="HOURLY" />

          {/* Big live count display */}
          <div className="flex flex-col items-center bg-slate-50 px-8 py-5 rounded-2xl border border-slate-100">
            <div className="text-5xl font-black tracking-tighter text-slate-900" style={{ fontFamily: "'DM Mono', monospace" }}>
              <AnimatedNumber value={liveCount} />
            </div>
            <div className="text-xs text-slate-500 font-bold tracking-widest uppercase mt-2">Total Units Produced</div>
            <div className="mt-3 flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <span className="pulse-dot w-2 h-2 rounded-full" style={{ background: "#10b981" }} />
              <span className="text-[10px] text-emerald-600 font-bold tracking-wider">LIVE FEED</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 min-w-50">
            {[
              { label: "Remaining (Daily)", value: Math.max(daily - liveCount, 0), color: "#6366f1" },
              { label: "Completion Rate", value: `${dailyPct}%`, color: "#0ea5e9" },
              { label: "Product Code", value: lineData?.productCode ?? "—", color: "#f59e0b" },
              { label: "Start Time", value: lineData?.productionStartTime ?? "—", color: "#10b981" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <span className="text-[11px] font-bold text-slate-500 tracking-widest uppercase">{row.label}</span>
                <span className="text-sm font-black" style={{ color: row.color, fontFamily: "'DM Mono', monospace" }}>
                  {typeof row.value === "number" ? row.value.toLocaleString() : row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6 slide-up" style={{ animationDelay: "0.15s" }}>
        {/* Area chart - count per entry */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-sky-500" />
              <h2 className="text-xs font-black tracking-widest text-slate-700 uppercase">Output Per Interval</h2>
            </div>
            {hourlyRef > 0 && (
              <span className="text-[10px] font-bold text-amber-600 tracking-widest flex items-center gap-1.5 border border-amber-200 bg-amber-50 px-2.5 py-1 rounded-lg">
                <span className="w-4 h-0.5 bg-amber-500 inline-block rounded-full" /> Hourly Target
              </span>
            )}
          </div>
          {counterHistory.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-medium">Awaiting data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={counterHistory} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                {hourlyRef > 0 && <ReferenceLine y={hourlyRef} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />}
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  fill="url(#skyGrad)"
                  dot={{ fill: "#0ea5e9", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 6, fill: "#0284c7", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Line chart - cumulative */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-violet-500" />
              <h2 className="text-xs font-black tracking-widest text-slate-700 uppercase">Cumulative Output</h2>
            </div>
            {daily > 0 && (
              <span className="text-[10px] font-bold text-violet-600 tracking-widest flex items-center gap-1.5 border border-violet-200 bg-violet-50 px-2.5 py-1 rounded-lg">
                <span className="w-4 h-0.5 bg-violet-500 inline-block rounded-full" /> Daily Target
              </span>
            )}
          </div>
          {cumulativeData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm font-medium">Awaiting data...</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={cumulativeData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono', monospace" }} axisLine={false} tickLine={false} />
                {daily > 0 && <ReferenceLine y={daily} stroke="#6366f1" strokeDasharray="4 4" strokeWidth={2} />}
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#violetGrad)"
                  dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 6, fill: "#4f46e5", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Bottom: Config + History ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 slide-up" style={{ animationDelay: "0.2s" }}>
        {/* Line Config */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-6 rounded-full bg-emerald-500" />
            <h2 className="text-xs font-black tracking-widest text-slate-700 uppercase">Line Configuration</h2>
          </div>
          <div className="space-y-2">
            {(
              [
                ["Product Code", lineData?.productCode, "#f59e0b"],
                ["Floor", lineData?.floor?.replace("_", " "), "#0ea5e9"],
                ["Shift", lineData?.shift, "#6366f1"],
                ["Production Start", lineData?.productionStartTime, "#10b981"],
                ["Supervisor", lineData?.supervisor, "#f43f5e"],
                ["Machine ID", lineData?.machineId, "#8b5cf6"],
                ["Planned Members", lineData?.plannedMembers?.toString(), "#0ea5e9"],
              ] as [string, string | undefined, string][]
            ).map(([key, val, accent]) => (
              <div key={key} className="flex justify-between items-center px-5 py-3.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group">
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase group-hover:text-slate-700 transition-colors">{key}</span>
                <span className="text-sm font-black" style={{ color: accent, fontFamily: "'DM Mono', monospace" }}>
                  {val ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Counter History */}
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-amber-400" />
              <h2 className="text-xs font-black tracking-widest text-slate-700 uppercase">Counter History</h2>
            </div>
            {counterHistory.length > 0 && (
              <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 tracking-widest">{counterHistory.length} ENTRIES</span>
            )}
          </div>

          {counterHistory.length === 0 ? (
            <div className="grow flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-2xl py-12 bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-400">No history data yet</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-85 pr-2 custom-scrollbar space-y-2">
              {[...counterHistory].reverse().map((entry, i) => {
                const prev = counterHistory[counterHistory.length - 2 - i];
                const delta = prev ? entry.count - prev.count : 0;
                const isUp = delta >= 0;
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#0ea5e9", opacity: 0.4 + (1 - i / counterHistory.length) * 0.6 }} />
                      <span className="text-xs font-bold text-slate-500" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {entry.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {prev && (
                        <span className="text-[11px] font-bold" style={{ color: isUp ? "#10b981" : "#ef4444" }}>
                          {isUp ? "+" : ""}
                          {delta}
                        </span>
                      )}
                      <span
                        className="text-sm font-black text-slate-800 bg-white px-3 py-1 rounded-lg shadow-sm"
                        style={{
                          border: "1px solid #e2e8f0",
                          fontFamily: "'DM Mono', monospace",
                        }}
                      >
                        {entry.count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-8 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
        <span>Line_01 Production Monitor · {lineData?.assignedDate ?? "—"}</span>
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status === "live" ? "bg-emerald-500" : "bg-slate-400"}`} />
          {status === "live" ? "Data streaming live" : "Awaiting connection"}
        </span>
      </footer>
    </div>
  );
}
