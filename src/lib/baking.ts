export interface BakingIngredient {
  id: string;
  name: string;
  group: string;
  /** Grams per 1 US legal cup (240 ml measuring cup, ~236.588 ml volume). */
  gramsPerCup: number;
  notes?: string;
}

export type BakingUnitId =
  | "cup"
  | "tbsp"
  | "tsp"
  | "floz"
  | "ml"
  | "l"
  | "g"
  | "kg"
  | "oz"
  | "lb";

export interface BakingUnit {
  id: BakingUnitId;
  name: string;
  symbol: string;
  kind: "volume" | "weight";
}

/** US customary baking volumes in milliliters. */
export const US_CUP_ML = 236.5882365;

export const volumeToMl: Record<Extract<BakingUnitId, "cup" | "tbsp" | "tsp" | "floz" | "ml" | "l">, number> = {
  cup: US_CUP_ML,
  tbsp: 14.78676478125,
  tsp: 4.92892159375,
  floz: 29.5735295625,
  ml: 1,
  l: 1000,
};

export const weightToGrams: Record<Extract<BakingUnitId, "g" | "kg" | "oz" | "lb">, number> = {
  g: 1,
  kg: 1000,
  oz: 28.349523125,
  lb: 453.59237,
};

export const bakingUnits: BakingUnit[] = [
  { id: "cup", name: "US Cup", symbol: "cup", kind: "volume" },
  { id: "tbsp", name: "Tablespoon", symbol: "tbsp", kind: "volume" },
  { id: "tsp", name: "Teaspoon", symbol: "tsp", kind: "volume" },
  { id: "floz", name: "Fluid Ounce", symbol: "fl oz", kind: "volume" },
  { id: "ml", name: "Milliliter", symbol: "mL", kind: "volume" },
  { id: "l", name: "Liter", symbol: "L", kind: "volume" },
  { id: "g", name: "Gram", symbol: "g", kind: "weight" },
  { id: "kg", name: "Kilogram", symbol: "kg", kind: "weight" },
  { id: "oz", name: "Ounce", symbol: "oz", kind: "weight" },
  { id: "lb", name: "Pound", symbol: "lb", kind: "weight" },
];

export const bakingIngredients: BakingIngredient[] = [
  { id: "all-purpose-flour", name: "All-Purpose Flour", group: "Flours", gramsPerCup: 120 },
  { id: "bread-flour", name: "Bread Flour", group: "Flours", gramsPerCup: 127 },
  { id: "cake-flour", name: "Cake Flour", group: "Flours", gramsPerCup: 114 },
  { id: "whole-wheat-flour", name: "Whole Wheat Flour", group: "Flours", gramsPerCup: 120 },
  { id: "almond-flour", name: "Almond Flour", group: "Flours", gramsPerCup: 96 },
  { id: "coconut-flour", name: "Coconut Flour", group: "Flours", gramsPerCup: 112 },
  { id: "cornmeal", name: "Cornmeal", group: "Flours", gramsPerCup: 140 },
  { id: "cornstarch", name: "Cornstarch", group: "Flours", gramsPerCup: 128 },
  { id: "granulated-sugar", name: "Granulated Sugar", group: "Sugars", gramsPerCup: 200 },
  { id: "brown-sugar", name: "Brown Sugar (packed)", group: "Sugars", gramsPerCup: 220 },
  { id: "powdered-sugar", name: "Powdered Sugar", group: "Sugars", gramsPerCup: 120 },
  { id: "honey", name: "Honey", group: "Sugars", gramsPerCup: 340 },
  { id: "maple-syrup", name: "Maple Syrup", group: "Sugars", gramsPerCup: 322 },
  { id: "molasses", name: "Molasses", group: "Sugars", gramsPerCup: 340 },
  { id: "butter", name: "Butter", group: "Fats & Dairy", gramsPerCup: 227, notes: "2 sticks" },
  { id: "vegetable-oil", name: "Vegetable Oil", group: "Fats & Dairy", gramsPerCup: 218 },
  { id: "milk", name: "Milk", group: "Fats & Dairy", gramsPerCup: 240 },
  { id: "heavy-cream", name: "Heavy Cream", group: "Fats & Dairy", gramsPerCup: 238 },
  { id: "sour-cream", name: "Sour Cream", group: "Fats & Dairy", gramsPerCup: 230 },
  { id: "cream-cheese", name: "Cream Cheese", group: "Fats & Dairy", gramsPerCup: 232 },
  { id: "yogurt", name: "Plain Yogurt", group: "Fats & Dairy", gramsPerCup: 245 },
  { id: "water", name: "Water", group: "Liquids", gramsPerCup: 237 },
  { id: "cocoa-powder", name: "Cocoa Powder", group: "Dry Add-ins", gramsPerCup: 85 },
  { id: "rolled-oats", name: "Rolled Oats", group: "Dry Add-ins", gramsPerCup: 90 },
  { id: "breadcrumbs", name: "Breadcrumbs", group: "Dry Add-ins", gramsPerCup: 108 },
  { id: "shredded-coconut", name: "Shredded Coconut", group: "Dry Add-ins", gramsPerCup: 85 },
  { id: "chocolate-chips", name: "Chocolate Chips", group: "Dry Add-ins", gramsPerCup: 170 },
  { id: "raisins", name: "Raisins", group: "Dry Add-ins", gramsPerCup: 165 },
  { id: "walnuts", name: "Walnuts (chopped)", group: "Dry Add-ins", gramsPerCup: 120 },
  { id: "peanut-butter", name: "Peanut Butter", group: "Dry Add-ins", gramsPerCup: 258 },
  { id: "baking-soda", name: "Baking Soda", group: "Leaveners & Salt", gramsPerCup: 220 },
  { id: "salt", name: "Table Salt", group: "Leaveners & Salt", gramsPerCup: 273 },
  { id: "active-dry-yeast", name: "Active Dry Yeast", group: "Leaveners & Salt", gramsPerCup: 150 },
];

