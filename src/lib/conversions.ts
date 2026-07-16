export type CategoryId =
  | "length"
  | "weight"
  | "volume"
  | "temperature"
  | "area"
  | "speed"
  | "time"
  | "data";

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface LinearCategory {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  units: Unit[];
  /** Multiply input by this factor to convert to the category base unit. */
  factors: Record<string, number>;
}

export interface Category extends LinearCategory {
  type: "linear";
}

export interface TemperatureCategory {
  id: "temperature";
  name: string;
  description: string;
  icon: string;
  type: "temperature";
  units: Unit[];
}

export type ConversionCategory = Category | TemperatureCategory;

export const categories: ConversionCategory[] = [
  {
    id: "length",
    name: "Length",
    description: "Distance and size",
    icon: "↔",
    type: "linear",
    units: [
      { id: "km", name: "Kilometer", symbol: "km" },
      { id: "m", name: "Meter", symbol: "m" },
      { id: "cm", name: "Centimeter", symbol: "cm" },
      { id: "mm", name: "Millimeter", symbol: "mm" },
      { id: "mi", name: "Mile", symbol: "mi" },
      { id: "yd", name: "Yard", symbol: "yd" },
      { id: "ft", name: "Foot", symbol: "ft" },
      { id: "in", name: "Inch", symbol: "in" },
    ],
    factors: {
      km: 1000,
      m: 1,
      cm: 0.01,
      mm: 0.001,
      mi: 1609.344,
      yd: 0.9144,
      ft: 0.3048,
      in: 0.0254,
    },
  },
  {
    id: "weight",
    name: "Weight",
    description: "Mass and weight",
    icon: "⚖",
    type: "linear",
    units: [
      { id: "t", name: "Metric Ton", symbol: "t" },
      { id: "kg", name: "Kilogram", symbol: "kg" },
      { id: "g", name: "Gram", symbol: "g" },
      { id: "mg", name: "Milligram", symbol: "mg" },
      { id: "lb", name: "Pound", symbol: "lb" },
      { id: "oz", name: "Ounce", symbol: "oz" },
    ],
    factors: {
      t: 1000,
      kg: 1,
      g: 0.001,
      mg: 0.000001,
      lb: 0.45359237,
      oz: 0.028349523125,
    },
  },
  {
    id: "volume",
    name: "Volume",
    description: "Liquid and dry volume",
    icon: "🧪",
    type: "linear",
    units: [
      { id: "l", name: "Liter", symbol: "L" },
      { id: "ml", name: "Milliliter", symbol: "mL" },
      { id: "gal", name: "US Gallon", symbol: "gal" },
      { id: "qt", name: "US Quart", symbol: "qt" },
      { id: "pt", name: "US Pint", symbol: "pt" },
      { id: "cup", name: "US Cup", symbol: "cup" },
      { id: "floz", name: "US Fluid Ounce", symbol: "fl oz" },
    ],
    factors: {
      l: 1,
      ml: 0.001,
      gal: 3.785411784,
      qt: 0.946352946,
      pt: 0.473176473,
      cup: 0.2365882365,
      floz: 0.0295735295625,
    },
  },
  {
    id: "temperature",
    name: "Temperature",
    description: "Heat and cold",
    icon: "🌡",
    type: "temperature",
    units: [
      { id: "c", name: "Celsius", symbol: "°C" },
      { id: "f", name: "Fahrenheit", symbol: "°F" },
      { id: "k", name: "Kelvin", symbol: "K" },
    ],
  },
  {
    id: "area",
    name: "Area",
    description: "Surface and land area",
    icon: "▢",
    type: "linear",
    units: [
      { id: "sqkm", name: "Square Kilometer", symbol: "km²" },
      { id: "ha", name: "Hectare", symbol: "ha" },
      { id: "sqm", name: "Square Meter", symbol: "m²" },
      { id: "sqft", name: "Square Foot", symbol: "ft²" },
      { id: "sqmi", name: "Square Mile", symbol: "mi²" },
      { id: "acre", name: "Acre", symbol: "ac" },
    ],
    factors: {
      sqkm: 1_000_000,
      ha: 10_000,
      sqm: 1,
      sqft: 0.09290304,
      sqmi: 2_589_988.110336,
      acre: 4046.8564224,
    },
  },
  {
    id: "speed",
    name: "Speed",
    description: "Velocity and pace",
    icon: "➤",
    type: "linear",
    units: [
      { id: "kmh", name: "Kilometer per hour", symbol: "km/h" },
      { id: "ms", name: "Meter per second", symbol: "m/s" },
      { id: "mph", name: "Mile per hour", symbol: "mph" },
      { id: "kn", name: "Knot", symbol: "kn" },
    ],
    factors: {
      kmh: 1000 / 3600,
      ms: 1,
      mph: 1609.344 / 3600,
      kn: 1852 / 3600,
    },
  },
  {
    id: "time",
    name: "Time",
    description: "Duration and intervals",
    icon: "⏱",
    type: "linear",
    units: [
      { id: "yr", name: "Year", symbol: "yr" },
      { id: "wk", name: "Week", symbol: "wk" },
      { id: "day", name: "Day", symbol: "day" },
      { id: "hr", name: "Hour", symbol: "hr" },
      { id: "min", name: "Minute", symbol: "min" },
      { id: "s", name: "Second", symbol: "s" },
      { id: "ms", name: "Millisecond", symbol: "ms" },
    ],
    factors: {
      yr: 31_557_600,
      wk: 604_800,
      day: 86_400,
      hr: 3600,
      min: 60,
      s: 1,
      ms: 0.001,
    },
  },
  {
    id: "data",
    name: "Data",
    description: "Digital storage size",
    icon: "💾",
    type: "linear",
    units: [
      { id: "tb", name: "Terabyte", symbol: "TB" },
      { id: "gb", name: "Gigabyte", symbol: "GB" },
      { id: "mb", name: "Megabyte", symbol: "MB" },
      { id: "kb", name: "Kilobyte", symbol: "KB" },
      { id: "b", name: "Byte", symbol: "B" },
    ],
    factors: {
      tb: 1_000_000_000_000,
      gb: 1_000_000_000,
      mb: 1_000_000,
      kb: 1000,
      b: 1,
    },
  },
];

function toCelsius(value: number, unitId: string): number {
  switch (unitId) {
    case "c":
      return value;
    case "f":
      return ((value - 32) * 5) / 9;
    case "k":
      return value - 273.15;
    default:
      return value;
  }
}

function fromCelsius(value: number, unitId: string): number {
  switch (unitId) {
    case "c":
      return value;
    case "f":
      return (value * 9) / 5 + 32;
    case "k":
      return value + 273.15;
    default:
      return value;
  }
}

export function convertValue(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: ConversionCategory,
): number {
  if (category.type === "temperature") {
    return fromCelsius(toCelsius(value, fromUnitId), toUnitId);
  }

  const fromFactor = category.factors[fromUnitId];
  const toFactor = category.factors[toUnitId];
  return (value * fromFactor) / toFactor;
}

export function formatResult(value: number): string {
  if (!Number.isFinite(value)) return "—";

  const abs = Math.abs(value);
  if (abs === 0) return "0";
  if (abs >= 1_000_000 || (abs > 0 && abs < 0.0001)) {
    return value.toExponential(6).replace(/\.?0+e/, "e");
  }

  const decimals = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
  return value
    .toFixed(decimals)
    .replace(/\.?0+$/, "")
    .replace(/\.$/, "");
}

export function getCategory(id: CategoryId): ConversionCategory {
  const category = categories.find((item) => item.id === id);
  if (!category) {
    return categories[0];
  }
  return category;
}
