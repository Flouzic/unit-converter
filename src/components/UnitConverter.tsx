"use client";

import { useMemo, useState } from "react";
import BakingConverter from "@/components/BakingConverter";
import CurrencyConverter from "@/components/CurrencyConverter";
import ElectricityConverter from "@/components/ElectricityConverter";
import {
  categories,
  convertValue,
  formatResult,
  type CategoryId,
  type ConversionCategory,
} from "@/lib/conversions";

export type NavCategoryId = CategoryId | "baking" | "currency" | "electricity";

const bakingNavItem = {
  id: "baking" as const,
  name: "Baking",
  description: "Cups, grams & ingredients",
  icon: "🧁",
};

const currencyNavItem = {
  id: "currency" as const,
  name: "Currency",
  description: "Money & exchange rates",
  icon: "💱",
};

const electricityNavItem = {
  id: "electricity" as const,
  name: "Electricity",
  description: "Amps, volts & watts",
  icon: "⚡",
};

const navItems = [
  ...categories.map((category) => ({
    id: category.id as NavCategoryId,
    name: category.name,
    description: category.description,
    icon: category.icon,
  })),
  electricityNavItem,
  bakingNavItem,
  currencyNavItem,
];

type SpecialNavId = "baking" | "currency" | "electricity";

function getNavAccent(id: NavCategoryId): SpecialNavId | "default" {
  if (id === "baking") return "baking";
  if (id === "currency") return "currency";
  if (id === "electricity") return "electricity";
  return "default";
}

const navAccentStyles = {
  baking: {
    active: "bg-amber-600 text-white shadow-sm",
    icon: "bg-amber-500",
    subtitle: "text-amber-100",
  },
  currency: {
    active: "bg-sky-600 text-white shadow-sm",
    icon: "bg-sky-500",
    subtitle: "text-sky-100",
  },
  electricity: {
    active: "bg-yellow-500 text-white shadow-sm",
    icon: "bg-yellow-400",
    subtitle: "text-yellow-100",
  },
  default: {
    active: "bg-emerald-600 text-white shadow-sm",
    icon: "bg-emerald-500",
    subtitle: "text-emerald-100",
  },
} as const;

function Sidebar({
  activeCategoryId,
  onSelect,
}: {
  activeCategoryId: NavCategoryId;
  onSelect: (id: NavCategoryId) => void;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-zinc-200 bg-zinc-50 md:w-64 md:border-b-0 md:border-r dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-5 py-6 dark:border-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          Unit Converter
        </p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Measurements
        </h1>
      </div>

      <nav className="flex gap-2 overflow-x-auto p-3 md:flex-col md:overflow-visible md:p-4">
        {navItems.map((category) => {
          const isActive = category.id === activeCategoryId;
          const accent = navAccentStyles[getNavAccent(category.id)];

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.id)}
              className={[
                "flex min-w-[9rem] items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors md:min-w-0 md:w-full",
                isActive
                  ? accent.active
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-lg text-lg",
                  isActive
                    ? accent.icon
                    : "bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
                ].join(" ")}
                aria-hidden
              >
                {category.icon}
              </span>
              <span>
                <span className="block text-sm font-medium">{category.name}</span>
                <span
                  className={[
                    "block text-xs",
                    isActive ? accent.subtitle : "text-zinc-500 dark:text-zinc-400",
                  ].join(" ")}
                >
                  {category.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function UnitSelect({
  label,
  value,
  units,
  onChange,
}: {
  label: string;
  value: string;
  units: ConversionCategory["units"];
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
        className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.name} ({unit.symbol})
          </option>
        ))}
      </select>
    </label>
  );
}

function ConverterPanel({ category }: { category: ConversionCategory }) {
  const [fromUnitId, setFromUnitId] = useState(category.units[0].id);
  const [toUnitId, setToUnitId] = useState(category.units[1]?.id ?? category.units[0].id);
  const [inputValue, setInputValue] = useState("1");

  const numericInput = Number.parseFloat(inputValue);
  const isValidInput = inputValue.trim() !== "" && Number.isFinite(numericInput);

  const result = useMemo(() => {
    if (!isValidInput) return "—";
    return formatResult(convertValue(numericInput, fromUnitId, toUnitId, category));
  }, [category, fromUnitId, isValidInput, numericInput, toUnitId]);

  const fromUnit = category.units.find((unit) => unit.id === fromUnitId);
  const toUnit = category.units.find((unit) => unit.id === toUnitId);

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
          {category.name}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Convert between common {category.name.toLowerCase()} units. Enter a value,
          pick your units, and see the result instantly.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-6 py-8">
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
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-medium text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Enter a value"
              />
            </label>
            <UnitSelect
              label="Unit"
              value={fromUnitId}
              units={category.units}
              onChange={setFromUnitId}
            />
          </div>

          <div className="flex justify-center lg:pb-3">
            <button
              type="button"
              onClick={swapUnits}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-700 transition hover:border-emerald-500 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
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
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-lg font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100">
                {result}
                {toUnit ? ` ${toUnit.symbol}` : ""}
              </div>
            </div>
            <UnitSelect
              label="Unit"
              value={toUnitId}
              units={category.units}
              onChange={setToUnitId}
            />
          </div>
        </div>

        {isValidInput && fromUnit && toUnit ? (
          <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {formatResult(numericInput)} {fromUnit.symbol}
            </span>{" "}
            equals{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {result} {toUnit.symbol}
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default function UnitConverter() {
  const [activeCategoryId, setActiveCategoryId] = useState<NavCategoryId>("length");
  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ?? categories[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-950 md:flex-row">
      <Sidebar
        activeCategoryId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />
      {activeCategoryId === "baking" ? (
        <BakingConverter />
      ) : activeCategoryId === "currency" ? (
        <CurrencyConverter />
      ) : activeCategoryId === "electricity" ? (
        <ElectricityConverter />
      ) : (
        <ConverterPanel key={activeCategory.id} category={activeCategory} />
      )}
    </div>
  );
}
