import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

interface ChartPoint {
  label: string;
  value?: number;
  actual?: number;
  target?: number;
  cycleTime?: number;
}

interface AnalyticsChartsProps {
  productionTrend: ChartPoint[];
  cycleTimeTrend: ChartPoint[];
  lineComparison: ChartPoint[];
  floorContribution: ChartPoint[];
  cycleTimeDistribution: ChartPoint[];
  hourlyIntensity: { hour: string; value: number }[];
}

const chartColors = ["#2563eb", "#10b981", "#f59e0b", "#8b5cf6"];

export default function AnalyticsCharts({
  productionTrend,
  cycleTimeTrend,
  lineComparison,
  floorContribution,
  cycleTimeDistribution,
  hourlyIntensity,
}: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Production Trend
        </h2>
        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <LineChart data={productionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#2563eb"
                strokeWidth={3}
                name="Actual"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Cycle Time Trend
        </h2>
        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <LineChart data={cycleTimeTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cycleTime"
                stroke="#f59e0b"
                strokeWidth={3}
                name="Cycle Time"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Line Comparison
        </h2>
        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={lineComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="actual" fill="#2563eb" name="Output" />
              <Bar dataKey="target" fill="#10b981" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Floor Contribution
        </h2>
        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <PieChart>
              <Pie
                data={floorContribution}
                dataKey="value"
                nameKey="label"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                label
              >
                {floorContribution.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Cycle Time Distribution
        </h2>
        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                type="category"
                name="Bucket"
                tick={{ fontSize: 12 }}
              />
              <YAxis dataKey="value" name="Frequency" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={cycleTimeDistribution} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Hourly Production Intensity
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {hourlyIntensity.map((item) => (
            <div
              key={item.hour}
              className="rounded-2xl border border-gray-200 bg-slate-50 p-3 text-center"
            >
              <p className="text-sm text-gray-500">{item.hour}</p>
              <p className="mt-2 text-lg font-bold text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
