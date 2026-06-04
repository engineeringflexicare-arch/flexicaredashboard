import { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "../services/firebase"; // ← ඔයාගේ path එකට match කරන්න
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LineData {
  assignedDate?: string;
  dailyTarget: number;
  floor?: string;
  hourlyTarget?: number;
  machineId: string;
  plannedMembers?: number;
  productCode?: string;
  productionStartTime?: string;
  shift?: string;
  supervisor?: string;
  totalProductCount?: number;
}

interface MachineStatus {
  Count: number;
  LastUpdate: string;
}

interface LineWithStats {
  key: string;
  data: LineData;
  liveCount: number;
  achievement: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n?: number | null) => (n == null ? "—" : Number(n).toLocaleString());

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

const barFill = (p: number) => (p >= 100 ? "#1D9E75" : p >= 60 ? "#BA7517" : "#E24B4A");

// ─── Summary metric card ──────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-secondary rounded-lg p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-medium leading-none ${accent ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, target, color }: { current: number; target: number; color: string }) {
  const p = Math.min(pct(current, target), 100);
  return (
    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p}%`, background: color }} />
    </div>
  );
}

// ─── Per-line card ────────────────────────────────────────────────────────────

function LineCard({ line }: { line: LineWithStats }) {
  const { key, data, liveCount, achievement } = line;
  const fill = barFill(achievement);
  const totalPct = pct(liveCount, data.totalProductCount ?? 1);

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-medium">{key.replace("_", " ")}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data.productCode ?? "—"} &middot; {data.floor?.replace("_", " ") ?? "—"}
          </p>
        </div>
        {data.shift && <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">{data.shift}</span>}
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Live count", value: fmt(liveCount), color: fill },
          { label: "Daily target", value: fmt(data.dailyTarget) },
          { label: "Achievement", value: `${achievement}%`, color: fill },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-secondary rounded-md p-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
            <p className="text-sm font-medium" style={color ? { color } : undefined}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="space-y-2 mb-3">
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>Daily target</span>
            <span>
              {fmt(liveCount)} / {fmt(data.dailyTarget)}
            </span>
          </div>
          <ProgressBar current={liveCount} target={data.dailyTarget} color={fill} />
        </div>
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>Total goal</span>
            <span>{totalPct}%</span>
          </div>
          <ProgressBar current={liveCount} target={data.totalProductCount ?? 0} color="#BA7517" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between text-[11px] text-muted-foreground pt-2 border-t border-border">
        <span>{data.plannedMembers ?? "—"} members</span>
        <span>{data.productionStartTime ?? "—"}</span>
        <span>{data.machineId}</span>
      </div>
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-medium">
          {p.name}: {fmt(p.value)}
          {p.name === "Achievement" ? "%" : ""}
        </p>
      ))}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function MultiLineDashboard() {
  const [lines, setLines] = useState<LineWithStats[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "error">("loading");
  const [lastSync, setLastSync] = useState("");

  useEffect(() => {
    // 1. Watch the entire Lines node
    const linesRef = ref(database, "Lines");

    const unsub = onValue(
      linesRef,
      async (snap) => {
        if (!snap.exists()) {
          setStatus("error");
          return;
        }

        const linesData: Record<string, LineData> = snap.val();
        const lineKeys = Object.keys(linesData);

        // 2. Collect unique machine IDs
        const machineIds = [...new Set(lineKeys.map((k) => linesData[k]?.machineId).filter(Boolean))];

        // 3. Subscribe to each machine's LiveStatus once
        const machineCounts: Record<string, number> = {};

        await Promise.all(
          machineIds.map(
            (id) =>
              new Promise<void>((resolve) => {
                const mRef = ref(database, `${id}/LiveStatus`);
                onValue(
                  mRef,
                  (mSnap) => {
                    const status: MachineStatus | null = mSnap.val();
                    machineCounts[id] = status?.Count ?? 0;
                    resolve();
                  },
                  { onlyOnce: true },
                );
              }),
          ),
        );

        // 4. Build combined data
        const result: LineWithStats[] = lineKeys.map((key) => {
          const data = linesData[key];
          const liveCount = machineCounts[data?.machineId] ?? 0;
          return {
            key,
            data,
            liveCount,
            achievement: pct(liveCount, data?.dailyTarget ?? 0),
          };
        });

        setLines(result);
        setStatus("live");
        setLastSync(new Date().toLocaleTimeString());
      },
      () => setStatus("error"),
    );

    return () => {
      off(linesRef);
      unsub();
    };
  }, []);

  // Derived totals ─────────────────────────────────────────────────────────
  const totalCount = lines.reduce((s, l) => s + l.liveCount, 0);
  const totalTarget = lines.reduce((s, l) => s + (l.data.dailyTarget ?? 0), 0);
  const overallPct = pct(totalCount, totalTarget);

  // Chart data
  const barData = lines.map((l) => ({
    name: l.key.replace("_", " "),
    actual: l.liveCount,
    target: l.data.dailyTarget ?? 0,
  }));

  const pctData = lines.map((l) => ({
    name: l.key.replace("_", " "),
    achievement: l.achievement,
    fill: barFill(l.achievement),
  }));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground p-5 font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${status === "live" ? "bg-green-600 animate-pulse" : status === "error" ? "bg-red-500" : "bg-muted-foreground animate-pulse"}`} />
          <h1 className="text-base font-medium">Production overview</h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full border border-border text-muted-foreground">
            {status === "loading" ? "Connecting..." : status === "error" ? "Error" : `${lines.length} lines`}
          </span>
        </div>
        {lastSync && <span className="text-xs text-muted-foreground">synced {lastSync}</span>}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        <SummaryCard label="Total lines" value={String(lines.length)} sub="active" />
        <SummaryCard label="Total count" value={fmt(totalCount)} sub="all machines" />
        <SummaryCard label="Combined target" value={fmt(totalTarget)} sub="units / day" />
        <SummaryCard label="Overall progress" value={`${overallPct}%`} sub="of combined target" accent={overallPct >= 60} />
      </div>

      {/* Line cards — auto-generated from Firebase */}
      {status === "loading" && <div className="text-center py-10 text-muted-foreground text-sm">Loading lines...</div>}
      {status === "error" && <div className="text-center py-10 text-red-500 text-sm">Could not load lines. Check Firebase config.</div>}
      {lines.length > 0 && (
        <>
          <p className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground mb-3">Lines — all active</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
            {lines.map((line) => (
              <LineCard key={line.key} line={line} />
            ))}
          </div>

          {/* Bar chart: actual vs target per line */}
          <div className="rounded-xl border border-border bg-background p-4 mb-4">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <p className="text-sm font-medium">Per-line count vs daily target</p>
              <div className="flex gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#1D9E75]" />
                  Actual
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#B4B2A9]" />
                  Target
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmt} width={55} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="actual" name="Actual" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="rgba(180,178,169,0.5)" radius={[4, 4, 0, 0]} stroke="#888780" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Horizontal bar: achievement % per line */}
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-sm font-medium mb-4">Achievement % per line</p>
            <ResponsiveContainer width="100%" height={Math.max(lines.length * 50 + 60, 180)}>
              <BarChart layout="vertical" data={pctData} margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 120]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<ChartTooltip />} formatter={(v) => [`${v}%`, "Achievement"]} />
                <ReferenceLine x={100} stroke="#1D9E75" strokeDasharray="4 3" strokeWidth={1} />
                <Bar dataKey="achievement" name="Achievement" radius={[0, 4, 4, 0]}>
                  {pctData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
