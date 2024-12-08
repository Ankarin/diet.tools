import { rateLimiter } from "@/lib/ratelimit";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { formDataSchema, singleDailyPlanSchema } from "./schema";
import type { FormData } from "./schema";

const model = openai("gpt-4o");

export async function POST(req: NextRequest) {
	try {
		// Rate limiting
		const ip = (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
		const { success } = await rateLimiter.limit(ip);
		if (!success) {
			return NextResponse.json(
				{ error: "Usage limit exceeded, please try again in an hour." },
				{ status: 429 },
			);
		}

		// Parse and validate form data
		const rawData = await req.json();
		const result = formDataSchema.safeParse(rawData);

		if (!result.success) {
			return NextResponse.json(
				{
					error: "Invalid form data provided.",
					details: result.error.format(),
				},
				{ status: 400 },
			);
		}

		const formData = result.data;

		// Calculate BMR and daily calorie needs
		const { bmr, dailyCalories, nutritionTargets } = calculateNutritionNeeds(formData);

		// Generate AI prompt with calculated values
		const prompt = createDailyAIPrompt(formData, bmr, dailyCalories, nutritionTargets);

		// Stream the response
		const response = await streamObject({
			model: model,
			schema: singleDailyPlanSchema,
			prompt,
			temperature: 1,
		});

		return response.toTextStreamResponse();
	} catch (error) {
		console.error("Error generating daily meal plan:", error);
		return NextResponse.json(
			{ error: "Failed to generate meal plan. Please try again." },
			{ status: 500 },
		);
	}
}

function calculateNutritionNeeds(data: FormData): {
	bmr: number;
	dailyCalories: number;
	nutritionTargets: { calories: number; protein: string; carbs: string; fats: string };
} {
	// Convert imperial to metric if needed
	const weightInKg =
		data.unit === "imperial"
			? Math.round(Number.parseFloat(data.weight) * 0.453592)
			: Math.round(Number.parseFloat(data.weight));
	const heightInCm =
		data.unit === "imperial"
			? Math.round(
					Number.parseFloat(data.heightFeet) * 30.48 + Number.parseFloat(data.heightInches) * 2.54,
				)
			: Math.round(Number.parseFloat(data.height));
	const ageInYears = Math.round(Number.parseFloat(data.age));

	// Calculate BMR using Mifflin-St Jeor Equation
	let basalMetabolicRate = Math.round(10 * weightInKg + 6.25 * heightInCm - 5 * ageInYears);
	basalMetabolicRate += data.gender === "male" ? 5 : -161;
	basalMetabolicRate = Math.round(basalMetabolicRate);

	// Calculate daily calories based on activity level
	const activityMultipliers = {
		sedentary: 1.2,
		light: 1.375,
		moderate: 1.55,
		very: 1.725,
		extra: 1.9,
	};

	let dailyCaloricNeeds = Math.round(basalMetabolicRate * activityMultipliers[data.activity]);

	// Adjust calories based on goals
	switch (data.goals) {
		case "lose":
			dailyCaloricNeeds = Math.round(dailyCaloricNeeds * 0.8); // 20% deficit
			break;
		case "gain":
			dailyCaloricNeeds = Math.round(dailyCaloricNeeds * 1.1); // 10% surplus
			break;
		default:
			// maintain weight, no adjustment needed
			break;
	}

	// Calculate macronutrient targets
	const PROTEIN_RATIO = 0.3; // 30% of calories
	const CARB_RATIO = 0.4; // 40% of calories
	const FAT_RATIO = 0.3; // 30% of calories

	const proteinCalories = Math.round(dailyCaloricNeeds * PROTEIN_RATIO);
	const carbCalories = Math.round(dailyCaloricNeeds * CARB_RATIO);
	const fatCalories = Math.round(dailyCaloricNeeds * FAT_RATIO);

	const proteinGrams = Math.round(proteinCalories / 4);
	const carbGrams = Math.round(carbCalories / 4);
	const fatGrams = Math.round(fatCalories / 9);

	return {
		bmr: Math.round(basalMetabolicRate),
		dailyCalories: dailyCaloricNeeds,
		nutritionTargets: {
			calories: dailyCaloricNeeds,
			protein: `${proteinGrams}g`,
			carbs: `${carbGrams}g`,
			fats: `${fatGrams}g`,
		},
	};
}

const createDailyAIPrompt = (
	formData: FormData,
	bmr: number,
	dailyCalories: number,
	nutritionTargets: { calories: number; protein: string; carbs: string; fats: string },
) => {
	const unitSystem = formData.unit === "metric" ? "metric" : "imperial";

	return `As a clinical nutritionist, create a personalized 1-day meal plan following these specifications:

CALCULATED NUTRITIONAL TARGETS:
- BMR: ${bmr} calories/day
- Daily Calorie Target: ${dailyCalories} calories/day
- Meal Distribution:
  * Breakfast: ${Math.round(dailyCalories * 0.3)} calories (30%)
  * Lunch: ${Math.round(dailyCalories * 0.4)} calories (40%)
  * Dinner: ${Math.round(dailyCalories * 0.3)} calories (30%)

CLIENT PROFILE:
- Gender: ${formData.gender}
- Age: ${formData.age}
- Height: ${formData.unit === "metric" ? `${formData.height} cm` : `${formData.heightFeet}'${formData.heightInches}"`}
- Weight: ${formData.weight} ${formData.unit === "metric" ? "kg" : "lbs"}
- Goals: ${formData.goals}
- Activity Level: ${formData.activity}
${formData.medicalConditions ? `- Medical Conditions: ${formData.medicalConditions}` : ""}
${formData.dietaryRestrictions ? `- Dietary Restrictions: ${formData.dietaryRestrictions}` : ""}
${formData.foodPreferences ? `- Food Preferences: ${formData.foodPreferences}` : ""}
${formData.dietaryApproach ? `- Dietary Approach: ${formData.dietaryApproach}` : ""}

MACRONUTRIENT DISTRIBUTION:
- Protein: ${nutritionTargets.protein} (${Math.round((dailyCalories * 0.3) / 4)} calories)
- Carbs: ${nutritionTargets.carbs} (${Math.round((dailyCalories * 0.4) / 4)} calories)
- Fats: ${nutritionTargets.fats} (${Math.round((dailyCalories * 0.3) / 9)} calories)

REQUIREMENTS:
1. Use ONLY ${unitSystem} units
2. Each meal must include:
   - Detailed food names
   - Exact portions in ${unitSystem} units
   - Calories and macros (protein, carbs, fats)
3. Ensure meal totals match the calculated targets
4. Focus on whole, nutrient-dense foods
5. Account for all dietary restrictions and preferences
6. Include practical, easy-to-prepare meals

MEAL STRUCTURE:
Each meal should have:
- A protein source
- Complex carbohydrates
- Healthy fats
- Vegetables and/or fruits
- Appropriate portions to meet calorie targets

${
	unitSystem === "metric"
		? `Use metric units: grams (g), milliliters (ml)
Example: "100g chicken breast, 150g brown rice"`
		: `Use imperial units: ounces (oz), cups, tablespoons (tbsp)
Example: "4 oz chicken breast, 3/4 cup brown rice"`
}

Provide the meal plan in this exact JSON structure:
{
  "day": "Monday",
  "totalCalories": ${dailyCalories},
  "meals": {
    "breakfast": {
      "items": [
        {
          "food": "Food name",
          "portion": "Exact portion in ${unitSystem} units",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number
        }
      ],
      "totalCalories": number
    },
    "lunch": { ... },
    "dinner": { ... }
  }
}`;
};
