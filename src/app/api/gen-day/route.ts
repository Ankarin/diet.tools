import { singleDailyPlanSchema } from "@/app/api/gen-day/schema";
import { rateLimiter } from "@/lib/ratelimit";
import { FormData } from "@/store";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { NextRequest, NextResponse } from "next/server";

const model = openai("gpt-4o-mini");

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
  console.log("IP:", ip);
  const { success } = await rateLimiter.limit(ip);
  if (!success) {
    console.log("Rate limit exceeded");
    return NextResponse.json(
      { error: "Usage limit exceeded, please try again in an hour." },
      { status: 429 },
    );
  }
  try {
    const formData: FormData = await req.json();
    console.log(111, formData);
    const prompt = createDailyAIPrompt(formData);
    const result = await streamObject({
      model: model,
      schema: singleDailyPlanSchema,
      prompt,
      temperature: 1,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating daily meal plan:", error);
    throw new Error(
      "Failed to generate daily meal plan. Please try again later.",
    );
  }
}

const createDailyAIPrompt = (formData: FormData) => {
  const unitSystem = formData.unit === "metric" ? "metric" : "imperial";

  return `As a clinical nutritionist, create a highly personalized and detailed 1-day meal plan that MUST strictly follow the singleDailyPlanSchema structure. Use ONLY ${unitSystem} units throughout.

Client Details:
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
${formData.mealPreparation ? `- Meal Preparation Preferences: ${formData.mealPreparation}` : ""}

Required Schema Components (ALL MUST BE INCLUDED):
1. day (string): Current day of the week
2. date (string): Current date
3. totalCalories (number): Total daily calories
4. meals (object): MUST include all three meals:
   - breakfast: { items: Array<MealItem>, totalCalories: number }
   - lunch: { items: Array<MealItem>, totalCalories: number }
   - dinner: { items: Array<MealItem>, totalCalories: number }
5. nutritionTargets (object): MUST include:
   - calories (number)
   - protein (string with unit)
   - carbs (string with unit)
   - fats (string with unit)
6. shoppingList (object): MUST include:
   - categories: Array of { name: string, items: Array<{ name: string, quantity: string, category: string }> }
7. explanation (string): Detailed explanation of the meal plan

Each Meal Item MUST Include:
- food (string): Name of the food
- portion (string): Exact portion size in ${unitSystem} units
- calories (number): Calories per portion
- protein (number): Protein content in grams
- carbs (number): Carbohydrate content in grams
- fats (number): Fat content in grams

Strict Requirements:
1. ALL components listed above MUST be included and properly formatted
2. Use ONLY ${unitSystem} units consistently
3. Each meal MUST have at least 2 food items
4. Shopping list MUST be categorized (e.g., Proteins, Vegetables, etc.)
5. Calories MUST be realistic and match the client's goals
6. ALL numerical values MUST be reasonable and mathematically consistent
7. Each meal's totalCalories MUST equal the sum of its items' calories
8. Daily totalCalories MUST equal the sum of all meals' totalCalories

Distribution Guidelines:
- Breakfast: ~30% of total calories
- Lunch: ~40% of total calories
- Dinner: ~30% of total calories

The response MUST be a valid JSON object matching the singleDailyPlanSchema structure. Each required field MUST be present and properly formatted.`;
};