export interface CustomIngredient extends BakingIngredient {
  source: string;
  confidence: "high" | "medium" | "low";
}

export function getIngredientGroups(): string[] {
  return [...new Set(bakingIngredients.map((item) => item.group))];
}

export function findIngredient(id: string): BakingIngredient | undefined {
  return bakingIngredients.find((item) => item.id === id);
}

export function searchLocalIngredients(query: string): BakingIngredient[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return bakingIngredients.filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.group.toLowerCase().includes(normalized),
  );
}

function isVolumeUnit(unitId: BakingUnitId): boolean {
  return unitId in volumeToMl;
}

function isWeightUnit(unitId: BakingUnitId): boolean {
  return unitId in weightToGrams;
}

function toMilliliters(value: number, unitId: BakingUnitId): number {
  return value * volumeToMl[unitId as keyof typeof volumeToMl];
}

function toGramsWeight(value: number, unitId: BakingUnitId): number {
  return value * weightToGrams[unitId as keyof typeof weightToGrams];
}

function fromMilliliters(valueMl: number, unitId: BakingUnitId): number {
  return valueMl / volumeToMl[unitId as keyof typeof volumeToMl];
}

function fromGramsWeight(valueG: number, unitId: BakingUnitId): number {
  return valueG / weightToGrams[unitId as keyof typeof weightToGrams];
}

export function convertBakingValue(
  value: number,
  fromUnitId: BakingUnitId,
  toUnitId: BakingUnitId,
  gramsPerCup: number,
): number {
  if (fromUnitId === toUnitId) return value;

  const gramsPerMl = gramsPerCup / US_CUP_ML;
  const fromVolume = isVolumeUnit(fromUnitId);
  const toVolume = isVolumeUnit(toUnitId);
  const fromWeight = isWeightUnit(fromUnitId);
  const toWeight = isWeightUnit(toUnitId);

  if (fromVolume && toVolume) {
    return fromMilliliters(toMilliliters(value, fromUnitId), toUnitId);
  }

  if (fromWeight && toWeight) {
    return fromGramsWeight(toGramsWeight(value, fromUnitId), toUnitId);
  }

  if (fromVolume && toWeight) {
    const grams = toMilliliters(value, fromUnitId) * gramsPerMl;
    return fromGramsWeight(grams, toUnitId);
  }

  if (fromWeight && toVolume) {
    const ml = toGramsWeight(value, fromUnitId) / gramsPerMl;
    return fromMilliliters(ml, toUnitId);
  }

  return value;
}

export function formatBakingResult(value: number): string {
  if (!Number.isFinite(value)) return "—";

  const abs = Math.abs(value);
  if (abs === 0) return "0";
  if (abs >= 100_000 || (abs > 0 && abs < 0.001)) {
    return value.toExponential(4).replace(/\.?0+e/, "e");
  }

  const decimals = abs >= 100 ? 1 : abs >= 10 ? 2 : abs >= 1 ? 2 : 3;
  return value
    .toFixed(decimals)
    .replace(/\.?0+$/, "")
    .replace(/\.$/, "");
}
