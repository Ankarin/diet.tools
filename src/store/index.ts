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
  setCurrentStep: (step: number) => void;
  updateFormData: (field: keyof FormData, value: string | string[]) => void;
};

export const useFormStore = create<FormStore>((set) => ({
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
  setCurrentStep: (step) => set({ currentStep: step }),
  updateFormData: (field, value) =>
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    })),
}));
