import { create } from "zustand";
import { sendGAEvent } from '@next/third-parties/google';

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
  gender: "",
  age: "",
  unit: "",
  height: "",
  heightFeet: "",
  heightInches: "",
  weight: "",
  goals: "",
  activity: "",
  medicalConditions: "",
  dietaryRestrictions: "",
  foodPreferences: "",
  dietaryApproach: "",
  mealPreparation: "",
};

export const useFormStore = create<FormStore>((set, get) => ({
  currentStep: 1,
  formData: initialFormData,
  goNextStep: async () => {
    const { currentStep } = get();
    const newStep = currentStep + 1;
    const maxSteps = 13;

    if (newStep <= maxSteps) {
      set({ currentStep: newStep });
      sendGAEvent({ 
        event: 'step_complete',
        value: currentStep,
        next_step: newStep
      });
      window.location.href = `/step/${newStep}`;
    }
  },
  setCurrentStep: (step: number) => {
    set({ currentStep: step });
    sendGAEvent({ 
      event: 'step_view',
      value: step
    });
  },
  updateFormData: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
    }));
  },
}));
