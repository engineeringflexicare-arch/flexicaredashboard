import type { CounterHistoryPoint, Granularity } from "../types/analytics";

interface PatternSummary {
  peakHour?: string;
  slowHour?: string;
  peakDay?: string;
  slowDay?: string;
}

export function filterHistoryByRange(
  history: CounterHistoryPoint[],
  startDate: number,
  endDate: number,
): CounterHistoryPoint[] {
  return history.filter(
    (item) => item.timestamp >= startDate && item.timestamp <= endDate,
  );
}

export function groupByPeriod(
  history: CounterHistoryPoint[],
  granularity: Granularity,
): Record<string, number> {
  return history.reduce((acc, item) => {
    const date = new Date(item.timestamp);
    let key = "";

    if (granularity === "daily") {
      key = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } else if (granularity === "weekly") {
      const week = getISOWeek(date);
      key = `W${week} ${date.getFullYear()}`;
    } else {
      key = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    }

    acc[key] = (acc[key] || 0) + item.count;
    return acc;
  }, {} as Record<string, number>);
}

export function calculateCycleTimeStats(
  history: CounterHistoryPoint[],
): {
  average: number;
  maximum: number;
  minimum: number;
  distribution: Record<string, number>;
  points: { x: number; y: number }[];
} {
  const cycleTimes = history.map((item) => item.interval).filter((value) => value > 0);
  const total = cycleTimes.reduce((sum, value) => sum + value, 0);
  const average = cycleTimes.length ? total / cycleTimes.length : 0;
  const maximum = cycleTimes.length ? Math.max(...cycleTimes) : 0;
  const minimum = cycleTimes.length ? Math.min(...cycleTimes) : 0;

  const distribution: Record<string, number> = {};
  cycleTimes.forEach((value) => {
    const bucket = `${Math.floor(value / 5) * 5}-${Math.floor(value / 5) * 5 + 4}s`;
    distribution[bucket] = (distribution[bucket] || 0) + 1;
  });

  const points = history.map((item) => ({ x: item.timestamp, y: item.interval }));

  return { average, maximum, minimum, distribution, points };
}

export function buildHeatmap(
  history: CounterHistoryPoint[],
): { hour: string; value: number }[] {
  const hourlyMap: Record<string, number> = {};

  history.forEach((item) => {
    const date = new Date(item.timestamp);
    const hourKey = `${date.getHours().toString().padStart(2, "0")}:00`;
    hourlyMap[hourKey] = (hourlyMap[hourKey] || 0) + item.count;
  });

  return Array.from({ length: 24 }, (_, index) => {
    const hour = `${index.toString().padStart(2, "0")}:00`;
    return {
      hour,
      value: hourlyMap[hour] || 0,
    };
  });
}

export function summarizePatterns(
  history: CounterHistoryPoint[],
): PatternSummary {
  const hourlyTotals: Record<string, number> = {};
  const dailyTotals: Record<string, number> = {};

  history.forEach((item) => {
    const date = new Date(item.timestamp);
    const hourKey = `${date.getHours().toString().padStart(2, "0")}:00`;
    const dayKey = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    hourlyTotals[hourKey] = (hourlyTotals[hourKey] || 0) + item.count;
    dailyTotals[dayKey] = (dailyTotals[dayKey] || 0) + item.count;
  });

  const peakHour = Object.entries(hourlyTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
  const slowHour = Object.entries(hourlyTotals).sort((a, b) => a[1] - b[1])[0]?.[0];
  const peakDay = Object.entries(dailyTotals).sort((a, b) => b[1] - a[1])[0]?.[0];
  const slowDay = Object.entries(dailyTotals).sort((a, b) => a[1] - b[1])[0]?.[0];

  return { peakHour, slowHour, peakDay, slowDay };
}

function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNum = (date.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }
  return 1 + Math.round((firstThursday - target.valueOf()) / 604800000);
}
