import { create } from "zustand";
import { sendGAEvent } from "@next/third-parties/google";
// import supabase from "@/supabase/client";

export type FormData = {
	gender: "male" | "female" | "";
	age: string;
	unit: "metric" | "imperial" | "";
	height: string;
	heightFeet: string;
	heightInches: string;
	weight: string;
	goals: "lose" | "maintain" | "gain" | "";
	activity: "sedentary" | "light" | "moderate" | "very" | "extra" | "";
	medicalConditions: string;
	dietaryRestrictions: string;
	foodPreferences: string;
	dietaryApproach: string;
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
		/* Commenting out anonymous user and Supabase functionality
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user && step > 1) {
			const { data: { user: anonUser } } = await supabase.auth.signInAnonymously();
			if (anonUser) {
				// Fetch existing data for the anonymous user
				const { data } = await supabase
					.from('users')
					.select('*')
					.eq('id', anonUser.id)
					.single();
				
				if (data) {
					set({ formData: {
						gender: data.gender ?? "",
						age: data.age ?? "",
						unit: data.unit ?? "",
						height: data.height ?? "",
						heightFeet: data.heightFeet ?? "",
						heightInches: data.heightInches ?? "",
						weight: data.weight ?? "",
						goals: data.goals ?? "",
						activity: data.activity ?? "",
						medicalConditions: data.medicalConditions ?? "",
						dietaryRestrictions: data.dietaryRestrictions ?? "",
						foodPreferences: data.foodPreferences ?? "",
						dietaryApproach: data.dietaryApproach ?? "",
					}});
				}
			}
		} else if (user && step === 1) {
			// Fetch existing data when returning user starts from step 1
			const { data } = await supabase
				.from('users')
				.select('*')
				.eq('id', user.id)
				.single();
			
			if (data) {
				set({ formData: {
					gender: data.gender ?? "",
					age: data.age ?? "",
					unit: data.unit ?? "",
					height: data.height ?? "",
					heightFeet: data.heightFeet ?? "",
					heightInches: data.heightInches ?? "",
					weight: data.weight ?? "",
					goals: data.goals ?? "",
					activity: data.activity ?? "",
					medicalConditions: data.medicalConditions ?? "",
					dietaryRestrictions: data.dietaryRestrictions ?? "",
					foodPreferences: data.foodPreferences ?? "",
					dietaryApproach: data.dietaryApproach ?? "",
				}});
			}
		}
		*/
		sendGAEvent({
			event: "step_view",
			value: step,
		});
	},
	updateFormData: async (field, value) => {
		set((state) => ({
			formData: { ...state.formData, [field]: value },
		}));

		/* Commenting out Supabase save functionality
		// Save to Supabase after each update
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			const { error } = await supabase
				.from('users')
				.upsert({ 
					id: user.id,
					[field]: value,
				});
			if (error) console.error('Error saving to Supabase:', error);
		}
		*/
	},
	setFormData: async (data) => {
		set({ formData: data });

		/* Commenting out Supabase save functionality
		// Save complete form data to Supabase
		const { data: { user } } = await supabase.auth.getUser();
		if (user) {
			const { error } = await supabase
				.from('users')
				.upsert({ 
					id: user.id,
					...data,
				});
			if (error) console.error('Error saving to Supabase:', error);
		}
		*/
	},
}));
