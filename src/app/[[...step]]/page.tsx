"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useFormStore } from "@/store";
import {
	GenderStep,
	AgeStep,
	MeasurementsStep,
	GoalsStep,
	DietaryRestrictionsStep,
	MedicalConditionsStep,
	ActivityStep,
	FoodPreferencesStep,
	DietaryApproachStep,
	ExamplePlanStep,
} from "../step-components";

export default function BodyCompositionCalculator() {
	const router = useRouter();
	const params = useParams();
	const { currentStep, setCurrentStep } = useFormStore();

	useEffect(() => {
		const stepFromPath = params.step?.[0];
		if (stepFromPath) {
			setCurrentStep(Number.parseInt(stepFromPath, 10));
		}
	}, [params.step, setCurrentStep]);

	useEffect(() => {
		router.replace(`/${currentStep}`, { scroll: false });
	}, [currentStep, router]);

	const steps = [
		<GenderStep key="gender" />,
		<AgeStep key="age" />,
		<MeasurementsStep key="measurements" />,
		<GoalsStep key="goals" />,
		<ActivityStep key="activity" />,
		<MedicalConditionsStep key="medicalConditions" />,
		<DietaryRestrictionsStep key="dietaryRestrictions" />,
		<FoodPreferencesStep key="foodPreferences" />,
		<DietaryApproachStep key="dietaryApproach" />,
		<ExamplePlanStep key="examplePlan" />,
	];

	return steps[currentStep - 1];
}
