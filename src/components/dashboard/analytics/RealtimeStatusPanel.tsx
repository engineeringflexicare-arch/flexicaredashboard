import {
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Cpu,
  Timer,
  Factory,
} from "lucide-react";

import type { RealtimeMachineStatus } from "../../../types/analytics";

// ===============================================
// TYPES
// ===============================================

interface RealtimeStatusPanelProps {
  statuses: RealtimeMachineStatus[];
}

// ===============================================
// COMPONENT
// ===============================================

export default function RealtimeStatusPanel({
  statuses,
}: RealtimeStatusPanelProps) {
  // ===========================================
  // COUNTS
  // ===========================================

  const online = statuses.filter((item) => item.status === "online").length;

  const offline = statuses.length - online;

  const warnings = statuses
    .filter((item) => item.status === "offline")
    .slice(0, 3);

  // ===========================================
  // TOTAL OUTPUT
  // ===========================================

  const totalOutput = statuses.reduce(
    (total, item) => total + item.currentCount,
    0,
  );

  // ===========================================
  // AVERAGE CYCLE
  // ===========================================

  const avgCycle =
    statuses.length > 0
      ? (
          statuses.reduce(
            (total, item) => total + (item.lastCycleTimeSec || 0),
            0,
          ) / statuses.length
        ).toFixed(1)
      : "0";

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div
      className="
        bg-white
        rounded-3xl
        border
        border-gray-200
        p-6
        shadow-sm
        space-y-6
      "
    >
      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}

      <div
        className="
          flex
          flex-col
          xl:flex-row
          xl:items-center
          xl:justify-between
          gap-5
        "
      >
        {/* LEFT */}

        <div className="flex items-center gap-4">
          <div
            className="
              bg-blue-100
              p-4
              rounded-2xl
            "
          >
            <Activity className="text-blue-600" size={30} />
          </div>

          <div>
            <p className="text-sm text-gray-500">Realtime Machine Status</p>

            <h2
              className="
                text-3xl
                font-bold
                text-gray-900
              "
            >
              Live Monitoring
            </h2>
          </div>
        </div>

        {/* RIGHT METRICS */}

        <div
          className="
            flex
            flex-wrap
            gap-4
          "
        >
          {/* ONLINE */}

          <div
            className="
              rounded-3xl
              bg-emerald-50
              border
              border-emerald-200
              px-5
              py-4
              min-w-40
            "
          >
            <div className="flex items-center gap-2">
              <Wifi size={18} className="text-emerald-600" />

              <p
                className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-emerald-700
                  font-semibold
                "
              >
                Online
              </p>
            </div>

            <p
              className="
                text-3xl
                font-bold
                text-emerald-800
                mt-2
              "
            >
              {online}
            </p>
          </div>

          {/* OFFLINE */}

          <div
            className="
              rounded-3xl
              bg-red-50
              border
              border-red-200
              px-5
              py-4
              min-w-40
            "
          >
            <div className="flex items-center gap-2">
              <WifiOff size={18} className="text-red-600" />

              <p
                className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-red-700
                  font-semibold
                "
              >
                Offline
              </p>
            </div>

            <p
              className="
                text-3xl
                font-bold
                text-red-800
                mt-2
              "
            >
              {offline}
            </p>
          </div>

          {/* OUTPUT */}

          <div
            className="
              rounded-3xl
              bg-blue-50
              border
              border-blue-200
              px-5
              py-4
              min-w-40
            "
          >
            <div className="flex items-center gap-2">
              <Factory size={18} className="text-blue-600" />

              <p
                className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-blue-700
                  font-semibold
                "
              >
                Output
              </p>
            </div>

            <p
              className="
                text-3xl
                font-bold
                text-blue-800
                mt-2
              "
            >
              {totalOutput}
            </p>
          </div>

          {/* CYCLE */}

          <div
            className="
              rounded-3xl
              bg-orange-50
              border
              border-orange-200
              px-5
              py-4
              min-w-40
            "
          >
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-orange-600" />

              <p
                className="
                  text-xs
                  uppercase
                  tracking-wide
                  text-orange-700
                  font-semibold
                "
              >
                Avg Cycle
              </p>
            </div>

            <p
              className="
                text-3xl
                font-bold
                text-orange-800
                mt-2
              "
            >
              {avgCycle}s
            </p>
          </div>
        </div>
      </div>

      {/* =================================== */}
      {/* MACHINE GRID */}
      {/* =================================== */}

      <div
        className="
          grid
          gap-5
          md:grid-cols-2
          xl:grid-cols-3
        "
      >
        {statuses.slice(0, 6).map((status) => {
          const isOnline = status.status === "online";

          return (
            <div
              key={`${status.lineKey}-${status.machineId}`}
              className={`
                    rounded-3xl
                    border
                    p-5
                    transition-all
                    duration-300
                    hover:shadow-xl
                    hover:-translate-y-1

                    ${
                      isOnline
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-red-200 bg-red-50/40"
                    }
                  `}
            >
              {/* TOP */}

              <div
                className="
                      flex
                      items-start
                      justify-between
                    "
              >
                <div>
                  <p
                    className="
                          text-sm
                          text-gray-500
                        "
                  >
                    {status.lineKey.replace("_", " ")}
                  </p>

                  <h3
                    className="
                          text-2xl
                          font-bold
                          text-gray-900
                          mt-1
                        "
                  >
                    {status.machineId}
                  </h3>
                </div>

                <span
                  className={`
                        rounded-full
                        px-4
                        py-1.5
                        text-xs
                        font-bold
                        uppercase
                        tracking-wide

                        ${
                          isOnline
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }
                      `}
                >
                  {status.status}
                </span>
              </div>

              {/* BODY */}

              <div
                className="
                      mt-5
                      space-y-3
                    "
              >
                {/* OUTPUT */}

                <div
                  className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        bg-white
                        border
                        border-gray-100
                        px-4
                        py-3
                      "
                >
                  <div className="flex items-center gap-2">
                    <Factory size={16} className="text-blue-600" />

                    <span className="text-sm text-gray-600">Output</span>
                  </div>

                  <span
                    className="
                          text-lg
                          font-bold
                          text-gray-900
                        "
                  >
                    {status.currentCount}
                  </span>
                </div>

                {/* CYCLE */}

                <div
                  className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        bg-white
                        border
                        border-gray-100
                        px-4
                        py-3
                      "
                >
                  <div className="flex items-center gap-2">
                    <Timer size={16} className="text-orange-600" />

                    <span className="text-sm text-gray-600">Cycle</span>
                  </div>

                  <span
                    className="
                          text-lg
                          font-bold
                          text-gray-900
                        "
                  >
                    {status.lastCycleTimeSec
                      ? `${status.lastCycleTimeSec}s`
                      : "—"}
                  </span>
                </div>

                {/* STATUS */}

                <div
                  className="
                        flex
                        items-center
                        justify-between
                        rounded-2xl
                        bg-white
                        border
                        border-gray-100
                        px-4
                        py-3
                      "
                >
                  <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-purple-600" />

                    <span className="text-sm text-gray-600">Health</span>
                  </div>

                  <span
                    className={`
                          text-sm
                          font-bold

                          ${isOnline ? "text-emerald-700" : "text-red-700"}
                        `}
                  >
                    {isOnline ? "Healthy" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================== */}
      {/* WARNINGS */}
      {/* =================================== */}

      {warnings.length > 0 && (
        <div
          className="
            rounded-3xl
            border
            border-red-200
            bg-red-50
            p-5
          "
        >
          <div className="flex items-start gap-4">
            <div
              className="
                bg-red-100
                p-3
                rounded-2xl
              "
            >
              <AlertTriangle className="text-red-600" size={24} />
            </div>

            <div>
              <h3
                className="
                  text-lg
                  font-bold
                  text-red-800
                "
              >
                Warning Alert
              </h3>

              <p
                className="
                  text-red-700
                  mt-1
                "
              >
                {warnings.length} machine(s) are currently offline or inactive.
              </p>

              <div className="mt-4 space-y-2">
                {warnings.map((warning) => (
                  <div
                    key={warning.machineId}
                    className="
                        bg-white
                        border
                        border-red-100
                        rounded-2xl
                        px-4
                        py-3
                        flex
                        items-center
                        justify-between
                      "
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {warning.machineId}
                      </p>

                      <p className="text-sm text-gray-500">
                        {warning.lineKey.replace("_", " ")}
                      </p>
                    </div>

                    <span
                      className="
                          text-red-600
                          font-bold
                          text-sm
                        "
                    >
                      OFFLINE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================== */}
      {/* EMPTY */}
      {/* =================================== */}

      {statuses.length === 0 && (
        <div
          className="
            rounded-3xl
            border
            border-dashed
            border-gray-300
            py-16
            text-center
          "
        >
          <Activity
            className="
              mx-auto
              text-gray-300
              mb-4
            "
            size={52}
          />

          <h3
            className="
              text-2xl
              font-bold
              text-gray-700
            "
          >
            No Machine Data
          </h3>

          <p className="text-gray-500 mt-2">
            Realtime monitoring data will appear here
          </p>
        </div>
      )}
    </div>
  );
}
