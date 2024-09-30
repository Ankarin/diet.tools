"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  unit: z.enum(["metric", "imperial"]),
  weight: z.number().positive("Weight must be a positive number"),
  height: z.number().positive("Height must be a positive number"),
  age: z.number().int().positive("Age must be a positive integer"),
  gender: z.enum(["male", "female"]),
  waist: z.number().positive("Waist measurement must be a positive number"),
  hip: z.number().positive("Hip measurement must be a positive number"),
  neck: z.number().positive("Neck measurement must be a positive number"),
});

type BodyCompositionData = z.infer<typeof formSchema>;

interface CalculationResults {
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

const calculateBodyComposition = (
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

export default function BodyCompositionCalculator() {
  const [unit, setUnit] = useState("metric");
  const [results, setResults] = useState<CalculationResults | null>(null);

  const form = useForm<BodyCompositionData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: "metric",
      weight: undefined,
      height: undefined,
      age: undefined,
      gender: undefined,
      waist: undefined,
      hip: undefined,
      neck: undefined,
    },
  });

  const handleCalculate = (values: BodyCompositionData) => {
    const calculatedResults = calculateBodyComposition(values);
    setResults(calculatedResults);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="z-[50] sticky top-0 w-full bg-background/95 border-b backdrop-blur-sm border-border/40">
        <div className="container h-14 flex items-center">
          <Link
            href="/"
            className="flex justify-start items-center hover:opacity-85 transition-opacity duration-300"
          >
            <span className="font-bold text-xl">
              Body Composition Calculator
            </span>
          </Link>
        </div>
      </header>
      <main className="flex-1 py-4 sm:py-6 md:py-8">
        <div className="container px-2 sm:px-4">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-2xl sm:text-3xl">
                Body Composition Calculator
              </CardTitle>
              <CardDescription>
                Enter your measurements to calculate body composition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleCalculate)}
                  className="space-y-6 sm:space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem className="space-y-2 sm:space-y-4">
                        <FormLabel>Unit System</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => {
                              field.onChange(value);
                              setUnit(value);
                            }}
                            defaultValue={field.value}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="metric" id="metric" />
                              <Label htmlFor="metric">Metric</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="imperial" id="imperial" />
                              <Label htmlFor="imperial">Imperial</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Weight ({unit === "metric" ? "kg" : "lbs"})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter weight"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Height ({unit === "metric" ? "cm" : "inches"})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter height"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (years)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter age"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="waist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Waist ({unit === "metric" ? "cm" : "inches"})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter waist"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Hip ({unit === "metric" ? "cm" : "inches"})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter hip"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="neck"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Neck ({unit === "metric" ? "cm" : "inches"})
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter neck"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Calculate
                  </Button>
                </form>
              </Form>

              {results && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">Results</h2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Body Mass Index (BMI)</TableCell>
                        <TableCell>{results.bmi.toFixed(2)}</TableCell>
                        <TableCell>kg/m²</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Weight</TableCell>
                        <TableCell>{results.weight.toFixed(2)}</TableCell>
                        <TableCell>kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Body Fat Percentage</TableCell>
                        <TableCell>
                          {results.fatPercentage.toFixed(2)}
                        </TableCell>
                        <TableCell>%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Fat Mass</TableCell>
                        <TableCell>{results.fatMass.toFixed(2)}</TableCell>
                        <TableCell>kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Lean Mass</TableCell>
                        <TableCell>{results.leanMass.toFixed(2)}</TableCell>
                        <TableCell>kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Active Cell Mass</TableCell>
                        <TableCell>
                          {results.activeCellMass.toFixed(2)}
                        </TableCell>
                        <TableCell>kg</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Total Body Water</TableCell>
                        <TableCell>
                          {results.totalBodyWater.toFixed(2)}
                        </TableCell>
                        <TableCell>L</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Extracellular Water</TableCell>
                        <TableCell>
                          {results.extracellularWater.toFixed(2)}
                        </TableCell>
                        <TableCell>L</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Intracellular Water</TableCell>
                        <TableCell>
                          {results.intracellularWater.toFixed(2)}
                        </TableCell>
                        <TableCell>L</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Basal Metabolic Rate</TableCell>
                        <TableCell>
                          {results.basalMetabolicRate.toFixed(0)}
                        </TableCell>
                        <TableCell>kcal/day</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
