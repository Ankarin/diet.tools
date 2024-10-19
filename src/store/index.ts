import supabase from "@/utils/supabase/client";
import { create } from "zustand";

type FormData = {
  gender: "male" | "female";
  age: string;
  unit: "metric" | "imperial";
  height: string;
  heightFeet: string;
  heightInches: string;
  weight: string;
  waist: string;
  hip: string;
  neck: string;
  activityLevel: string;
  dietaryRestrictions: string[];
  allergies: string;
  healthGoals: string;
  mealPreferences: string;
  cookingSkill: string;
};

type FormStore = {
  currentStep: number;
  formData: FormData;
  goNextStep: () => void;
  setCurrentStep: (step: number) => void;
  updateFormData: (field: keyof FormData, value: string | string[]) => void;
};

export const useFormStore = create<FormStore>((set, get) => ({
  currentStep: 1,
  formData: {
    gender: "" as "male" | "female",
    age: "",
    unit: "" as "metric" | "imperial",
    height: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    waist: "",
    hip: "",
    neck: "",
    activityLevel: "",
    dietaryRestrictions: [],
    allergies: "",
    healthGoals: "",
    mealPreferences: "",
    cookingSkill: "1",
  },
  goNextStep: async () => {
    const { currentStep, formData } = get();
    const newStep = currentStep + 1;

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no user, sign in anonymously
    if (!user) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Error signing in anonymously:", error);
        return;
      }
    }

    const copyData = {
      gender: formData.gender,
      age: formData.age,
      unit: formData.unit,
      height: formData.height,
      heightFeet: formData.heightFeet,
      heightInches: formData.heightInches,
      weight: formData.weight,
      waist: formData.waist,
      hip: formData.hip,
      neck: formData.neck,
    };

    // Update the user data in the users table
    const { error } = await supabase.from("users").upsert(
      {
        ...copyData,
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
  setCurrentStep: async (step: number) => {
    set({ currentStep: step });
    const { formData } = get();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no user, sign in anonymously
    if (!user) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error("Error signing in anonymously:", error);
        return;
      }
    }
    const copyData = {
      gender: formData.gender,
      age: formData.age,
      unit: formData.unit,
      height: formData.height,
      heightFeet: formData.heightFeet,
      heightInches: formData.heightInches,
      weight: formData.weight,
      waist: formData.waist,
      hip: formData.hip,
      neck: formData.neck,
    };
    // Update the user data in the users table
    const { error } = await supabase.from("users").upsert({
      ...copyData,
    });

    if (error) {
      console.error("Error updating user data:", error);
    }

    // Update the state
  },
  updateFormData: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }));
  },
}));
