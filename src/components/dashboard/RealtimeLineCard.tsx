import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface ChartData {
  time: string;
  output: number;
  interval: number;
}

interface RealtimeLineCardProps {
  line: string;
  product: string;
  machine: string;
  target: number;
  current: number;
  status: string;
  chartData: ChartData[];
}

export default function RealtimeLineCard({
  line,
  product,
  machine,
  target,
  current,
  status,
  chartData,
}: RealtimeLineCardProps) {
  // =========================
  // AVERAGE INTERVAL
  // =========================

  const averageInterval =
    chartData.length > 0
      ? (
          chartData.reduce((sum, item) => sum + item.interval, 0) /
          chartData.length
        ).toFixed(1)
      : "0";

  // =========================
  // EFFICIENCY
  // =========================

  const efficiency = target > 0 ? ((current / target) * 100).toFixed(0) : "0";

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="bg-[#111827] text-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{line}</h2>

            <p className="text-gray-300 text-sm">{product}</p>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              status === "online" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {status}
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* CONTENT */}
      {/* ========================= */}

      <div className="p-5">
        {/* TOP STATS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* MACHINE */}

          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Machine</p>

            <h3 className="text-lg font-bold text-gray-800">{machine}</h3>
          </div>

          {/* OUTPUT */}

          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Output</p>

            <h3 className="text-2xl font-bold text-blue-600">{current}</h3>
          </div>

          {/* TARGET */}

          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Target</p>

            <h3 className="text-2xl font-bold text-green-600">{target}</h3>
          </div>

          {/* AVG INTERVAL */}

          <div className="bg-gray-100 rounded-2xl p-4">
            <p className="text-gray-500 text-sm">Avg Cycle Time</p>

            <h3 className="text-2xl font-bold text-orange-600">
              {averageInterval}s
            </h3>
          </div>
        </div>

        {/* ========================= */}
        {/* PROGRESS */}
        {/* ========================= */}

        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Efficiency</span>

            <span className="font-semibold">{efficiency}%</span>
          </div>

          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-4 bg-green-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(Number(efficiency), 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* ========================= */}
        {/* CHART */}
        {/* ========================= */}

        <div className="h-72">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="time" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="output"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
