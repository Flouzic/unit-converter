"use client";

import { useMemo, useState } from "react";
import {
  convertElectricity,
  electricityTypes,
  getElectricityType,
  type ElectricityType,
  type ElectricityTypeId,
} from "@/lib/electricity";
import { formatResult } from "@/lib/conversions";

function UnitSelect({
  label,
  value,
  units,
  onChange,
}: {
  label: string;
  value: string;
  units: ElectricityType["units"];
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
        className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
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

function ConverterPanel({ type }: { type: ElectricityType }) {
  const [fromUnitId, setFromUnitId] = useState(type.units[0].id);
  const [toUnitId, setToUnitId] = useState(type.units[1]?.id ?? type.units[0].id);
  const [inputValue, setInputValue] = useState("1");

  const numericInput = Number.parseFloat(inputValue);
  const isValidInput = inputValue.trim() !== "" && Number.isFinite(numericInput);

  const result = useMemo(() => {
    if (!isValidInput) return "—";
    return formatResult(convertElectricity(numericInput, fromUnitId, toUnitId, type));
  }, [fromUnitId, isValidInput, numericInput, toUnitId, type]);

  const fromUnit = type.units.find((unit) => unit.id === fromUnitId);
  const toUnit = type.units.find((unit) => unit.id === toUnitId);

  function swapUnits() {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
    if (isValidInput) {
      setInputValue(result === "—" ? inputValue : result);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
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
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-lg font-medium text-zinc-900 outline-none transition focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              placeholder="Enter a value"
            />
          </label>
          <UnitSelect
            label="Unit"
            value={fromUnitId}
            units={type.units}
            onChange={setFromUnitId}
          />
        </div>

        <div className="flex justify-center lg:pb-3">
          <button
            type="button"
            onClick={swapUnits}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg text-zinc-700 transition hover:border-yellow-500 hover:text-yellow-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-yellow-500 dark:hover:text-yellow-400"
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
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-lg font-semibold text-yellow-900 dark:border-yellow-900/50 dark:bg-yellow-950/40 dark:text-yellow-100">
              {result}
              {toUnit ? ` ${toUnit.symbol}` : ""}
            </div>
          </div>
          <UnitSelect
            label="Unit"
            value={toUnitId}
            units={type.units}
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
  );
}

export default function ElectricityConverter() {
  const [activeTypeId, setActiveTypeId] = useState<ElectricityTypeId>("current");
  const activeType = getElectricityType(activeTypeId);

  return (
    <section className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 px-6 py-8 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Electricity
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Convert between current (amps), voltage (volts), and power (watts).
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap gap-2">
          {electricityTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setActiveTypeId(type.id)}
              className={[
                "rounded-xl px-4 py-2.5 text-sm font-medium transition",
                activeTypeId === type.id
                  ? "bg-yellow-500 text-white shadow-sm"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-yellow-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200",
              ].join(" ")}
            >
              {type.name}
            </button>
          ))}
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {activeType.description}
        </p>

        <ConverterPanel key={activeType.id} type={activeType} />
      </div>
    </section>
  );
}
