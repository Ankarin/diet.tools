import { singleDailyPlanSchema } from "@/app/api/gen-day/schema";
import { FormData } from "@/store";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { NextRequest } from "next/server";

const model = openai("gpt-4o");

export async function POST(req: NextRequest) {
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

    console.log(result);
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating daily meal plan:", error);
    throw new Error(
      "Failed to generate daily meal plan. Please try again later.",
    );
  }
}

const createDailyAIPrompt = (formData: FormData) => {
  return `As a clinical nutritionist, please create a detailed 1-day meal plan that strictly follows the provided zod schema.

Client Details:
- Gender: ${formData.gender}
- Age: ${formData.age}
- Height: ${
    formData.unit === "metric"
      ? `${formData.height} cm`
      : `${formData.heightFeet}'${formData.heightInches}"`
  }
- Weight: ${formData.weight} ${formData.unit === "metric" ? "kg" : "lbs"}
- Goals: ${formData.goals}
- Activity Level: ${formData.activity}
${formData.medicalConditions ? `- Medical Conditions: ${formData.medicalConditions}` : ""}
${formData.dietaryRestrictions ? `- Dietary Restrictions: ${formData.dietaryRestrictions}` : ""}
${formData.foodPreferences ? `- Food Preferences: ${formData.foodPreferences}` : ""}
${formData.dietaryApproach ? `- Dietary Approach: ${formData.dietaryApproach}` : ""}
${formData.mealPreparation ? `- Meal Preparation Preferences: ${formData.mealPreparation}` : ""}

Additional Instructions:
- Ensure the meal plan is balanced and includes a variety of foods from all food groups.
- Follow current nutritional guidelines for daily intake of calories, macronutrients (proteins, fats, carbohydrates), and essential micronutrients.
- Make the meals practical and easy to prepare, using commonly available ingredients.
- Consider cultural and regional food preferences where applicable.
- Provide detailed nutritional information for each meal and the overall daily intake.
- The meal plan should be suitable for most people, promoting general health and well-being.
- Calories should be distributed evenly throughout the day, with appropriate portion sizes for each meal.
- Don't make calories intake too big or too small.

Please include breakfast, lunch, and dinner, with detailed descriptions and preparation methods for each meal.

Additionally, provide a shopping list with the following details, and make sure unit system is according to unit system selected by the user:
- Category: (e.g., Vegetables, Dairy, Meat)
- Item: (e.g., Carrots, Milk, Chicken)
- Quantity: (e.g., 2 kg, 500 ml, 3 pieces, 5 pounds)\`;
`;
};
