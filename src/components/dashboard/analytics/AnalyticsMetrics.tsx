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

const accentStyles: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-700",
  purple: "bg-violet-50 text-violet-700",
};

export default function AnalyticsMetrics({
  totalOutput,
  totalTarget,
  completionRate,
  remaining,
  avgCycleTime,
  onlineMachines,
  offlineMachines,
}: AnalyticsMetricsProps) {
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
      subtext: "Average last cycle",
      accent: "orange",
    },
    {
      label: "Machine Health",
      value: `${onlineMachines}/${onlineMachines + offlineMachines}`,
      subtext: `${offlineMachines} offline`,
      accent: "purple",
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-4 md:grid-cols-2">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-600">{card.label}</p>
            <div
              className={`rounded-2xl px-3 py-1 text-sm font-semibold ${accentStyles[card.accent]}`}
            >
              Live
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          <p className="mt-3 text-sm text-gray-500">{card.subtext}</p>
        </div>
      ))}
    </div>
  );
}
