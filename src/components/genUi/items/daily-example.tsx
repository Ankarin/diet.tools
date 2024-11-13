"use client";

import { singleDailyPlanSchema } from "@/app/1server/ai/ai.schema";
import { useFormStore } from "@/store";
import { experimental_useObject as useObject } from "ai/react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealCard } from "./meal-card";
import { ShoppingListCard } from "./shopping-list-card";
import { InfoCard } from "./info-card";

type DailyPlanData = z.infer<typeof singleDailyPlanSchema>;

export default function DailyExample() {
  const {
    object: mealPlan,
    isLoading,
    error,
    submit,
  } = useObject<DailyPlanData>({
    api: "/api/gen-day",
    schema: singleDailyPlanSchema,
  });
  const { formData } = useFormStore();
  const handleGenerate = () => submit(formData);


  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {!isLoading && !mealPlan ? (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mb-6 text-lg py-6 px-8 w-full "
        >
          Generate
        </Button>
      ) : !isLoading && mealPlan ? (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mb-6 text-lg py-6 px-8 w-full "
        >
          Get plan for 2 weeks
        </Button>
      ) : null}
      {error && (
        <Card className="mb-6 bg-red-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-red-600">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {(mealPlan || isLoading) && (
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-primary/10 py-4">
              <CardTitle className="text-2xl font-bold">
                Your meal plan for the day
              </CardTitle>
              <CardDescription className="text-xl">
                Calories: {mealPlan?.calories || "Calculating..."}
              </CardDescription>
            </CardHeader>
          </Card>

          {mealPlan?.shoppingList?.categories &&
            mealPlan.shoppingList.categories.length > 0 && (
                 // @ts-ignore
              <ShoppingListCard categories={mealPlan.shoppingList.categories} />
            )}

          {mealPlan?.meals &&
            Object.entries(mealPlan.meals).map(([mealName, meal]) => (
              <MealCard
                key={mealName}
                mealName={mealName}
                     // @ts-ignore
                items={meal.items || []}
              />
            ))}

          {mealPlan?.explanation && (
            <InfoCard title="Explanation" content={mealPlan.explanation} />
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center mt-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}
      <br />
      {!isLoading && mealPlan && (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          className="mb-6 text-lg py-6 px-8 w-full "
        >
          Get plan for 2 weeks
        </Button>
      )}
    </div>
  );
}
