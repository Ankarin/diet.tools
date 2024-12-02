import { singleDailyPlanSchema } from "@/app/api/gen-day/schema";
import { rateLimiter } from "@/lib/ratelimit";
import { FormData } from "@/store";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { NextRequest, NextResponse } from "next/server";

const model = openai("gpt-4o");

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
  console.log("IP:", ip);
  const { success } = await rateLimiter.limit(ip);
  if (!success) {
    console.log("Rate limit exceeded");
    return NextResponse.json(
      { error: "Usage limit exceeded, please try again in an hour." },
      { status: 429 }
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
      "Failed to generate daily meal plan. Please try again later."
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

Strict Instructions:
1. Use ONLY ${unitSystem} units throughout the entire meal plan and shopping list. DO NOT include any ${formData.unit === "metric" ? "imperial" : "metric"} units.
2. Follow the singleDailyPlanSchema exactly.
3. Include only breakfast, lunch, and dinner. No snacks or additional meals.
4. Distribute daily calories: Breakfast 30%, Lunch 40%, Dinner 30%.
5. Ensure the sum of calories from all meals equals the total daily calorie target in nutritionTargets.
6. Provide total calories and macronutrients (protein, carbs, fats) for each meal and food item.
7. Make meals practical and easy to prepare with commonly available ingredients.
8. Ensure balanced daily plans with variety.
9. Generate a comprehensive grocery list using the same ${unitSystem} units.

Nutritional Guidelines:
1. Prioritize whole, nutrient-dense foods.
2. Include a variety of fruits and vegetables to ensure micronutrient intake.
3. Balance protein sources throughout the day.
4. Include healthy fats in appropriate portions.
5. Recommend complex carbohydrates over simple sugars.
6. Suggest adequate fiber intake for digestive health.
7. Provide guidance on proper hydration throughout the day.

Meal Variety and Cultural Considerations:
1. Offer a diverse range of flavors, textures, and cooking methods.
2. Include meals from various cuisines to prevent monotony.
3. Respect and incorporate cultural food preferences when specified.
4. Suggest appropriate substitutions for traditional ingredients if needed.

Portion Sizes and Meal Timing:
1. Provide clear portion sizes for each ingredient in ${unitSystem} units.
2. Suggest optimal meal timing based on the client's activity level and goals.
3. Adjust portion sizes to meet daily calorie and macronutrient targets.

Allergies and Food Sensitivities:
1. Carefully avoid all ingredients related to listed allergies.
2. Suggest suitable alternatives for common allergens.
3. Provide guidance on reading labels and avoiding hidden allergens.

Seasonal Ingredients and Sustainability:
1. Recommend seasonal produce when possible for freshness and affordability.
2. Suggest sustainable protein sources and environmentally friendly food choices.
3. Provide tips on reducing food waste through proper storage and meal planning.

Meal Prep and Storage Tips:
1. Include suggestions for batch cooking and meal prepping to save time.
2. Provide guidance on proper food storage to maintain freshness and safety.
3. Offer tips on reheating meals without compromising taste or texture.

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

Example Format (using ${unitSystem} units):

\`\`\`json
{
  "day": "Monday",
  "totalCalories": 2500,
  "meals": {
    "breakfast": {
      "items": [
        {
          "food": "Oatmeal with Almonds and Berries",
          "portion": "${unitSystem === "metric" ? "60g oats, 15g almonds, 100g mixed berries" : "1/2 cup oats, 1 oz almonds, 1 cup mixed berries"}",
          "calories": 1000,
          "protein": 25,
          "carbs": 150,
          "fats": 30
        }
      ],
      "totalCalories": 1000
    },
    "lunch": {
      "items": [
        {
          "food": "Grilled Chicken Salad",
          "portion": "${unitSystem === "metric" ? "150g chicken, 200g mixed greens, 30ml vinaigrette" : "5 oz chicken, 4 cups mixed greens, 2 tbsp vinaigrette"}",
          "calories": 875,
          "protein": 45,
          "carbs": 60,
          "fats": 35
        }
      ],
      "totalCalories": 875
    },
    "dinner": {
      "items": [
        {
          "food": "Baked Salmon with Quinoa and Vegetables",
          "portion": "${unitSystem === "metric" ? "120g salmon, 50g dry quinoa, 150g mixed vegetables" : "4 oz salmon, 1/4 cup dry quinoa, 1.5 cups mixed vegetables"}",
          "calories": 625,
          "protein": 35,
          "carbs": 50,
          "fats": 20
        }
      ],
      "totalCalories": 625
    }
  }
}
\`\`\`

Ensure all calculations are accurate and maintain consistent use of ${unitSystem} units throughout the meal plan and shopping list. Do not include any ${formData.unit === "metric" ? "imperial" : "metric"} units in your response. Provide a brief explanation for your meal choices and how they align with the client's goals and preferences.`;
};
