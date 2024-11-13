import supabase from "@/supabase/client";
import { create } from "zustand";

export type FormData = {
  gender: "male" | "female" | "";
  age: string;
  unit: "metric" | "imperial" | "";
  height: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  goals: string;
  activity: string;
  medicalConditions: string;
  dietaryRestrictions: string;
  foodPreferences: string;
  dietaryApproach: string;
  mealPreparation: string;
};

type FormStore = {
  currentStep: number;
  formData: FormData;
  goNextStep: () => void;
  setCurrentStep: (step: number) => void;
  updateFormData: (field: keyof FormData, value: string) => void;
};

const initialFormData: FormData = {
  gender: "male",
  age: "25",
  unit: "metric",
  height: "176",
  heightFeet: "",
  heightInches: "",
  weight: "80",
  goals: "Gain mussles",
  activity: "5 times per week bjj",
  medicalConditions: "",
  dietaryRestrictions: "",
  foodPreferences: "I like meat",
  dietaryApproach: "",
  mealPreparation: "at home mo",
};

export const useFormStore = create<FormStore>((set, get) => ({
  currentStep: 1,
  formData: initialFormData,
  goNextStep: async () => {
    const { currentStep, formData } = get();
    const newStep = currentStep + 1;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Error signing in anonymously:", error);
        return;
      }
    }

    const { error } = await supabase.from("users").upsert(
      {
        gender: formData.gender,
        age: formData.age,
        unit: formData.unit,
        height: formData.unit === "metric" ? formData.height : null,
        height_feet: formData.unit === "imperial" ? formData.heightFeet : null,
        height_inches:
          formData.unit === "imperial" ? formData.heightInches : null,
        weight: formData.weight,
        goals: formData.goals,
        activity: formData.activity,
        medical_conditions: formData.medicalConditions,
        dietary_restrictions: formData.dietaryRestrictions,
        food_preferences: formData.foodPreferences,
        dietary_approach: formData.dietaryApproach,
        meal_preparation: formData.mealPreparation,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    );

    if (error) {
      console.error("Error updating user data:", error);
    }

    set({ currentStep: newStep });
  },
  setCurrentStep: (step: number) => {
    set({ currentStep: step });
  },
  updateFormData: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }));
  },
}));
