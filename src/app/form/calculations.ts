import * as z from "zod";

export const formSchema = z
  .object({
    gender: z.enum(["male", "female"]),
    age: z.string().min(1, "Age is required"),
    unit: z.enum(["metric", "imperial"]),
    height: z.string().optional(),
    heightFeet: z.string().optional(),
    heightInches: z.string().optional(),
    weight: z.string().min(1, "Weight is required"),
    waist: z.string().min(1, "Waist measurement is required"),
    hip: z.string().min(1, "Hip measurement is required"),
    neck: z.string().min(1, "Neck measurement is required"),
  })
  .refine(
    (data) => {
      if (data.unit === "metric") {
        return !!data.height;
      } else {
        return !!data.heightFeet && !!data.heightInches;
      }
    },
    {
      message: "Height is required",
      path: ["height"],
    },
  );

export type BodyCompositionData = z.infer<typeof formSchema>;

export interface CalculationResults {
  gender: "male" | "female";
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

export const calculateBodyComposition = (
  data: BodyCompositionData,
): CalculationResults => {
  const { unit, weight, age, gender, waist, hip, neck } = data;

  const weightNum = parseFloat(weight);
  const ageNum = parseInt(age, 10);
  const waistNum = parseFloat(waist);
  const hipNum = parseFloat(hip);
  const neckNum = parseFloat(neck);

  let heightCm: number;
  if (unit === "metric") {
    heightCm = parseFloat(data.height || "0");
  } else {
    const feet = parseFloat(data.heightFeet || "0");
    const inches = parseFloat(data.heightInches || "0");
    heightCm = (feet * 12 + inches) * 2.54;
  }

  const weightKg = unit === "metric" ? weightNum : weightNum * 0.453592;
  const waistCm = unit === "metric" ? waistNum : waistNum * 2.54;
  const hipCm = unit === "metric" ? hipNum : hipNum * 2.54;
  const neckCm = unit === "metric" ? neckNum : neckNum * 2.54;

  const bmi = weightKg / (heightCm / 100) ** 2;

  const bodyFatPercentage =
    gender === "male"
      ? 86.01 * Math.log10(waistCm - neckCm) -
        70.041 * Math.log10(heightCm) +
        36.76
      : 163.205 * Math.log10(waistCm + hipCm - neckCm) -
        97.684 * Math.log10(heightCm) -
        78.387;

  const fatMass = (bodyFatPercentage / 100) * weightKg;
  const leanMass = weightKg - fatMass;
  const activeCellMass = leanMass * 0.7;
  const totalBodyWater = leanMass * 0.73;
  const extracellularWater = totalBodyWater * 0.4;
  const intracellularWater = totalBodyWater * 0.6;

  const basalMetabolicRate =
    gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * ageNum + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * ageNum - 161;

  return {
    gender,
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
