"use client";

import { useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
	MealPreparationStep,
	DietaryApproachStep,
	ExamplePlanStep,
} from "./step-components";
import supabase from "@/supabase/client";

const ease = [0.16, 1, 0.3, 1];

function HeroTitles() {
	return (
		<div className="flex w-full max-w-3xl flex-col space-y-4 overflow-hidden pt-8">
			<motion.h1
				className="text-center text-2xl font-medium leading-tight text-foreground sm:text-5xl md:text-6xl"
				initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
				animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
				transition={{
					duration: 1,
					ease,
					staggerChildren: 0.2,
				}}
			>
				{["Ai ", "Diet ", "Planner"].map((text, index) => (
					<motion.span
						key={text}
						className="inline-block px-1 md:px-2 text-balance font-bold"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.8,
							delay: index * 0.2,
							ease,
						}}
					>
						{text}
					</motion.span>
				))}
			</motion.h1>
		</div>
	);
}

const stepperVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

function SearchParamsHandler() {
	const searchParams = useSearchParams();
	const { setCurrentStep } = useFormStore();

	useEffect(() => {
		const step = searchParams.get("step");
		if (step) {
			setCurrentStep(Number.parseInt(step, 10));
		}
	}, [searchParams, setCurrentStep]);

	return null;
}

export default function BodyCompositionCalculator() {
	const router = useRouter();
	const { currentStep, setFormData, formData, initialFormData } = useFormStore();

	const setData = useCallback(async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user) {
			const { data, error } = await supabase
				.from("users")
				.select("*")
				.eq("id", user.id)
				.single();
			if (error) {
				console.error("Error fetching user data:", error);
			} else if (data) {
				setFormData(data);
			}
		}
	}, [setFormData]);

	useEffect(() => {
		setData();
	}, [setData]);

	const saveData = useCallback(async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();
		
		if (user) {
			await supabase.from("users").upsert({
				id: user.id,
				...formData,
			});
		}
	}, [formData]);

	useEffect(() => {
		if (formData !== initialFormData) {
			saveData();
		}
	}, [formData, saveData, initialFormData]);

	useEffect(() => {
		router.replace(`?step=${currentStep}`, { scroll: false });
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
		<MealPreparationStep key="mealPreparation" />,
		<ExamplePlanStep key="examplePlan" />,
	];

	return (
		<div className="min-h-screen flex flex-col">
			<Suspense fallback={null}>
				<SearchParamsHandler />
			</Suspense>

			<main className="flex-grow flex items-center justify-center py-12 px-4">
				<div className="w-full max-w-3xl">
					<HeroTitles />
					<div className="mt-12">
						<AnimatePresence mode="wait">
							{steps[currentStep - 1]}
						</AnimatePresence>

						<motion.div
							className="mt-8"
							variants={stepperVariants}
							initial="hidden"
							animate="visible"
						>
							<p className="text-center text-sm text-muted-foreground mb-2">
								Step {currentStep} of {steps.length}
							</p>
							<div className="w-full bg-secondary rounded-full h-2">
								{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
								<div
									className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
									style={{ width: `${(currentStep / steps.length) * 100}%` }}
								></div>
							</div>
						</motion.div>
					</div>
				</div>
			</main>

			<footer className="mt-auto py-8 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
					<div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-6 md:px-0">
						<p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
							&copy; {new Date().getFullYear()} Ai Diet Planner. All rights
							reserved.
						</p>
					</div>

					<nav className="flex gap-4 sm:gap-6">
						<Link
							href="/terms"
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Terms
						</Link>
						<Link
							href="/privacy"
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Privacy
						</Link>
						<Link
							href="/contact"
							className="text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Contact
						</Link>
					</nav>
				</div>
			</footer>
		</div>
	);
}
