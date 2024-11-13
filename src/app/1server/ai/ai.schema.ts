import { z } from "zod";

// Define the meal schema
export const mealSchema = z.object({
  items: z.array(
    z.object({
      food: z.string(),
      portion: z.string(),
      calories: z.number(),
    }),
  ),
});

export const shoppingListSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      items: z.array(
        z.object({
          name: z.string(),
          quantity: z.string(),
        }),
      ),
    }),
  ),
});

export const singleDailyPlanSchema = z.object({
  shoppingList: shoppingListSchema,
  calories: z.number(),
  explanation: z.string(),
  meals: z.object({
    breakfast: mealSchema,
    lunch: mealSchema,
    dinner: mealSchema,
  }),
});

// Define the daily plan schema
export const dailyPlanSchema = z.object({
  day: z.string(),
  date: z.string(),
  isSpecialDay: z.boolean(),
  specialInstructions: z.string().default(""), // Provide a default value
  meals: z.object({
    breakfast: mealSchema,
    lunch: mealSchema,
    dinner: mealSchema,
  }),
});

// Define the weekly plan schema
export const weeklyPlanSchema = z.object({
  weekNumber: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  dailyPlans: z.array(dailyPlanSchema),
  nutritionTargets: z.object({
    dailyCalories: z.number(),
    protein: z.string(),
    carbs: z.string(),
    fats: z.string(),
  }),
  groceryList: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    }),
  ),
});
