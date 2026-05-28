import type {
  FloorName,
  Granularity,
  AnalyticsFilters,
} from "../../../types/analytics";

interface Option {
  value: string;
  label: string;
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  floors: FloorName[];
  lines: Option[];
  machines: Option[];
  products: Option[];
  onFilterChange: (patch: Partial<AnalyticsFilters>) => void;
}

export default function AnalyticsFilters({
  filters,
  floors,
  lines,
  machines,
  products,
  onFilterChange,
}: AnalyticsFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Floor</label>
          <select
            value={filters.floor}
            onChange={(e) =>
              onFilterChange({ floor: e.target.value as FloorName })
            }
            className="w-full rounded-2xl border border-gray-300 p-3 text-sm"
          >
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor === "Combined" ? "Combined" : floor.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Line</label>
          <select
            value={filters.line || ""}
            onChange={(e) =>
              onFilterChange({ line: e.target.value || undefined })
            }
            className="w-full rounded-2xl border border-gray-300 p-3 text-sm"
          >
            <option value="">All lines</option>
            {lines.map((line) => (
              <option key={line.value} value={line.value}>
                {line.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Machine</label>
          <select
            value={filters.machine || ""}
            onChange={(e) =>
              onFilterChange({ machine: e.target.value || undefined })
            }
            className="w-full rounded-2xl border border-gray-300 p-3 text-sm"
          >
            <option value="">All machines</option>
            {machines.map((machine) => (
              <option key={machine.value} value={machine.value}>
                {machine.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Product</label>
          <select
            value={filters.product || ""}
            onChange={(e) =>
              onFilterChange({ product: e.target.value || undefined })
            }
            className="w-full rounded-2xl border border-gray-300 p-3 text-sm"
          >
            <option value="">All products</option>
            {products.map((product) => (
              <option key={product.value} value={product.value}>
                {product.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="w-full rounded-2xl border border-gray-300 p-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="w-full rounded-2xl border border-gray-300 p-3 text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">View</label>
          <select
            value={filters.granularity}
            onChange={(e) =>
              onFilterChange({ granularity: e.target.value as Granularity })
            }
            className="w-full rounded-2xl border border-gray-300 p-3 text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  );
}
