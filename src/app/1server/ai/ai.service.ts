"use server";
import { weeklyPlanSchema } from "@/app/1server/ai/ai.schema";
import { createAIPrompt } from "@/app/1server/ai/ai.utls";
import { FormData } from "@/store";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";

const model = openai("gpt-4o");

export const generateDietPlan = async (formData: FormData) => {
  try {
    console.log("Form data:", formData);
    const prompt = createAIPrompt(formData);
    const { object } = await generateObject({
      model: model,
      schema: weeklyPlanSchema,
      prompt,
      temperature: 0.7,
    });

    // Validate the generated object against the schema
    const validationResult = weeklyPlanSchema.safeParse(object);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error);
      throw new Error("Generated diet plan does not match the expected format");
    }

    console.log(
      "AI generated meal plan:",
      JSON.stringify(validationResult.data, null, 2),
    );
    return validationResult.data;
  } catch (error) {
    console.error("Error generating diet plan:", error);
    throw new Error("Failed to generate diet plan. Please try again later.");
  }
};

// Function to generate an example plan
export const generateExamplePlan = async () => {
  try {
    const example: FormData = {
      gender: "male",
      age: "25",
      unit: "metric",
      height: "176",
      heightFeet: "",
      heightInches: "",
      weight: "80",
      goals: "I want to lose 3 kilos",
      activity: "I sit at home most of the time but I train bjj 5 times a week",
      medicalConditions: "none",
      dietaryRestrictions: "none",
      foodPreferences: "I like meat and fish, don't like porridge",
      dietaryApproach: "any",
      mealPreparation: "I eat at home 2 times a day and eat out 1 time a day",
    };
    console.log("Example form data:", example);
    const prompt = createAIPrompt(example);
    console.log("Prompt:", prompt);
    const { object } = await generateObject({
      model: model,
      schema: weeklyPlanSchema,
      prompt,
      temperature: 0.7,
    });

    const validationResult = weeklyPlanSchema.safeParse(object);

    if (!validationResult.success) {
      console.error("Validation errors:", validationResult.error);
      throw new Error(
        "Generated example plan does not match the expected format",
      );
    }

    // Check for duplicate meals

    console.log(
      "AI generated example plan:",
      JSON.stringify(validationResult.data, null, 2),
    );
    return validationResult.data;
  } catch (error) {
    console.error("Error generating example plan:", error);
    throw new Error("Failed to generate example plan. Please try again later.");
  }
};
