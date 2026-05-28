interface HeatmapCell {
  hour: string;
  value: number;
}

interface AnalyticsHeatmapProps {
  hourlyHeatmap: HeatmapCell[];
}

export default function AnalyticsHeatmap({
  hourlyHeatmap,
}: AnalyticsHeatmapProps) {
  const maxValue = Math.max(...hourlyHeatmap.map((item) => item.value), 1);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Hourly Production Intensity</p>

          <h2 className="text-xl font-semibold text-gray-900">Heatmap</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-6">
        {hourlyHeatmap.map((item) => {
          const opacity = item.value / maxValue;

          return (
            <div
              key={item.hour}
              className="
                rounded-2xl
                border
                border-gray-200
                p-4
                text-center
                transition-all
                duration-300
                hover:scale-105
              "
              style={{
                backgroundColor: `rgba(59,130,246,${0.1 + opacity * 0.7})`,
              }}
            >
              <p className="text-sm text-gray-600">{item.hour}</p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
