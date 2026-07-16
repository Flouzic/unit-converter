"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatRate,
  getRateChange,
  historyToChartPoints,
  type ChartPoint,
  type ExchangeRateHistoryResponse,
} from "@/lib/currency";
import {
  chartPeriods,
  RATE_REFRESH_MS,
  type ChartPeriod,
} from "@/lib/frankfurter";

interface CurrencyChartProps {
  fromCode: string;
  toCode: string;
  latestRate: number | null;
  latestDate: string | null;
}

function ChartTooltip({
  active,
  payload,
  fromCode,
  toCode,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  fromCode: string;
  toCode: string;
}) {
  if (!active || !payload?.[0]) return null;

  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <p className="font-medium text-zinc-900 dark:text-zinc-50">{point.label}</p>
      <p className="mt-1 text-sky-700 dark:text-sky-300">
        1 {fromCode} = {formatRate(point.rate)} {toCode}
      </p>
    </div>
  );
}

export default function CurrencyChart({
  fromCode,
  toCode,
  latestRate,
  latestDate,
}: CurrencyChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>("3M");
  const [history, setHistory] = useState<ExchangeRateHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/currency/history?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}&period=${period}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load chart data.");
      }

      setHistory(data as ExchangeRateHistoryResponse);
      setLastUpdated(new Date());
    } catch (fetchError) {
      setHistory(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Could not load chart data.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [fromCode, period, toCode]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchHistory();
    }, RATE_REFRESH_MS);

    return () => clearInterval(interval);
  }, [fetchHistory]);

  const chartPoints = useMemo(() => {
    if (!history) return [];

    const points = historyToChartPoints(history, toCode);

    if (
      latestRate !== null &&
      latestDate &&
      (points.length === 0 || points[points.length - 1].date !== latestDate)
    ) {
      return [
        ...points,
        {
          date: latestDate,
          rate: latestRate,
          label: new Date(`${latestDate}T00:00:00`).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        },
      ];
    }

    if (latestRate !== null && points.length > 0) {
      const updated = [...points];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        rate: latestRate,
      };
      return updated;
    }

    return points;
  }, [history, latestDate, latestRate, toCode]);

  const rateChange = useMemo(() => getRateChange(chartPoints), [chartPoints]);

  const tickFormatter = useCallback(
    (value: string) => {
      const date = new Date(`${value}T00:00:00`);
      if (period === "1Y") {
        return date.toLocaleDateString(undefined, { month: "short" });
      }
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    },
    [period],
  );

  if (fromCode === toCode) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Exchange rate chart
          </h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            1 {fromCode} in {toCode} · line up = {toCode} strengthening · refreshes every 5 minutes
          </p>
        </div>

        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-950">
          {chartPeriods.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={[
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                period === item.id
                  ? "bg-sky-600 text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50",
              ].join(" ")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {rateChange ? (
        <p
          className={[
            "mt-4 text-sm font-medium",
            rateChange.percent <= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400",
          ].join(" ")}
        >
          {rateChange.percent <= 0 ? "▲" : "▼"} {toCode}{" "}
          {rateChange.percent <= 0 ? "strengthened" : "weakened"}{" "}
          {Math.abs(rateChange.percent).toFixed(2)}% over period
        </p>
      ) : null}

      <div className="mt-4 h-72 w-full">
        {isLoading && chartPoints.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            Loading chart…
          </div>
        ) : error && chartPoints.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis
                dataKey="date"
                tickFormatter={tickFormatter}
                minTickGap={24}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-zinc-500"
              />
              <YAxis
                domain={["auto", "auto"]}
                reversed
                tickFormatter={(value: number) => formatRate(value)}
                width={72}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-zinc-500"
              />
              <Tooltip
                content={<ChartTooltip fromCode={fromCode} toCode={toCode} />}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#0284c7"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#0284c7" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          Source: Frankfurter / ECB
          {history?.start_date && history?.end_date
            ? ` · ${history.start_date} to ${history.end_date}`
            : ""}
        </span>
        {lastUpdated ? (
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
        ) : null}
      </div>
    </div>
  );
}
