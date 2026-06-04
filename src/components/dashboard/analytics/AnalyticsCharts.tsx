import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const productionTrend = [
  { label: "08:00", actual: 120 },
  { label: "09:00", actual: 180 },
  { label: "10:00", actual: 250 },
  { label: "11:00", actual: 300 },
  { label: "12:00", actual: 280 },
  { label: "13:00", actual: 360 },
];

export default function ProductionLineChart() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Production Trend</h2>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={productionTrend}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="label" />

            <YAxis />

            <Tooltip />

            <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
