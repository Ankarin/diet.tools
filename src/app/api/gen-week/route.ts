import { weeklyPlanSchema } from "@/app/api/gen-day/schema";
import { rateLimiter } from "@/lib/ratelimit";
import { FormData } from "@/store";
import { createClient } from "@/supabase/server";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { NextResponse } from "next/server";

const model = openai("gpt-4o");
// const model = anthropic("claude-3-5-sonnet-latest");

// Define a new schema that uses a single weeklyPlanSchema
const oneWeekPlanSchema = weeklyPlanSchema;

function calculateNutritionNeeds(data: FormData): {
	bmr: number;
	dailyCalories: number;
	nutritionTargets: { calories: number; protein: string; carbs: string; fats: string };
} {
	// Convert imperial to metric if needed
	const weightInKg =
		data.unit === "imperial"
			? Number.parseFloat(data.weight) * 0.453592
			: Number.parseFloat(data.weight);
	const heightInCm =
		data.unit === "imperial"
			? Number.parseFloat(data.heightFeet) * 30.48 + Number.parseFloat(data.heightInches) * 2.54
			: Number.parseFloat(data.height);
	const ageInYears = Number.parseFloat(data.age);

	// Calculate BMR using Mifflin-St Jeor Equation
	let basalMetabolicRate = 10 * weightInKg + 6.25 * heightInCm - 5 * ageInYears;
	basalMetabolicRate += data.gender === "male" ? 5 : -161;

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

	const proteinCalories = dailyCaloricNeeds * PROTEIN_RATIO;
	const carbCalories = dailyCaloricNeeds * CARB_RATIO;
	const fatCalories = dailyCaloricNeeds * FAT_RATIO;

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

export async function POST() {
	try {
		const supabase = await createClient();
		const session = await supabase.auth.getSession();
		if (!session.data?.session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Rate limiting
		const { success } = await rateLimiter.limit(session.data.session.user.id);
		if (!success) {
			return NextResponse.json(
				{ error: "Usage limit exceeded, please try again in an hour." },
				{ status: 429 },
			);
		}

		// Get user data
		const userData = await supabase
			.from("users")
			.select()
			.eq("id", session.data.session.user.id)
			.single();

		if (!userData.data) {
			return NextResponse.json({ error: "User data not found" }, { status: 404 });
		}

		// Calculate nutrition needs
		const { bmr, dailyCalories, nutritionTargets } = calculateNutritionNeeds(userData.data);

		// Generate AI prompt with calculated values
		const prompt = createOneWeekAIPrompt(userData.data, bmr, dailyCalories, nutritionTargets);

		// Stream the response
		const response = await streamObject({
			model: model,
			schema: oneWeekPlanSchema,
			prompt,
			temperature: 1,
		});

		return response.toTextStreamResponse();
	} catch (error) {
		console.error(999, "Error generating weekly meal plan:", error);
		if (error instanceof Error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		return NextResponse.json(
			{ error: "Failed to generate meal plan. Please try again." },
			{ status: 500 },
		);
	}
}

const createOneWeekAIPrompt = (
	formData: FormData,
	bmr: number,
	dailyCalories: number,
	nutritionTargets: { calories: number; protein: string; carbs: string; fats: string },
) => {
	const unitSystem = formData.unit === "metric" ? "metric" : "imperial";

	return `As a clinical nutritionist, create a highly personalized and detailed 1-week meal plan following these specifications:

CALCULATED NUTRITIONAL TARGETS:
- BMR: ${bmr} calories/day
- Daily Calorie Target: ${dailyCalories} calories/day
- Daily Meal Distribution:
  * Breakfast: ${Math.round(dailyCalories * 0.3)} calories (30%)
  * Lunch: ${Math.round(dailyCalories * 0.4)} calories (40%)
  * Dinner: ${Math.round(dailyCalories * 0.3)} calories (30%)

MACRONUTRIENT DISTRIBUTION:
- Protein: ${nutritionTargets.protein} (${Math.round((dailyCalories * 0.3) / 4)} calories)
- Carbs: ${nutritionTargets.carbs} (${Math.round((dailyCalories * 0.4) / 4)} calories)
- Fats: ${nutritionTargets.fats} (${Math.round((dailyCalories * 0.3) / 9)} calories)

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

SCHEMA REQUIREMENTS:
1. Each day MUST have exactly three meals: breakfast, lunch, and dinner
2. Each meal MUST include:
   - An array of food items with:
     * food name (string)
     * portion in ${unitSystem} units (string)
     * calories (number)
     * protein (number)
     * carbs (number)
     * fats (number)
   - totalCalories (number) for the meal

3. Each day MUST follow this exact structure:
{
  "day": "Monday", // (or other day)
  "totalCalories": ${dailyCalories},
  "meals": {
    "breakfast": {
      "items": [
        {
          "food": "Food Name",
          "portion": "Portion in ${unitSystem}",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number
        }
      ],
      "totalCalories": ${Math.round(dailyCalories * 0.3)}
    },
    "lunch": {
      "items": [...],
      "totalCalories": ${Math.round(dailyCalories * 0.4)}
    },
    "dinner": {
      "items": [...],
      "totalCalories": ${Math.round(dailyCalories * 0.3)}
    }
  }
}

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

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 7 days (Monday through Sunday)
2. Include ALL three meals for EACH day
3. Include totalCalories for EACH meal
4. Ensure meal calories sum up to daily target
5. Use ONLY ${unitSystem} units
6. Include a shopping list with categorized items
7. Provide a brief explanation of the meal plan

Please provide the complete 7-day meal plan following the weeklyPlanSchema exactly.`;
};
