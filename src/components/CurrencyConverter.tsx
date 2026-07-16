"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import CurrencyChart from "@/components/CurrencyChart";
import {
  convertCurrency,
  currencies,
  findCurrency,
  formatCurrencyAmount,
  formatRate,
  type ExchangeRateResponse,
} from "@/lib/currency";
import { RATE_REFRESH_MS } from "@/lib/frankfurter";

function CurrencySelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} — {currency.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function CurrencyConverter() {
  const [fromCode, setFromCode] = useState("USD");
  const [toCode, setToCode] = useState("EUR");
  const [inputValue, setInputValue] = useState("1");
  const [rateData, setRateData] = useState<ExchangeRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async (from: string, to: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/currency/rates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Could not load exchange rate.");
      }

      setRateData(data as ExchangeRateResponse);
    } catch (fetchError) {
      setRateData(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Could not load exchange rate.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRate(fromCode, toCode);
  }, [fromCode, toCode, fetchRate]);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchRate(fromCode, toCode);
    }, RATE_REFRESH_MS);

    return () => clearInterval(interval);
  }, [fetchRate, fromCode, toCode]);

  const numericInput = Number.parseFloat(inputValue);
  const isValidInput = inputValue.trim() !== "" && Number.isFinite(numericInput);
  const exchangeRate = rateData?.rates[toCode] ?? null;

  const result = useMemo(() => {
    if (!isValidInput || exchangeRate === null) return null;
    return convertCurrency(numericInput, exchangeRate);
  }, [exchangeRate, isValidInput, numericInput]);

  const fromCurrency = findCurrency(fromCode);
  const toCurrency = findCurrency(toCode);

  function swapCurrencies() {
    setFromCode(toCode);
    setToCode(fromCode);
    if (isValidInput && result !== null) {
      setInputValue(formatRate(result));
    }
  }

  return (
    <section className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 px-6 py-8 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Currency
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Convert money between world currencies using live exchange rates. Rates
          update daily from the European Central Bank via Frankfurter, with the
          chart and spot rate refreshing every 5 minutes.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-6 py-8">
        {rateData ? (
          <p className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-100">
            1 {fromCode} = {formatRate(exchangeRate ?? 0)} {toCode}
            {rateData.date ? (
              <span className="text-sky-700/80 dark:text-sky-200/70">
                {" "}
                · Rates as of {rateData.date}
              </span>
            ) : null}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
          <div className="space-y-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                From
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-medium text-zinc-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Enter an amount"
              />
            </label>
            <CurrencySelect label="Currency" value={fromCode} onChange={setFromCode} />
          </div>

          <div className="flex justify-center lg:pb-3">
            <button
              type="button"
              onClick={swapCurrencies}
              disabled={isLoading}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-700 transition hover:border-sky-500 hover:text-sky-600 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-sky-500 dark:hover:text-sky-400"
              aria-label="Swap currencies"
            >
              ⇄
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                To
              </span>
              <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-lg font-semibold text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-100">
                {isLoading
                  ? "Loading…"
                  : result !== null
                    ? formatCurrencyAmount(result, toCode)
                    : "—"}
              </div>
            </div>
            <CurrencySelect label="Currency" value={toCode} onChange={setToCode} />
          </div>
        </div>

        {isValidInput && fromCurrency && toCurrency && result !== null && exchangeRate !== null ? (
          <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatCurrencyAmount(numericInput, fromCode)}
            </span>{" "}
            equals{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatCurrencyAmount(result, toCode)}
            </span>{" "}
            at 1 {fromCode} = {formatRate(exchangeRate)} {toCode}.
          </p>
        ) : null}

        <CurrencyChart
          fromCode={fromCode}
          toCode={toCode}
          latestRate={exchangeRate}
          latestDate={rateData?.date ?? null}
        />
      </div>
    </section>
  );
}
