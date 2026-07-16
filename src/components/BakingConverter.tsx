"use client";

import { useMemo, useState } from "react";
import {
  bakingIngredients,
  bakingUnits,
  convertBakingValue,
  findIngredient,
  formatBakingResult,
  getIngredientGroups,
  type BakingIngredient,
  type BakingUnitId,
  type CustomIngredient,
} from "@/lib/baking";

function UnitSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: BakingUnitId;
  onChange: (value: BakingUnitId) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as BakingUnitId)}
        className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        <optgroup label="Volume">
          {bakingUnits
            .filter((unit) => unit.kind === "volume")
            .map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
        </optgroup>
        <optgroup label="Weight">
          {bakingUnits
            .filter((unit) => unit.kind === "weight")
            .map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
        </optgroup>
      </select>
    </label>
  );
}

function IngredientPicker({
  selectedId,
  customIngredient,
  onSelectPreset,
  onCustomFound,
}: {
  selectedId: string;
  customIngredient: CustomIngredient | null;
  onSelectPreset: (id: string) => void;
  onCustomFound: (ingredient: CustomIngredient | null) => void;
}) {
  const groups = getIngredientGroups();
  const [mode, setMode] = useState<"preset" | "custom">(
    customIngredient ? "custom" : "preset",
  );
  const [customQuery, setCustomQuery] = useState(customIngredient?.name ?? "");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lookupMethod, setLookupMethod] = useState<string | null>(null);

  async function lookupCustomIngredient() {
    const query = customQuery.trim();
    if (query.length < 2) {
      setSearchError("Type at least 2 characters.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setLookupMethod(null);

    try {
      const response = await fetch("/api/baking/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Lookup failed.");
      }

      onCustomFound(data.ingredient as CustomIngredient);
      setLookupMethod(data.method as string);
      setMode("custom");
    } catch (error) {
      onCustomFound(null);
      setSearchError(
        error instanceof Error ? error.message : "Could not look up ingredient.",
      );
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
            Ingredient
          </p>
          <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/70">
            Volume-to-weight conversions depend on what you are measuring.
          </p>
        </div>
        <div className="flex rounded-lg border border-amber-200 bg-white p-1 dark:border-amber-900/50 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setMode("preset")}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              mode === "preset"
                ? "bg-amber-600 text-white"
                : "text-zinc-600 dark:text-zinc-300",
            ].join(" ")}
          >
            Common items
          </button>
          <button
            type="button"
            onClick={() => setMode("custom")}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              mode === "custom"
                ? "bg-amber-600 text-white"
                : "text-zinc-600 dark:text-zinc-300",
            ].join(" ")}
          >
            AI lookup
          </button>
        </div>
      </div>

      {mode === "preset" ? (
        <label className="mt-4 flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Choose an item
          </span>
          <select
            value={selectedId}
            onChange={(event) => {
              onSelectPreset(event.target.value);
              onCustomFound(null);
            }}
            className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          >
            {groups.map((group) => (
              <optgroup key={group} label={group}>
                {bakingIngredients
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.gramsPerCup} g/cup)
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      ) : (
        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Type any ingredient
            </span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={customQuery}
                onChange={(event) => setCustomQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void lookupCustomIngredient();
                  }
                }}
                placeholder="e.g. tapioca starch, mashed banana"
                className="flex-1 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
              <button
                type="button"
                onClick={() => void lookupCustomIngredient()}
                disabled={isSearching}
                className="rounded-xl bg-amber-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSearching ? "Searching…" : "Search online"}
              </button>
            </div>
          </label>

          {searchError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{searchError}</p>
          ) : null}

          {customIngredient ? (
            <div className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {customIngredient.name}
              </p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                {customIngredient.gramsPerCup} g per US cup
                {lookupMethod === "ai" ? " · AI + web search" : null}
                {lookupMethod === "heuristic" ? " · parsed from web results" : null}
                {lookupMethod === "local" ? " · matched built-in database" : null}
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Source: {customIngredient.source}
              </p>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              AI searches the web for cup-to-gram data. Add{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
                ANTHROPIC_API_KEY
              </code>{" "}
              in `.env.local` for the most accurate results.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function BakingConverter() {
  const [ingredientId, setIngredientId] = useState(bakingIngredients[0].id);
  const [customIngredient, setCustomIngredient] = useState<CustomIngredient | null>(null);
  const [fromUnitId, setFromUnitId] = useState<BakingUnitId>("cup");
  const [toUnitId, setToUnitId] = useState<BakingUnitId>("g");
  const [inputValue, setInputValue] = useState("1");

  const activeIngredient: BakingIngredient | CustomIngredient | undefined =
    customIngredient ?? findIngredient(ingredientId);

  const numericInput = Number.parseFloat(inputValue);
  const isValidInput = inputValue.trim() !== "" && Number.isFinite(numericInput);

  const result = useMemo(() => {
    if (!isValidInput || !activeIngredient) return "—";
    return formatBakingResult(
      convertBakingValue(
        numericInput,
        fromUnitId,
        toUnitId,
        activeIngredient.gramsPerCup,
      ),
    );
  }, [activeIngredient, fromUnitId, isValidInput, numericInput, toUnitId]);

  const fromUnit = bakingUnits.find((unit) => unit.id === fromUnitId);
  const toUnit = bakingUnits.find((unit) => unit.id === toUnitId);

  function swapUnits() {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
    if (isValidInput) {
      setInputValue(result === "—" ? inputValue : result);
    }
  }

  return (
    <section className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 px-6 py-8 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Baking
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Convert between US cups, tablespoons, milliliters, liters, grams, and
          more — based on the ingredient you choose. Pick a common item or use AI
          to look up anything else online.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-6 py-8">
        <IngredientPicker
          selectedId={ingredientId}
          customIngredient={customIngredient}
          onSelectPreset={setIngredientId}
          onCustomFound={setCustomIngredient}
        />

        {activeIngredient ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Using{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {activeIngredient.gramsPerCup} g per 1 US cup
            </span>{" "}
            of {activeIngredient.name}.
            {"notes" in activeIngredient && activeIngredient.notes
              ? ` (${activeIngredient.notes})`
              : ""}
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
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-medium text-zinc-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Enter a value"
              />
            </label>
            <UnitSelect label="Unit" value={fromUnitId} onChange={setFromUnitId} />
          </div>

          <div className="flex justify-center lg:pb-3">
            <button
              type="button"
              onClick={swapUnits}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-700 transition hover:border-amber-500 hover:text-amber-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-amber-500 dark:hover:text-amber-400"
              aria-label="Swap units"
            >
              ⇄
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                To
              </span>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-lg font-semibold text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
                {result}
                {toUnit ? ` ${toUnit.symbol}` : ""}
              </div>
            </div>
            <UnitSelect label="Unit" value={toUnitId} onChange={setToUnitId} />
          </div>
        </div>

        {isValidInput && fromUnit && toUnit && activeIngredient ? (
          <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatBakingResult(numericInput)} {fromUnit.symbol}
            </span>{" "}
            of {activeIngredient.name} equals{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {result} {toUnit.symbol}
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
