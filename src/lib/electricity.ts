import type { Unit } from "@/lib/conversions";

export type ElectricityTypeId = "current" | "voltage" | "power";

export interface ElectricityType {
  id: ElectricityTypeId;
  name: string;
  description: string;
  units: Unit[];
  factors: Record<string, number>;
}

export const electricityTypes: ElectricityType[] = [
  {
    id: "current",
    name: "Current",
    description: "Amps and smaller units",
    units: [
      { id: "ka", name: "Kiloampere", symbol: "kA" },
      { id: "a", name: "Ampere", symbol: "A" },
      { id: "ma", name: "Milliampere", symbol: "mA" },
      { id: "ua", name: "Microampere", symbol: "μA" },
      { id: "na", name: "Nanoampere", symbol: "nA" },
    ],
    factors: {
      ka: 1000,
      a: 1,
      ma: 0.001,
      ua: 0.000001,
      na: 0.000000001,
    },
  },
  {
    id: "voltage",
    name: "Voltage",
    description: "Volts and smaller units",
    units: [
      { id: "kv", name: "Kilovolt", symbol: "kV" },
      { id: "v", name: "Volt", symbol: "V" },
      { id: "mv", name: "Millivolt", symbol: "mV" },
      { id: "uv", name: "Microvolt", symbol: "μV" },
    ],
    factors: {
      kv: 1000,
      v: 1,
      mv: 0.001,
      uv: 0.000001,
    },
  },
  {
    id: "power",
    name: "Power",
    description: "Watts and smaller units",
    units: [
      { id: "mw", name: "Megawatt", symbol: "MW" },
      { id: "kw", name: "Kilowatt", symbol: "kW" },
      { id: "w", name: "Watt", symbol: "W" },
      { id: "mw_small", name: "Milliwatt", symbol: "mW" },
      { id: "hp", name: "Horsepower", symbol: "hp" },
    ],
    factors: {
      mw: 1_000_000,
      kw: 1000,
      w: 1,
      mw_small: 0.001,
      hp: 745.6998715822701,
    },
  },
];

export function convertElectricity(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  type: ElectricityType,
): number {
  const fromFactor = type.factors[fromUnitId];
  const toFactor = type.factors[toUnitId];
  return (value * fromFactor) / toFactor;
}

export function getElectricityType(id: ElectricityTypeId): ElectricityType {
  return electricityTypes.find((type) => type.id === id) ?? electricityTypes[0];
}
