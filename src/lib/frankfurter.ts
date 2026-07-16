export const FRANKFURTER_BASE = "https://api.frankfurter.app";

export const RATE_REFRESH_MS = 5 * 60 * 1000;

export type ChartPeriod = "1M" | "3M" | "6M" | "1Y";

export const chartPeriods: { id: ChartPeriod; label: string; days: number }[] = [
  { id: "1M", label: "1M", days: 30 },
  { id: "3M", label: "3M", days: 90 },
  { id: "6M", label: "6M", days: 180 },
  { id: "1Y", label: "1Y", days: 365 },
];

export function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getDateRangeForPeriod(period: ChartPeriod): {
  start: string;
  end: string;
} {
  const end = new Date();
  const start = new Date(end);
  const days = chartPeriods.find((item) => item.id === period)?.days ?? 90;
  start.setDate(end.getDate() - days);

  return {
    start: formatDateISO(start),
    end: formatDateISO(end),
  };
}

export async function fetchFrankfurter(
  path: string,
  revalidate = 3600,
): Promise<Response> {
  return fetch(`${FRANKFURTER_BASE}${path}`, {
    next: { revalidate },
    signal: AbortSignal.timeout(8000),
  });
}
