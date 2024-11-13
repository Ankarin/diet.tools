import { FormData } from "@/store";

export const createAIPrompt = (formData: FormData) => {
  return `As a clinical nutritionist, create a structured 1 week meal plan that strictly follows zod schema I provided:

Consider these client details:
- Gender: ${formData.gender}
- Age: ${formData.age}
- Height: ${formData.unit === "metric" ? formData.height + " cm" : formData.heightFeet + "'" + formData.heightInches + '"'}
- Weight: ${formData.weight} ${formData.unit === "metric" ? "kg" : "lbs"}
- Goals: ${formData.goals}
- Activity: ${formData.activity}
${formData.medicalConditions ? `- Medical Conditions: ${formData.medicalConditions}` : ""}
${formData.dietaryRestrictions ? `- Dietary Restrictions: ${formData.dietaryRestrictions}` : ""}
${formData.foodPreferences ? `- Food Preferences: ${formData.foodPreferences}` : ""}
${formData.dietaryApproach ? `- Dietary Approach: ${formData.dietaryApproach}` : ""}
${formData.mealPreparation ? `- Meal Preparation: ${formData.mealPreparation}` : ""}
`;
};
