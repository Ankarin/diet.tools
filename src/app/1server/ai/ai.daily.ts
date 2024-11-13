"use server";

import { singleDailyPlanSchema } from "@/app/1server/ai/ai.schema";
import { FormData } from "@/store";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

const model = openai("gpt-4o");

// Function to generate a single day meal plan
export const generateDailyMealPlan = async (formData: FormData) => {
  try {
    console.log("Form data for daily meal plan:", formData);
    const prompt = createDailyAIPrompt(formData);
    const { object } = await generateObject({
      model: model,
      schema: singleDailyPlanSchema,
      prompt,
      temperature: 0.5, // Adjusted for more creativity
    });

    // Validate the generated object against the schema
    const validationResult = singleDailyPlanSchema.safeParse(object);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error);
      throw new Error(
        "Generated daily meal plan does not match the expected format",
      );
    }

    console.log(
      "AI generated daily meal plan:",
      JSON.stringify(validationResult.data, null, 2),
    );
    return validationResult.data;
  } catch (error) {
    console.error("Error generating daily meal plan:", error);
    throw new Error(
      "Failed to generate daily meal plan. Please try again later.",
    );
  }
};

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
// Example usage
export const generateExampleDailyPlan = async () => {
  try {
    const example: FormData = {
      gender: "female",
      age: "30",
      unit: "metric",
      height: "165",
      heightFeet: "",
      heightInches: "",
      weight: "60",
      goals: "I want to maintain my weight and improve overall health",
      activity: "I work in an office but go to the gym 3 times a week",
      medicalConditions: "none",
      dietaryRestrictions: "lactose intolerant",
      foodPreferences: "I enjoy vegetables and lean proteins",
      dietaryApproach: "balanced",
      mealPreparation: "I prefer to meal prep on weekends",
    };
    console.log("Example form data for daily plan:", example);
    return await generateDailyMealPlan(example);
  } catch (error) {
    console.error("Error generating example daily plan:", error);
    throw new Error(
      "Failed to generate example daily plan. Please try again later.",
    );
  }
};
