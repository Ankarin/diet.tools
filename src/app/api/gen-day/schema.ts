import { z } from "zod";

// Define the meal item schema
const mealItemSchema = z.object({
	food: z.string(),
	portion: z.string(),
	calories: z.number(),
	protein: z.number(),
	carbs: z.number(),
	fats: z.number(),
});

// Define the meal schema
const mealSchema = z.object({
	items: z.array(mealItemSchema),
	totalCalories: z.number(),
});

// Define the shopping list item schema
const shoppingListItemSchema = z.object({
	name: z.string(),
	quantity: z.string(),
	category: z.string(),
});

// Define the shopping list schema
const shoppingListSchema = z.object({
	categories: z.array(
		z.object({
			name: z.string(),
			items: z.array(shoppingListItemSchema),
		}),
	),
});

const nutritionTargetsSchema = z.object({
	calories: z.number(),
	protein: z.string(),
	carbs: z.string(),
	fats: z.string(),
});

// Define the daily plan schema
const dailyPlanSchema = z.object({
	day: z.string(),
	date: z.string(),
	specialInstructions: z.string().optional(),
	totalCalories: z.number(),
	meals: z.object({
		breakfast: mealSchema,
		lunch: mealSchema,
		dinner: mealSchema,
	}),
	nutritionTargets: nutritionTargetsSchema,
});

const dayPlanSchema = z.object({
	day: z.string(),
	totalCalories: z.number(),
	meals: z.object({
		breakfast: mealSchema,
		lunch: mealSchema,
		dinner: mealSchema,
	}),
});

// Define the weekly plan schema
export const weeklyPlanSchema = z.object({
	dailyPlans: z.array(dayPlanSchema).min(7).max(7),
	explanation: z.string(),
	nutritionTargets: nutritionTargetsSchema,
	shoppingList: shoppingListSchema,
});

export const singleDailyPlanSchema = dailyPlanSchema.extend({
	shoppingList: shoppingListSchema,
	explanation: z.string(),
});

// Form data validation schema
export const formDataSchema = z
	.object({
		gender: z.enum(["male", "female"]),
		age: z.string(),
		unit: z.enum(["metric", "imperial"]),
		weight: z.string(),
		goals: z.enum(["lose", "maintain", "gain"]),
		activity: z.enum(["sedentary", "light", "moderate", "very", "extra"]),
		height: z.string().optional(),
		heightFeet: z.string().optional(),
		heightInches: z.string().optional(),
		medicalConditions: z.string().optional(),
		dietaryRestrictions: z.string().optional(),
		foodPreferences: z.string().optional(),
		dietaryApproach: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.unit === "metric") {
				return data.height != null;
			}
			if (data.unit === "imperial") {
				return data.heightFeet != null && data.heightInches != null;
			}
			return false;
		},
		{
			message: "Height fields are required based on the selected unit system",
		},
	);

export type WeeklyPlanData = z.infer<typeof weeklyPlanSchema>;
export type DailyPlanData = z.infer<typeof singleDailyPlanSchema>;
export type MealItem = z.infer<typeof mealItemSchema>;
export type Meal = z.infer<typeof mealSchema>;
export type ShoppingListItem = z.infer<typeof shoppingListItemSchema>;
export type ShoppingListCategory = z.infer<typeof shoppingListSchema>;
export type NutritionTargets = z.infer<typeof nutritionTargetsSchema>;
export type FormData = z.infer<typeof formDataSchema>;
