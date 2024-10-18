"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BodyCompositionData, formSchema } from "./body-composition-utils";

interface BodyCompositionFormProps {
  onCalculate: (values: BodyCompositionData) => void;
}

export function BodyCompositionForm({ onCalculate }: BodyCompositionFormProps) {
  const [unit, setUnit] = useState("metric");

  const form = useForm<BodyCompositionData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unit: "metric",
      weight: 80,
      height: 176,
      age: 25,
      gender: "male",
      waist: 81,
      hip: 101,
      neck: 42,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onCalculate)}
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
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
  );
}
