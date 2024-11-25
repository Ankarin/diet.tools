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

  return `As a clinical nutritionist, create a highly personalized and detailed 1-day meal plan that strictly follows the provided singleDailyPlanSchema. Use ONLY ${unitSystem} units throughout the entire plan and shopping list.

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

Strict Instructions:
1. Use ONLY ${unitSystem} units throughout the entire meal plan and shopping list.
2. Create a daily meal plan following the singleDailyPlanSchema exactly.
3. Include breakfast, lunch, and dinner. No snacks or additional meals.
4. Distribute daily calories approximately: Breakfast 30%, Lunch 40%, Dinner 30%.
5. Ensure the sum of calories from all meals equals the total daily calorie target.
6. Provide total calories and macronutrients (protein, carbs, fats) for each meal and food item.
7. Make meals practical and easy to prepare with commonly available ingredients.
8. Generate a comprehensive grocery list categorized by food groups.

Personalization Guidelines:
1. Tailor meals to the client's specific goals (e.g., weight loss, muscle gain, maintenance).
2. Adjust portion sizes and macronutrient ratios based on the client's activity level.
3. Incorporate the client's food preferences and avoid restricted foods.
4. Consider the client's medical conditions and provide appropriate meal options.
5. Align with the specified dietary approach (e.g., Mediterranean, low-carb, plant-based).
6. Accommodate meal preparation preferences (e.g., meal prep, quick meals, cooking from scratch).
7. Ensure all meals are free from any listed allergies or food sensitivities.

Nutritional Guidelines:
1. Prioritize whole, nutrient-dense foods.
2. Include a variety of fruits and vegetables to ensure micronutrient intake.
3. Balance protein sources throughout the day.
4. Include healthy fats in appropriate portions.
5. Recommend complex carbohydrates over simple sugars.
6. Suggest adequate fiber intake for digestive health.
7. Provide guidance on proper hydration throughout the day.

${
  unitSystem === "metric"
    ? `
Metric Unit Guidelines:
- Use grams (g), kilograms (kg), milliliters (ml), liters (L)
- Examples: "100g chicken breast", "250ml milk", "1kg potatoes"
`
    : `
Imperial Unit Guidelines:
- Use ounces (oz), pounds (lbs), cups, tablespoons (tbsp), teaspoons (tsp)
- Examples: "4 oz chicken breast", "1 cup milk", "2 lbs potatoes"
`
}

Ensure all calculations are accurate and maintain consistent use of ${unitSystem} units throughout the meal plan and shopping list.

In the explanation field, provide:
1. A brief explanation of how the meal choices align with the client's goals and preferences.
2. Any special instructions or tips for meal preparation and storage.
3. Suggestions for adjusting portion sizes based on individual needs.

Remember to follow the singleDailyPlanSchema structure exactly, including all required fields such as day, date, specialInstructions (if any), totalCalories, meals (breakfast, lunch, dinner), nutritionTargets, shoppingList, and explanation.
`;
};
