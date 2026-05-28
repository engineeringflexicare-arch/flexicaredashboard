interface LineCardProps {
  line: string;
  product: string;
  machine: string;
  target: number;
  current: number;
}

export default function LineCard({
  line,
  product,
  machine,
  target,
  current,
}: LineCardProps) {
  // ===========================================
  // PROGRESS %
  // ===========================================

  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  // ===========================================
  // PROGRESS COLOR
  // ===========================================

  const progressColor =
    percentage >= 100
      ? "bg-green-500"
      : percentage >= 70
        ? "bg-blue-500"
        : percentage >= 40
          ? "bg-yellow-500"
          : "bg-red-500";

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div
      className="
        bg-white
        rounded-3xl
        shadow-sm
        border
        border-gray-200
        p-6
        w-full
        min-h-80
        flex
        flex-col
        justify-between
        hover:shadow-lg
        transition-all
        duration-300
      "
    >
      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">{line}</h2>

          <p className="text-gray-500 text-sm mt-1">Factory Floor Analytics</p>
        </div>

        <span
          className="
            bg-blue-100
            text-blue-700
            text-xs
            px-4
            py-2
            rounded-full
            font-semibold
            whitespace-nowrap
          "
        >
          {machine}
        </span>
      </div>

      {/* ===================================== */}
      {/* PRODUCT */}
      {/* ===================================== */}

      <div className="mt-6">
        <p className="text-gray-500 text-sm">Product Code</p>

        <h3 className="font-bold text-2xl text-gray-800 mt-1">{product}</h3>
      </div>

      {/* ===================================== */}
      {/* STATS */}
      {/* ===================================== */}

      <div className="grid grid-cols-2 gap-4 mt-6">
        {/* TARGET */}

        <div
          className="
            bg-gray-100
            rounded-2xl
            p-4
          "
        >
          <p className="text-gray-500 text-sm">Target</p>

          <h3 className="text-3xl font-bold text-gray-800 mt-2">{target}</h3>
        </div>

        {/* CURRENT */}

        <div
          className="
            bg-gray-100
            rounded-2xl
            p-4
          "
        >
          <p className="text-gray-500 text-sm">Current</p>

          <h3 className="text-3xl font-bold text-gray-800 mt-2">{current}</h3>
        </div>
      </div>

      {/* ===================================== */}
      {/* PROGRESS */}
      {/* ===================================== */}

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">Progress</span>

          <span
            className={`
              text-sm
              font-bold

              ${
                percentage >= 100
                  ? "text-green-600"
                  : percentage >= 70
                    ? "text-blue-600"
                    : percentage >= 40
                      ? "text-yellow-600"
                      : "text-red-600"
              }
            `}
          >
            {percentage.toFixed(0)}%
          </span>
        </div>

        <div
          className="
            w-full
            bg-gray-200
            rounded-full
            h-4
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
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
