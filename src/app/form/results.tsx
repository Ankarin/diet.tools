import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateBodyComposition,
  BodyCompositionData,
  CalculationResults,
} from "./calculations";

interface ResultsProps {
  data: BodyCompositionData;
}

const metricUnits = {
  bmi: "kg/m²",
  weight: "kg",
  fatPercentage: "%",
  fatMass: "kg",
  leanMass: "kg",
  activeCellMass: "kg",
  totalBodyWater: "L",
  extracellularWater: "L",
  intracellularWater: "L",
  basalMetabolicRate: "kcal/day",
};

const imperialUnits = {
  bmi: "lb/in²",
  weight: "lb",
  fatPercentage: "%",
  fatMass: "lb",
  leanMass: "lb",
  activeCellMass: "lb",
  totalBodyWater: "fl oz",
  extracellularWater: "fl oz",
  intracellularWater: "fl oz",
  basalMetabolicRate: "kcal/day",
};

const formatLabel = (key: string): string => {
  return key
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const convertToImperial = (value: number, unit: string): number => {
  switch (unit) {
    case "kg":
    case "lb":
      return value * 2.20462;
    case "L":
    case "fl oz":
      return value * 33.814;
    default:
      return value;
  }
};

export default function Results({ data }: ResultsProps) {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Invalid or missing data. Please ensure all required fields are
            filled out correctly.
          </p>
        </CardContent>
      </Card>
    );
  }

  let results: CalculationResults;
  try {
    results = calculateBodyComposition(data);
  } catch (error) {
    console.error("Error calculating body composition:", error);
    return (
      <Card className="w-full max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            An error occurred while calculating body composition. Please check
            your input data and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const units = data.unit === "metric" ? metricUnits : imperialUnits;

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Metric</TableHead>
              <TableHead className="w-1/2">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(results).map(([key, value]) => {
              if (key !== "gender") {
                const displayValue =
                  data.unit === "imperial" &&
                  key !== "fatPercentage" &&
                  key !== "basalMetabolicRate"
                    ? convertToImperial(
                        value as number,
                        units[key as keyof typeof units],
                      )
                    : value;
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {formatLabel(key)}
                    </TableCell>
                    <TableCell>
                      {typeof displayValue === "number"
                        ? displayValue.toFixed(2)
                        : displayValue}
                      {` ${units[key as keyof typeof units]}`}
                    </TableCell>
                  </TableRow>
                );
              }
              return null;
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
