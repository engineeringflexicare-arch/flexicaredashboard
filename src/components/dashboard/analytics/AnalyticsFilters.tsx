import {
  CalendarDays,
  Factory,
  Layers3,
  Cpu,
  Package,
  Filter,
} from "lucide-react";

import type {
  FloorName,
  Granularity,
  AnalyticsFilters,
} from "../../../types/analytics";

// ===============================================
// TYPES
// ===============================================

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

// ===============================================
// COMPONENT
// ===============================================

export default function AnalyticsFilters({
  filters,
  floors,
  lines,
  machines,
  products,
  onFilterChange,
}: AnalyticsFiltersProps) {
  return (
    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-3xl
        shadow-sm
        p-6
        space-y-6
      "
    >
      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}

      <div className="flex items-center gap-3">
        <div
          className="
            bg-blue-100
            p-3
            rounded-2xl
          "
        >
          <Filter className="text-blue-600" size={22} />
        </div>

        <div>
          <h2
            className="
              text-2xl
              font-bold
              text-gray-800
            "
          >
            Analytics Filters
          </h2>

          <p className="text-sm text-gray-500">
            Filter production analytics and reporting data
          </p>
        </div>
      </div>

      {/* =================================== */}
      {/* TOP FILTERS */}
      {/* =================================== */}

      <div
        className="
          grid
          gap-5
          lg:grid-cols-3
        "
      >
        {/* FLOOR */}

        <div className="space-y-2">
          <label
            className="
              text-sm
              font-semibold
              text-gray-700
              flex
              items-center
              gap-2
            "
          >
            <Factory size={16} className="text-blue-600" />
            Floor
          </label>

          <select
            value={filters.floor}
            onChange={(e) =>
              onFilterChange({
                floor: e.target.value as FloorName,
              })
            }
            className="
              w-full
              rounded-2xl
              border
              border-gray-300
              bg-white
              p-3
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-blue-200
              focus:border-blue-500
            "
          >
            {floors.map((floor) => (
              <option key={floor} value={floor}>
                {floor === "Combined" ? "Combined" : floor.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* LINE */}

        <div className="space-y-2">
          <label
            className="
              text-sm
              font-semibold
              text-gray-700
              flex
              items-center
              gap-2
            "
          >
            <Layers3 size={16} className="text-green-600" />
            Line
          </label>

          <select
            value={filters.line || ""}
            onChange={(e) =>
              onFilterChange({
                line: e.target.value || undefined,
              })
            }
            className="
              w-full
              rounded-2xl
              border
              border-gray-300
              bg-white
              p-3
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-green-200
              focus:border-green-500
            "
          >
            <option value="">All Lines</option>

            {lines.map((line) => (
              <option key={line.value} value={line.value}>
                {line.label}
              </option>
            ))}
          </select>
        </div>

        {/* MACHINE */}

        <div className="space-y-2">
          <label
            className="
              text-sm
              font-semibold
              text-gray-700
              flex
              items-center
              gap-2
            "
          >
            <Cpu size={16} className="text-orange-600" />
            Machine
          </label>

          <select
            value={filters.machine || ""}
            onChange={(e) =>
              onFilterChange({
                machine: e.target.value || undefined,
              })
            }
            className="
              w-full
              rounded-2xl
              border
              border-gray-300
              bg-white
              p-3
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-orange-200
              focus:border-orange-500
            "
          >
            <option value="">All Machines</option>

            {machines.map((machine) => (
              <option key={machine.value} value={machine.value}>
                {machine.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =================================== */}
      {/* BOTTOM FILTERS */}
      {/* =================================== */}

      <div
        className="
          grid
          gap-5
          lg:grid-cols-4
        "
      >
        {/* PRODUCT */}

        <div className="space-y-2">
          <label
            className="
              text-sm
              font-semibold
              text-gray-700
              flex
              items-center
              gap-2
            "
          >
            <Package size={16} className="text-purple-600" />
            Product
          </label>

          <select
            value={filters.product || ""}
            onChange={(e) =>
              onFilterChange({
                product: e.target.value || undefined,
              })
            }
            className="
              w-full
              rounded-2xl
              border
              border-gray-300
              bg-white
              p-3
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-purple-200
              focus:border-purple-500
            "
          >
            <option value="">All Products</option>

            {products.map((product) => (
              <option key={product.value} value={product.value}>
                {product.label}
              </option>
            ))}
          </select>
        </div>

        {/* START DATE */}

        <div className="space-y-2">
          <label
            className="
              text-sm
              font-semibold
              text-gray-700
              flex
              items-center
              gap-2
            "
          >
            <CalendarDays size={16} className="text-red-600" />
            Start Date
          </label>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              onFilterChange({
                startDate: e.target.value,
              })
            }
            className="
              w-full
              rounded-2xl
              border
              border-gray-300
              bg-white
              p-3
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-red-200
              focus:border-red-500
            "
          />
        </div>

        {/* END DATE */}

        <div className="space-y-2">
          <label
            className="
              text-sm
              font-semibold
              text-gray-700
              flex
              items-center
              gap-2
            "
          >
            <CalendarDays size={16} className="text-pink-600" />
            End Date
          </label>

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              onFilterChange({
                endDate: e.target.value,
              })
            }
            className="
              w-full
              rounded-2xl
              border
              border-gray-300
              bg-white
              p-3
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-pink-200
              focus:border-pink-500
            "
          />
        </div>

        {/* VIEW */}

        <div className="space-y-2">
          <label
            className="
              text-sm
              font-semibold
              text-gray-700
              flex
              items-center
              gap-2
            "
          >
            <Filter size={16} className="text-indigo-600" />
            View Type
          </label>

          <select
            value={filters.granularity}
            onChange={(e) =>
              onFilterChange({
                granularity: e.target.value as Granularity,
              })
            }
            className="
              w-full
              rounded-2xl
              border
              border-gray-300
              bg-white
              p-3
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-200
              focus:border-indigo-500
            "
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
