import * as z from "zod";

export const formSchema = z.object({
  unit: z.enum(["metric", "imperial"]),
  weight: z.number().positive("Weight must be a positive number"),
  height: z.number().positive("Height must be a positive number"),
  age: z.number().int().positive("Age must be a positive integer"),
  gender: z.enum(["male", "female"]),
  waist: z.number().positive("Waist measurement must be a positive number"),
  hip: z.number().positive("Hip measurement must be a positive number"),
  neck: z.number().positive("Neck measurement must be a positive number"),
});

export type BodyCompositionData = z.infer<typeof formSchema>;

export interface CalculationResults {
  bmi: number;
  weight: number;
  fatMass: number;
  fatPercentage: number;
  leanMass: number;
  activeCellMass: number;
  totalBodyWater: number;
  extracellularWater: number;
  intracellularWater: number;
  basalMetabolicRate: number;
}

export interface MetricRange {
  low: number;
  normal: number;
  high: number;
}

export interface DetailedMetric {
  name: string;
  value: number;
  unit: string;
  range: MetricRange;
}

export interface DetailedResults extends CalculationResults {
  detailedMetrics: DetailedMetric[];
}

const getMetricRange = (
  metric: string,
  gender: "male" | "female",
): MetricRange => {
  // These ranges are approximate and should be adjusted based on accurate medical data
  const ranges: { [key: string]: { male: MetricRange; female: MetricRange } } =
    {
      bmi: {
        male: { low: 18.5, normal: 25, high: 30 },
        female: { low: 18.5, normal: 25, high: 30 },
      },
      fatPercentage: {
        male: { low: 10, normal: 20, high: 25 },
        female: { low: 18, normal: 28, high: 35 },
      },
      leanMass: {
        male: { low: 60, normal: 75, high: 90 },
        female: { low: 45, normal: 55, high: 70 },
      },
      totalBodyWater: {
        male: { low: 50, normal: 60, high: 65 },
        female: { low: 45, normal: 55, high: 60 },
      },
    };

  return ranges[metric]?.[gender] || { low: 0, normal: 50, high: 100 };
};

export const calculateBodyComposition = (
  data: BodyCompositionData,
): CalculationResults => {
  const { unit, weight, height, age, gender, waist, hip, neck } = data;

  // Convert imperial to metric if necessary
  const weightKg = unit === "metric" ? weight : weight * 0.453592;
  const heightCm = unit === "metric" ? height : height * 2.54;
  const waistCm = unit === "metric" ? waist : waist * 2.54;
  const hipCm = unit === "metric" ? hip : hip * 2.54;
  const neckCm = unit === "metric" ? neck : neck * 2.54;

  // BMI calculation
  const bmi = weightKg / (heightCm / 100) ** 2;

  // Body Fat Percentage calculation (U.S. Navy Method)
  const bodyFatPercentage =
    gender === "male"
      ? 86.01 * Math.log10(waistCm - neckCm) -
        70.041 * Math.log10(heightCm) +
        36.76
      : 163.205 * Math.log10(waistCm + hipCm - neckCm) -
        97.684 * Math.log10(heightCm) -
        78.387;

  // Fat Mass and Lean Mass calculations
  const fatMass = (bodyFatPercentage / 100) * weightKg;
  const leanMass = weightKg - fatMass;

  // Active Cell Mass (estimated)
  const activeCellMass = leanMass * 0.7;

  // Total Body Water (estimated)
  const totalBodyWater = leanMass * 0.73;

  // Extracellular and Intracellular Water (estimated)
  const extracellularWater = totalBodyWater * 0.4;
  const intracellularWater = totalBodyWater * 0.6;

  // Basal Metabolic Rate (Mifflin-St Jeor Equation)
  const basalMetabolicRate =
    gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  return {
    bmi,
    weight: weightKg,
    fatMass,
    fatPercentage: bodyFatPercentage,
    leanMass,
    activeCellMass,
    totalBodyWater,
    extracellularWater,
    intracellularWater,
    basalMetabolicRate,
  };
};

export const calculateDetailedResults = (
  data: BodyCompositionData,
): DetailedResults => {
  const basicResults = calculateBodyComposition(data);

  const detailedMetrics: DetailedMetric[] = [
    {
      name: "Body Mass Index (BMI)",
      value: basicResults.bmi,
      unit: "kg/m²",
      range: getMetricRange("bmi", data.gender),
    },
    {
      name: "Body Fat Percentage",
      value: basicResults.fatPercentage,
      unit: "%",
      range: getMetricRange("fatPercentage", data.gender),
    },
    {
      name: "Lean Mass",
      value: basicResults.leanMass,
      unit: "kg",
      range: getMetricRange("leanMass", data.gender),
    },
    {
      name: "Total Body Water",
      value: basicResults.totalBodyWater,
      unit: "L",
      range: getMetricRange("totalBodyWater", data.gender),
    },
    // Add more metrics as needed
  ];

  return {
    ...basicResults,
    detailedMetrics,
  };
};
