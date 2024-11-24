import { weeklyPlanSchema } from "@/app/api/gen-day/schema";
import { rateLimiter } from "@/lib/ratelimit";
import { FormData } from "@/store";
import { createClient } from "@/supabase/server";
import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { NextRequest, NextResponse } from "next/server";

const model = openai("gpt-4o-mini");
// const model = anthropic("claude-3-5-sonnet-latest");

// Define a new schema that uses a single weeklyPlanSchema
const oneWeekPlanSchema = weeklyPlanSchema;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const session = await supabase.auth.getSession();
  if (!session.data?.session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { success } = await rateLimiter.limit(session.data.session.user.id);
  if (!success) {
    console.log("Rate limit exceeded");
    return NextResponse.json(
      { error: "Usage limit exceeded, please try later in an hour." },
      { status: 429 },
    );
  }

  try {
    const formData: FormData = await req.json();
    const prompt = createOneWeekAIPrompt(formData);
    const result = await streamObject({
      model: model,
      schema: oneWeekPlanSchema,
      prompt,
      temperature: 1,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Error generating one-week meal plan:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 },
      );
    }
  }
}

const createOneWeekAIPrompt = (formData: FormData) => {
  return `As a clinical nutritionist, please create a detailed 1-week meal plan that strictly follows the provided zod schema for weekly plans.

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
- Create a weekly meal plan following the \`weeklyPlanSchema\` exactly.
- **Include only breakfast, lunch, and dinner in the meal plan. Do not include snacks or additional meals.**
- **Distribute daily calories among meals as follows:**
  - **Breakfast:** 40% of total daily calories
  - **Lunch:** 35% of total daily calories
  - **Dinner:** 25% of total daily calories
- **Ensure the sum of calories from breakfast, lunch, and dinner equals the total daily calorie target defined in \`nutritionTargets\` without deviation. Any discrepancy renders the plan invalid.**
- **Provide total calories and macronutrient breakdown (protein, carbs, fats) for each meal and for each individual food item.**
- **Meals must collectively meet the daily \`nutritionTargets\` for calories and macronutrients.**
- Make the meals practical and easy to prepare, using commonly available ingredients.
- Ensure each daily plan is balanced and includes a variety of foods from all food groups.
- Consider cultural and regional food preferences where applicable.
- Use the unit system (metric or imperial) selected by the user consistently throughout the plan.
- Ensure variety across the week to prevent monotony.
- Generate a comprehensive grocery list for the week, categorized by food groups.
- **Adhere strictly to the \`weeklyPlanSchema\` structure. Any deviation from this schema will render the meal plan invalid.**
- Please create plans for **7 days**, starting on **Monday** and ending on **Sunday**.

**Example Format for One Day:**

\`\`\`
{
  "day": "Monday",
  "totalCalories": 2500,
  "meals": {
    "breakfast": {
      "items": [
        {
          "food": "Oatmeal with Almonds and Berries",
          "portion": "1 bowl",
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
          "portion": "1 large plate",
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
          "portion": "1 serving",
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

**Note:** In this example for a 2500-calorie diet:

- Breakfast is 40% (1000 calories)
- Lunch is 35% (875 calories)
- Dinner is 25% (625 calories)
- **Sum of Meal Calories:** 1000 + 875 + 625 = **2500 calories**, matching the total daily calories.

Please follow this format and ensure all calculations are accurate.

`;
};
