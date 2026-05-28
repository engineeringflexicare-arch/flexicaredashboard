import {
  Activity,
  Cpu,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// ===============================================
// TYPES
// ===============================================

interface AnalyticsOverviewCardProps {
  line: string;

  product: string;

  machine: string;

  output: number;

  target: number;

  status: string;

  onClick: () => void;
}

// ===============================================
// COMPONENT
// ===============================================

export default function AnalyticsOverviewCard({
  line,
  product,
  machine,
  output,
  target,
  status,
  onClick,
}: AnalyticsOverviewCardProps) {
  // ===========================================
  // CALCULATIONS
  // ===========================================

  const efficiency =
    target > 0 ? Number(((output / target) * 100).toFixed(0)) : 0;

  const remaining = Math.max(target - output, 0);

  const isOnline = status === "online";

  // ===========================================
  // PROGRESS COLOR
  // ===========================================

  const progressColor =
    efficiency >= 100
      ? "bg-green-500"
      : efficiency >= 75
        ? "bg-blue-500"
        : efficiency >= 50
          ? "bg-yellow-500"
          : "bg-red-500";

  // ===========================================
  // STATUS COLOR
  // ===========================================

  const statusStyles = isOnline
    ? {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: <CheckCircle2 size={16} />,
      }
    : {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
        icon: <AlertTriangle size={16} />,
      };

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <button
      onClick={onClick}
      className="
        group
        relative
        overflow-hidden
        bg-white
        rounded-3xl
        border
        border-gray-200
        p-6
        shadow-sm
        hover:shadow-2xl
        hover:-translate-y-1
        transition-all
        duration-300
        text-left
        w-full
      "
    >
      {/* =================================== */}
      {/* TOP DECORATION */}
      {/* =================================== */}

      <div
        className={`
          absolute
          top-0
          left-0
          right-0
          h-2

          ${
            isOnline
              ? "bg-linear-to-r from-green-500 to-emerald-400"
              : "bg-linear-to-r from-red-500 to-orange-400"
          }
        `}
      />

      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          mb-6
        "
      >
        {/* LEFT */}

        <div>
          <div className="flex items-center gap-3">
            <div
              className="
                bg-blue-100
                p-3
                rounded-2xl
              "
            >
              <Activity className="text-blue-600" size={22} />
            </div>

            <div>
              <h2
                className="
                  text-2xl
                  font-bold
                  text-gray-900
                "
              >
                {line}
              </h2>

              <p className="text-sm text-gray-500 mt-1">{product}</p>
            </div>
          </div>
        </div>

        {/* STATUS */}

        <div
          className={`
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            border
            text-sm
            font-bold
            uppercase
            tracking-wide

            ${statusStyles.bg}
            ${statusStyles.text}
            ${statusStyles.border}
          `}
        >
          {statusStyles.icon}

          {status}
        </div>
      </div>

      {/* =================================== */}
      {/* INFO CARDS */}
      {/* =================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-4
          mb-6
        "
      >
        {/* MACHINE */}

        <div
          className="
            bg-gray-50
            rounded-2xl
            border
            border-gray-100
            p-4
          "
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu size={16} className="text-purple-600" />

            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Machine
            </p>
          </div>

          <p
            className="
              text-lg
              font-bold
              text-gray-900
            "
          >
            {machine}
          </p>
        </div>

        {/* TARGET */}

        <div
          className="
            bg-gray-50
            rounded-2xl
            border
            border-gray-100
            p-4
          "
        >
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-green-600" />

            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Target
            </p>
          </div>

          <p
            className="
              text-lg
              font-bold
              text-green-700
            "
          >
            {target}
          </p>
        </div>

        {/* OUTPUT */}

        <div
          className="
            bg-gray-50
            rounded-2xl
            border
            border-gray-100
            p-4
          "
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-blue-600" />

            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Output
            </p>
          </div>

          <p
            className="
              text-lg
              font-bold
              text-blue-700
            "
          >
            {output}
          </p>
        </div>

        {/* REMAINING */}

        <div
          className="
            bg-gray-50
            rounded-2xl
            border
            border-gray-100
            p-4
          "
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-orange-600" />

            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Remaining
            </p>
          </div>

          <p
            className="
              text-lg
              font-bold
              text-orange-700
            "
          >
            {remaining}
          </p>
        </div>
      </div>

      {/* =================================== */}
      {/* PROGRESS */}
      {/* =================================== */}

      <div className="mb-5">
        <div
          className="
            flex
            items-center
            justify-between
            mb-3
          "
        >
          <div>
            <p className="text-sm text-gray-500">Production Efficiency</p>

            <p
              className="
                text-3xl
                font-black
                text-gray-900
              "
            >
              {efficiency}%
            </p>
          </div>

          <div
            className={`
              px-4
              py-2
              rounded-2xl
              text-sm
              font-bold

              ${
                efficiency >= 100
                  ? "bg-green-100 text-green-700"
                  : efficiency >= 75
                    ? "bg-blue-100 text-blue-700"
                    : efficiency >= 50
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
              }
            `}
          >
            {efficiency >= 100
              ? "Excellent"
              : efficiency >= 75
                ? "Good"
                : efficiency >= 50
                  ? "Average"
                  : "Low"}
          </div>
        </div>

        {/* PROGRESS BAR */}

        <div
          className="
            w-full
            h-4
            bg-gray-200
            rounded-full
            overflow-hidden
          "
        >
          <div
            className={`
              h-4
              rounded-full
              transition-all
              duration-700
              ${progressColor}
            `}
            style={{
              width: `${Math.min(efficiency, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* =================================== */}
      {/* FOOTER */}
      {/* =================================== */}

      <div
        className="
          pt-5
          border-t
          border-gray-100
          flex
          items-center
          justify-between
        "
      >
        <div>
          <p className="text-xs text-gray-500">Last updated realtime</p>

          <p
            className="
              text-sm
              font-semibold
              text-gray-700
              mt-1
            "
          >
            Factory Analytics
          </p>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            text-blue-600
            font-semibold
            group-hover:translate-x-1
            transition-all
          "
        >
          <span className="text-sm">View Details</span>

          <ArrowRight size={18} />
        </div>
      </div>

      {/* =================================== */}
      {/* BACKGROUND DECORATION */}
      {/* =================================== */}

      <div
        className={`
          absolute
          -bottom-10
          -right-10
          w-40
          h-40
          rounded-full
          opacity-5

          ${isOnline ? "bg-green-500" : "bg-red-500"}
        `}
      />
    </button>
  );
}
