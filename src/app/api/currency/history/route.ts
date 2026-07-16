import type { ExchangeRateHistoryResponse } from "@/lib/currency";
import {
  fetchFrankfurter,
  getDateRangeForPeriod,
  type ChartPeriod,
} from "@/lib/frankfurter";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.toUpperCase();
  const to = searchParams.get("to")?.toUpperCase();
  const period = (searchParams.get("period") ?? "3M") as ChartPeriod;

  if (!from || !to) {
    return Response.json(
      { error: "Provide from and to currency codes." },
      { status: 400 },
    );
  }

  if (from === to) {
    const today = new Date().toISOString().slice(0, 10);
    const response: ExchangeRateHistoryResponse = {
      amount: 1,
      base: from,
      start_date: today,
      end_date: today,
      rates: { [today]: { [to]: 1 } },
    };
    return Response.json(response);
  }

  const { start, end } = getDateRangeForPeriod(period);

  try {
    const path = `/${start}..${end}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const apiResponse = await fetchFrankfurter(path, 1800);

    if (!apiResponse.ok) {
      return Response.json(
        { error: "Could not fetch rate history for these currencies." },
        { status: apiResponse.status },
      );
    }

    const data = (await apiResponse.json()) as ExchangeRateHistoryResponse;
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Exchange rate history is unavailable right now." },
      { status: 503 },
    );
  }
}
