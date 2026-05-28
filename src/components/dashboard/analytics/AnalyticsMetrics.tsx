import {
  TrendingUp,
  Target,
  TimerReset,
  Cpu,
  Wifi,
  WifiOff,
} from "lucide-react";

// ===============================================
// TYPES
// ===============================================

interface SummaryCard {
  label: string;

  value: string | number;

  subtext: string;

  accent: "blue" | "green" | "orange" | "purple";
}

interface AnalyticsMetricsProps {
  totalOutput: number;

  totalTarget: number;

  completionRate: number;

  remaining: number;

  avgCycleTime: number;

  onlineMachines: number;

  offlineMachines: number;
}

// ===============================================
// ACCENT STYLES
// ===============================================

const accentStyles: Record<
  string,
  {
    bg: string;
    badge: string;
    icon: React.ReactNode;
  }
> = {
  blue: {
    bg: "from-blue-500 to-cyan-500",
    badge: "bg-blue-100 text-blue-700",
    icon: <TrendingUp size={24} />,
  },

  green: {
    bg: "from-emerald-500 to-green-500",
    badge: "bg-emerald-100 text-emerald-700",
    icon: <Target size={24} />,
  },

  orange: {
    bg: "from-orange-500 to-amber-500",
    badge: "bg-orange-100 text-orange-700",
    icon: <TimerReset size={24} />,
  },

  purple: {
    bg: "from-violet-500 to-purple-500",
    badge: "bg-violet-100 text-violet-700",
    icon: <Cpu size={24} />,
  },
};

// ===============================================
// COMPONENT
// ===============================================

export default function AnalyticsMetrics({
  totalOutput,
  totalTarget,
  completionRate,
  remaining,
  avgCycleTime,
  onlineMachines,
  offlineMachines,
}: AnalyticsMetricsProps) {
  // ===========================================
  // TOTAL MACHINES
  // ===========================================

  const totalMachines = onlineMachines + offlineMachines;

  // ===========================================
  // CARD DATA
  // ===========================================

  const cards: SummaryCard[] = [
    {
      label: "Completion Rate",

      value: `${completionRate}%`,

      subtext: `Target ${totalTarget}`,

      accent: "green",
    },

    {
      label: "Current Output",

      value: totalOutput,

      subtext: `Remaining ${remaining}`,

      accent: "blue",
    },

    {
      label: "Average Cycle",

      value: `${avgCycleTime.toFixed(1)}s`,

      subtext: "Average machine cycle time",

      accent: "orange",
    },

    {
      label: "Machine Health",

      value: `${onlineMachines}/${totalMachines}`,

      subtext: `${offlineMachines} offline machines`,

      accent: "purple",
    },
  ];

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div
      className="
        grid
        gap-6
        md:grid-cols-2
        xl:grid-cols-4
      "
    >
      {cards.map((card) => {
        const style = accentStyles[card.accent];

        return (
          <div
            key={card.label}
            className="
                relative
                overflow-hidden
                rounded-3xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
              "
          >
            {/* TOP GRADIENT */}

            <div
              className={`
                  absolute
                  top-0
                  left-0
                  right-0
                  h-2
                  bg-linear-to-r
                  ${style.bg}
                `}
            />

            {/* HEADER */}

            <div
              className="
                  flex
                  items-center
                  justify-between
                  mb-5
                "
            >
              <div>
                <p
                  className="
                      text-sm
                      font-semibold
                      text-gray-500
                    "
                >
                  {card.label}
                </p>
              </div>

              <div
                className={`
                    rounded-2xl
                    px-3
                    py-2
                    font-semibold
                    ${style.badge}
                  `}
              >
                {style.icon}
              </div>
            </div>

            {/* VALUE */}

            <div>
              <h2
                className="
                    text-4xl
                    font-black
                    tracking-tight
                    text-gray-900
                  "
              >
                {card.value}
              </h2>

              <p
                className="
                    mt-3
                    text-sm
                    text-gray-500
                  "
              >
                {card.subtext}
              </p>
            </div>

            {/* FOOTER STATUS */}

            <div
              className="
                  mt-6
                  flex
                  items-center
                  justify-between
                  border-t
                  border-gray-100
                  pt-4
                "
            >
              <div
                className="
                    flex
                    items-center
                    gap-2
                  "
              >
                {card.accent === "purple" ? (
                  offlineMachines > 0 ? (
                    <WifiOff size={16} className="text-red-500" />
                  ) : (
                    <Wifi size={16} className="text-green-500" />
                  )
                ) : (
                  <TrendingUp size={16} className="text-green-500" />
                )}

                <span
                  className="
                      text-xs
                      font-medium
                      text-gray-500
                    "
                >
                  {card.accent === "purple"
                    ? offlineMachines > 0
                      ? "Attention Needed"
                      : "All Machines Online"
                    : "Live Production"}
                </span>
              </div>

              <div
                className={`
                    text-xs
                    font-bold
                    px-2
                    py-1
                    rounded-full
                    ${style.badge}
                  `}
              >
                LIVE
              </div>
            </div>

            {/* DECORATION */}

            <div
              className={`
                  absolute
                  -bottom-8
                  -right-8
                  w-32
                  h-32
                  rounded-full
                  opacity-5
                  bg-linear-to-r
                  ${style.bg}
                `}
            />
          </div>
        );
      })}
    </div>
  );
}
