import { create } from "zustand";
import { sendGAEvent } from "@next/third-parties/google";
import supabase from "@/supabase/client";

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
	initialFormData: FormData;
	goNextStep: () => void;
	setCurrentStep: (step: number) => void;
	updateFormData: (field: keyof FormData, value: string) => void;
	setFormData: (data: FormData) => void;
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
	initialFormData,
	goNextStep: async () => {
		const { currentStep } = get();
		const newStep = currentStep + 1;
		const maxSteps = 13;

		if (newStep <= maxSteps) {
			set({ currentStep: newStep });
			sendGAEvent({
				event: "step_complete",
				value: currentStep,
				next_step: newStep,
			});
			window.location.href = `/step/${newStep}`;
		}
	},
	setCurrentStep: async (step: number) => {
		set({ currentStep: step });
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user && step > 1) {
			const res = await supabase.auth.signInAnonymously();
			console.log("signup", res);
		}
		sendGAEvent({
			event: "step_view",
			value: step,
		});
	},
	updateFormData: (field, value) => {
		set((state) => ({
			formData: { ...state.formData, [field]: value },
		}));
	},
	setFormData: (data) => {
		set({ formData: data });
	},
}));
