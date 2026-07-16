import type { ExchangeRateResponse } from "@/lib/currency";
import { fetchFrankfurter } from "@/lib/frankfurter";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from")?.toUpperCase();
  const to = searchParams.get("to")?.toUpperCase();

  if (!from || !to) {
    return Response.json(
      { error: "Provide from and to currency codes." },
      { status: 400 },
    );
  }

  if (from === to) {
    const response: ExchangeRateResponse = {
      amount: 1,
      base: from,
      date: new Date().toISOString().slice(0, 10),
      rates: { [to]: 1 },
    };
    return Response.json(response);
  }

  try {
    const path = `/latest?amount=1&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const apiResponse = await fetchFrankfurter(path, 300);

    if (!apiResponse.ok) {
      return Response.json(
        { error: "Could not fetch exchange rates. Check the currency codes." },
        { status: apiResponse.status },
      );
    }

    const data = (await apiResponse.json()) as ExchangeRateResponse;
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Exchange rate service is unavailable right now." },
      { status: 503 },
    );
  }
}
