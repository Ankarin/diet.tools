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
    const { currentStep } = get();
    const newStep = currentStep + 1;

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
