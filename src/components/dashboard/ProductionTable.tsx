import { useEffect, useState } from "react";

import { ref, onValue } from "firebase/database";

import { database } from "../../services/firebase";

import type {
  CounterHistoryItem,
  TableRow,
  LineData,
} from "../../types/production";

import HourCell from "./HourCell";

const hours = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
  "18:00-19:00",
  "19:00-20:00",
];

interface ProductionTableProps {
  floor?: string;
}

export default function ProductionTable({
  floor = "Manufacturing_Floor",
}: ProductionTableProps) {
  const [rows, setRows] = useState<TableRow[]>([]);

  useEffect(() => {
    let latestLines: Record<string, LineData> = {};
    let latestMachines: Record<string, unknown> = {};

    const updateRows = (
      lines: Record<string, LineData>,
      machines: Record<string, unknown>,
    ) => {
      if (!lines || Object.keys(lines).length === 0) {
        setRows([]);
        return;
      }

      const tableRows: TableRow[] = [];

      Object.entries(lines).forEach(([lineKey, line]) => {
        const machineId = line.machineId;
        const history =
          (machines[machineId] as Record<string, unknown>)?.CounterHistory ||
          {};

        const hourlyMap: Record<string, number> = {};

        hours.forEach((hour) => {
          hourlyMap[hour] = 0;
        });

        Object.values(history as Record<string, CounterHistoryItem>).forEach(
          (item) => {
            const time = item.Time;

            if (!time) return;

            const timePart = time.split(" ")[1];
            if (!timePart) return;

            const hour = parseInt(timePart.split(":")[0]);

            if (hour >= 8 && hour < 20) {
              const nextHour = hour + 1;
              const key = `${String(hour).padStart(2, "0")}:00-${String(
                nextHour,
              ).padStart(2, "0")}:00`;

              hourlyMap[key] = item.Count;
            }
          },
        );

        tableRows.push({
          assemblyLine: lineKey.replace("_", " "),
          productCode: line.productCode,
          plannedMembers: line.plannedMembers,
          hourlyTarget: line.hourlyTarget,
          hourlyData: hourlyMap,
        });
      });

      setRows(tableRows);
    };

    const linesRef = ref(database, `Factory/${floor}/Lines`);
    const machinesRef = ref(database, `Factory/${floor}/Machines`);

    const unsubscribeLines = onValue(linesRef, (linesSnapshot) => {
      latestLines = linesSnapshot.exists()
        ? (linesSnapshot.val() as Record<string, LineData>)
        : {};
      updateRows(latestLines, latestMachines);
    });

    const unsubscribeMachines = onValue(machinesRef, (machinesSnapshot) => {
      latestMachines = machinesSnapshot.exists() ? machinesSnapshot.val() : {};
      updateRows(latestLines, latestMachines);
    });

    return () => {
      unsubscribeLines();
      unsubscribeMachines();
    };
  }, [floor]);

  return (
    <div>
      {/* ========================= */}
      {/* MOBILE CARDS */}
      {/* ========================= */}

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {rows.map((row, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4"
          >
            {/* HEADER */}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {row.assemblyLine}
                </h2>

                <p className="text-sm text-gray-500">{row.productCode}</p>
              </div>

              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                Target {row.hourlyTarget}
              </div>
            </div>

            {/* MEMBERS */}

            <div className="mb-4">
              <p className="text-sm text-gray-500">Planned Members</p>

              <h3 className="text-lg font-bold">{row.plannedMembers}</h3>
            </div>

            {/* HOURS */}

            <div className="grid grid-cols-2 gap-3">
              {hours.map((hour) => {
                const value = row.hourlyData[hour] || 0;

                const reached = value >= row.hourlyTarget;

                return (
                  <div
                    key={hour}
                    className={`rounded-xl p-3 border ${
                      reached
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1">{hour}</p>

                    <h3
                      className={`text-lg font-bold ${
                        reached ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {value}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ========================= */}
      {/* DESKTOP TABLE */}
      {/* ========================= */}

      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="border-collapse border border-gray-300 w-full text-center text-sm">
          {/* HEADER */}

          <thead>
            <tr className="bg-[#dfe4d3]">
              <th className="border border-gray-300 p-2">
                Assembly
                <br />
                Line
              </th>

              <th className="border border-gray-300 p-2">
                Product
                <br />
                Code
              </th>

              <th className="border border-gray-300 p-2">
                Planned TM
                <br />
                Members
              </th>

              <th className="border border-gray-300 p-2">
                Hourly
                <br />
                Target
              </th>

              {hours.map((hour) => (
                <th
                  key={hour}
                  className="border border-gray-300 p-2 whitespace-nowrap"
                >
                  {hour}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-all duration-200"
              >
                {/* LINE */}

                <td className="border border-gray-300 p-2 font-semibold">
                  {row.assemblyLine}
                </td>

                {/* PRODUCT */}

                <td className="border border-gray-300 p-2">
                  {row.productCode}
                </td>

                {/* MEMBERS */}

                <td className="border border-gray-300 p-2">
                  {row.plannedMembers}
                </td>

                {/* TARGET */}

                <td className="border border-gray-300 p-2 font-semibold">
                  {row.hourlyTarget}
                </td>

                {/* HOURS */}

                {hours.map((hour) => (
                  <HourCell
                    key={hour}
                    value={row.hourlyData[hour] || 0}
                    target={row.hourlyTarget}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
