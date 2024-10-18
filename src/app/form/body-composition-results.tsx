"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Label,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DetailedResults } from "./body-composition-utils";

interface BodyCompositionResultsProps {
  results: DetailedResults;
}

export function BodyCompositionResults({
  results,
}: BodyCompositionResultsProps) {
  const calculateNorms = (
    metric: string,
    value: number,
    gender: "male" | "female",
    height: number,
    weight: number,
  ) => {
    switch (metric) {
      case "Body Mass Index":
        return { low: 18.5, high: 24.9 };
      case "Weight":
        const idealWeight = gender === "male" ? height - 100 : height - 105;
        return { low: idealWeight * 0.9, high: idealWeight * 1.1 };
      case "Fat Mass":
        const idealFatMass = gender === "male" ? weight * 0.15 : weight * 0.23;
        return { low: idealFatMass * 0.8, high: idealFatMass * 1.2 };
      case "Fat Percentage":
        return gender === "male"
          ? { low: 10, high: 20 }
          : { low: 18, high: 28 };
      case "Lean Mass":
        const idealLeanMass = gender === "male" ? weight * 0.85 : weight * 0.77;
        return { low: idealLeanMass * 0.9, high: idealLeanMass * 1.1 };
      case "Active Cell Mass":
        return { low: results.leanMass * 0.53, high: results.leanMass * 0.59 };
      case "ACM Percentage":
        return { low: 53, high: 59 };
      case "Total Body Water":
        const idealTBW = gender === "male" ? weight * 0.6 : weight * 0.5;
        return { low: idealTBW * 0.9, high: idealTBW * 1.1 };
      case "Extracellular Fluid":
        return {
          low: results.totalBodyWater * 0.33,
          high: results.totalBodyWater * 0.4,
        };
      case "Intracellular Fluid":
        return {
          low: results.totalBodyWater * 0.6,
          high: results.totalBodyWater * 0.67,
        };
      case "Basal Metabolic Rate":
        const idealBMR =
          gender === "male"
            ? 10 * weight + 6.25 * height - 5 * 30 + 5
            : 10 * weight + 6.25 * height - 5 * 30 - 161;
        return { low: idealBMR * 0.9, high: idealBMR * 1.1 };
      default:
        return { low: value * 0.9, high: value * 1.1 };
    }
  };

  const chartData = [
    { name: "Body Mass Index", value: results.bmi, unit: "kg/m²" },
    { name: "Weight", value: results.weight, unit: "kg" },
    { name: "Fat Mass", value: results.fatMass, unit: "kg" },
    { name: "Fat Percentage", value: results.fatPercentage, unit: "%" },
    { name: "Lean Mass", value: results.leanMass, unit: "kg" },
    { name: "Active Cell Mass", value: results.activeCellMass, unit: "kg" },
    {
      name: "ACM Percentage",
      value: (results.activeCellMass / results.leanMass) * 100,
      unit: "%",
    },
    { name: "Total Body Water", value: results.totalBodyWater, unit: "L" },
    {
      name: "Extracellular Fluid",
      value: results.extracellularWater,
      unit: "L",
    },
    {
      name: "Intracellular Fluid",
      value: results.intracellularWater,
      unit: "L",
    },
    {
      name: "Basal Metabolic Rate",
      value: results.basalMetabolicRate,
      unit: "kcal",
    },
  ].map((item) => {
    const { low, high } = calculateNorms(
      item.name,
      item.value,
      results.gender,
      results.height,
      results.weight,
    );
    return {
      ...item,
      low,
      high,
      belowNorm: Math.max(0, low),
      normRange: high - low,
      aboveNorm: Math.max(0, 100 - high),
      status:
        item.value < low ? "below" : item.value > high ? "above" : "normal",
    };
  });

  return (
    <div className="mt-8 space-y-8">
      <h2 className="text-2xl font-bold">Results</h2>
      <ResultsChart data={chartData} />
      <ResultsTable results={results} />
    </div>
  );
}

function ResultsChart({ data }: { data: any[] }) {
  const CustomBar = (props: any) => {
    const {
      x,
      y,
      width,
      height,
      value,
      low,
      high,
      belowNorm,
      normRange,
      aboveNorm,
      status,
    } = props;
    const valuePosition =
      ((value - low) / (high - low)) * normRange + belowNorm;
    const barColor =
      status === "below"
        ? "hsl(var(--destructive))"
        : status === "above"
          ? "hsl(var(--destructive))"
          : "hsl(var(--primary))";

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="hsl(var(--muted))"
        />
        <rect
          x={x + (belowNorm * width) / 100}
          y={y}
          width={(normRange * width) / 100}
          height={height}
          fill="hsl(var(--accent))"
        />
        <rect
          x={x + (valuePosition * width) / 100}
          y={y}
          width={2}
          height={height}
          fill={barColor}
        />
      </g>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body Composition Metrics</CardTitle>
        <CardDescription>
          Horizontal bar chart showing your metrics compared to normal ranges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={600}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 30, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" width={140} />
            <Tooltip
              content={({ payload, label }) => {
                if (payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background p-2 border rounded shadow">
                      <p className="font-bold">{label}</p>
                      <p>
                        Value: {data.value.toFixed(2)} {data.unit}
                      </p>
                      <p>
                        Normal range: {data.low.toFixed(2)} -{" "}
                        {data.high.toFixed(2)} {data.unit}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" shape={<CustomBar />}>
              <LabelList
                dataKey="value"
                position="right"
                formatter={(value: number) => value.toFixed(2)}
              />
            </Bar>
            <Label value="Below Norm" position="top" offset={10} x="16.67%" />
            <Label value="Norm" position="top" offset={10} x="50%" />
            <Label value="Above Norm" position="top" offset={10} x="83.33%" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ResultsTable({ results }: BodyCompositionResultsProps) {
  return (
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
          <TableCell>{results.fatPercentage.toFixed(2)}</TableCell>
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
          <TableCell>{results.activeCellMass.toFixed(2)}</TableCell>
          <TableCell>kg</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Total Body Water</TableCell>
          <TableCell>{results.totalBodyWater.toFixed(2)}</TableCell>
          <TableCell>L</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Extracellular Water</TableCell>
          <TableCell>{results.extracellularWater.toFixed(2)}</TableCell>
          <TableCell>L</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Intracellular Water</TableCell>
          <TableCell>{results.intracellularWater.toFixed(2)}</TableCell>
          <TableCell>L</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Basal Metabolic Rate</TableCell>
          <TableCell>{results.basalMetabolicRate.toFixed(0)}</TableCell>
          <TableCell>kcal/day</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
