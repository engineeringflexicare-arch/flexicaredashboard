import type { RealtimeMachineStatus } from "../../../types/analytics";

interface RealtimeStatusPanelProps {
  statuses: RealtimeMachineStatus[];
}

export default function RealtimeStatusPanel({
  statuses,
}: RealtimeStatusPanelProps) {
  const online = statuses.filter((item) => item.status === "online").length;
  const offline = statuses.length - online;
  const warnings = statuses
    .filter((item) => item.status === "offline")
    .slice(0, 3);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Realtime Machine Status</p>
          <h2 className="text-2xl font-bold text-gray-900">Live Monitoring</h2>
        </div>
        <div className="flex gap-4">
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
            <p className="text-xs uppercase tracking-wide">Online</p>
            <p className="text-2xl font-bold">{online}</p>
          </div>
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">
            <p className="text-xs uppercase tracking-wide">Offline</p>
            <p className="text-2xl font-bold">{offline}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {statuses.slice(0, 6).map((status) => (
          <div
            key={`${status.lineKey}-${status.machineId}`}
            className="rounded-3xl border border-gray-200 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {status.lineKey.replace("_", " ")}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {status.machineId}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  status.status === "online"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {status.status}
              </span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Output</span>
                <span>{status.currentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cycle</span>
                <span>
                  {status.lastCycleTimeSec
                    ? `${status.lastCycleTimeSec}s`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {warnings.length > 0 && (
        <div className="mt-6 rounded-3xl bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Warning</p>
          <p>{warnings.length} machine(s) are currently offline or inactive.</p>
        </div>
      )}
    </div>
  );
}
