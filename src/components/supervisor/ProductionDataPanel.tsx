import { useEffect, useMemo, useState } from "react";

import { ref, onValue } from "firebase/database";

import * as XLSX from "xlsx";

import { Download, Search, Database } from "lucide-react";

import { database } from "../../services/firebase";

// ===============================================
// TYPES
// ===============================================

interface ProductionRecord {
  lineId?: string;

  machineId?: string;

  productCode?: string;

  floor?: string;

  currentCount?: number;

  dailyTarget?: number;

  plannedMembers?: number;

  timestamp?: string;
}

// ===============================================
// COMPONENT
// ===============================================

export default function ProductionDataPanel() {
  // ===========================================
  // STATES
  // ===========================================

  const [records, setRecords] = useState<ProductionRecord[]>([]);

  const [search, setSearch] = useState("");

  const [selectedFloor, setSelectedFloor] = useState("ALL");

  const [selectedLine, setSelectedLine] = useState("ALL");

  // ===========================================
  // LOAD FIREBASE DATA
  // ===========================================

  useEffect(() => {
    const linesRef = ref(database, "Lines");

    const unsubscribe = onValue(linesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRecords([]);

        return;
      }

      const data = snapshot.val() as Record<string, ProductionRecord>;

      const formatted = Object.entries(data).map(([lineKey, value]) => ({
        lineId: lineKey,

        machineId: value.machineId || "",

        productCode: value.productCode || "",

        floor: value.floor || "",

        currentCount: value.currentCount || 0,

        dailyTarget: value.dailyTarget || 0,

        plannedMembers: value.plannedMembers || 0,

        timestamp: new Date().toLocaleString(),
      }));

      setRecords(formatted);
    });

    return () => unsubscribe();
  }, []);

  // ===========================================
  // FILTERED DATA
  // ===========================================

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        search === "" ||
        record.productCode?.toLowerCase().includes(search.toLowerCase()) ||
        record.machineId?.toLowerCase().includes(search.toLowerCase()) ||
        record.lineId?.toLowerCase().includes(search.toLowerCase());

      const matchesFloor =
        selectedFloor === "ALL" || record.floor === selectedFloor;

      const matchesLine =
        selectedLine === "ALL" || record.lineId === selectedLine;

      return matchesSearch && matchesFloor && matchesLine;
    });
  }, [records, search, selectedFloor, selectedLine]);

  // ===========================================
  // EXPORT EXCEL
  // ===========================================

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Production Data");

    XLSX.writeFile(workbook, "production-data.xlsx");
  };

  // ===========================================
  // UNIQUE LINES
  // ===========================================

  const uniqueLines = Array.from(new Set(records.map((r) => r.lineId)));

  // ===========================================
  // RENDER
  // ===========================================

  return (
    <div
      className="
        bg-white
        rounded-3xl
        border
        border-gray-200
        p-6
        mt-8
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
          mb-6
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              bg-blue-100
              p-3
              rounded-2xl
            "
          >
            <Database
              className="
                text-blue-600
              "
              size={24}
            />
          </div>

          <div>
            <h2
              className="
                text-2xl
                font-bold
                text-gray-800
              "
            >
              Production Data Panel
            </h2>

            <p
              className="
                text-gray-500
                text-sm
                mt-1
              "
            >
              Filter and export realtime production data
            </p>
          </div>
        </div>

        {/* EXPORT BUTTON */}

        <button
          onClick={exportExcel}
          className="
            flex
            items-center
            justify-center
            gap-2
            bg-green-600
            hover:bg-green-700
            text-white
            px-5
            py-3
            rounded-2xl
            font-semibold
          "
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      {/* FILTERS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
          mb-6
        "
      >
        {/* SEARCH */}

        <div className="relative">
          <Search
            className="
              absolute
              left-4
              top-3.5
              text-gray-400
            "
            size={18}
          />

          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              border
              border-gray-300
              rounded-2xl
              pl-11
              pr-4
              py-3
            "
          />
        </div>

        {/* FLOOR */}

        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value)}
          className="
            border
            border-gray-300
            rounded-2xl
            px-4
            py-3
          "
        >
          <option value="ALL">All Floors</option>

          <option value="Manufacturing_Floor">Manufacturing Floor</option>

          <option value="Assembly_Floor">Assembly Floor</option>
        </select>

        {/* LINE */}

        <select
          value={selectedLine}
          onChange={(e) => setSelectedLine(e.target.value)}
          className="
            border
            border-gray-300
            rounded-2xl
            px-4
            py-3
          "
        >
          <option value="ALL">All Lines</option>

          {uniqueLines.map((line) => (
            <option key={line} value={line}>
              {line}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">
        <table
          className="
            w-full
            border-collapse
          "
        >
          <thead>
            <tr
              className="
                bg-gray-100
                text-left
              "
            >
              <th className="p-4">Line</th>

              <th className="p-4">Machine</th>

              <th className="p-4">Product</th>

              <th className="p-4">Floor</th>

              <th className="p-4">Count</th>

              <th className="p-4">Target</th>

              <th className="p-4">Team</th>

              <th className="p-4">Updated</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.map((record, index) => (
              <tr
                key={index}
                className="
                    border-b
                    border-gray-200
                    hover:bg-gray-50
                  "
              >
                <td className="p-4 font-medium">{record.lineId}</td>

                <td className="p-4">{record.machineId}</td>

                <td className="p-4">{record.productCode}</td>

                <td className="p-4">{record.floor}</td>

                <td className="p-4 font-bold text-blue-600">
                  {record.currentCount}
                </td>

                <td className="p-4">{record.dailyTarget}</td>

                <td className="p-4">{record.plannedMembers}</td>

                <td className="p-4 text-sm text-gray-500">
                  {record.timestamp}
                </td>
              </tr>
            ))}

            {filteredRecords.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="
                    text-center
                    py-10
                    text-gray-500
                  "
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
