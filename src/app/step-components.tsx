import DailyExample from "@/components/genUi/example/daily-example";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardHeader } from "@/components/ui/card";
import { CheckIcon } from "@radix-ui/react-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import RainbowButton from "@/components/ui/rainbow-button";
import { useFormStore } from "@/store";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const stepVariants = {
	hidden: { opacity: 0, x: 50 },
	visible: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -50 },
};

interface StepProps {
	title: string;
	// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
	children: React.ReactNode;
}

function Step({ title, children }: StepProps) {
	const { currentStep, setCurrentStep } = useFormStore();

	return (
		<motion.div
			variants={stepVariants}
			initial="hidden"
			animate="visible"
			exit="exit"
			transition={{ duration: 0.5 }}
			className="w-full max-w-2xl mx-auto"
		>
			<div className="flex items-center mb-6">
				{currentStep > 1 && (
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setCurrentStep(currentStep - 1)}
						className="mr-4 text-primary hover:text-primary/80"
					>
						<ArrowLeft className="h-6 w-6" />
						<span className="sr-only">Go back</span>
					</Button>
				)}
				<p className="text-xl sm:text-2xl font-bold text-left  sm:text-center flex-grow">{title}</p>
			</div>
			{children}
		</motion.div>
	);
}

export function GenderStep() {
	const { updateFormData, setCurrentStep } = useFormStore();

	// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
	const handleGenderSelection = (gender: string) => async (e: React.MouseEvent) => {
		e.preventDefault();
		updateFormData("gender", gender);
		setCurrentStep(2);
	};

	return (
		<Step title="What is your gender?">
			<div className="flex justify-center space-x-4">
				<RainbowButton
					colorScheme="black"
					className="shadow-2xl"
					onClick={handleGenderSelection("male")}
				>
					Male
				</RainbowButton>
				<RainbowButton
					colorScheme="white"
					className="shadow-2xl"
					onClick={handleGenderSelection("female")}
				>
					Female
				</RainbowButton>
			</div>
		</Step>
	);
}

const ageSchema = z.object({
	age: z
		.string()
		.regex(/^\d+$/, "Please enter a valid number")
		.refine((val) => {
			const num = Number.parseInt(val, 10);
			return num > 0 && num <= 150;
		}, "Age must be between 1 and 150"),
});

export function AgeStep() {
	const { formData, updateFormData, setCurrentStep } = useFormStore();

	const form = useForm<z.infer<typeof ageSchema>>({
		resolver: zodResolver(ageSchema),
		defaultValues: {
			age: formData.age || "",
		},
	});

	useEffect(() => {
		if (formData.age) {
			form.setValue("age", formData.age.toString());
		}
	}, [formData.age, form]);

	function onSubmit(values: z.infer<typeof ageSchema>) {
		updateFormData("age", values.age);
		setCurrentStep(3);
	}

	return (
		<Step title="How old are you?">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="age"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Input
										{...field}
										type="number"
										placeholder="Enter your age"
										className="text-center text-lg"
										autoFocus
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<RainbowButton type="submit" className="w-full" disabled={!form.formState.isValid}>
						Next
					</RainbowButton>
				</form>
			</Form>
		</Step>
	);
}

const metricHeightSchema = z.object({
	height: z.string().refine(
		(val) => {
			const num = Number.parseInt(val, 10);
			return !Number.isNaN(num) && num > 50 && num <= 300;
		},
		{ message: "Height must be between 50 and 300 cm" },
	),
});

const imperialHeightSchema = z.object({
	heightFeet: z.string().refine(
		(val) => {
			const num = Number.parseInt(val, 10);
			return !Number.isNaN(num) && num > 0 && num <= 9;
		},
		{ message: "Feet must be between 1 and 9" },
	),
	heightInches: z.string().refine(
		(val) => {
			const num = Number.parseInt(val, 10);
			return !Number.isNaN(num) && num >= 0 && num < 12;
		},
		{ message: "Inches must be between 0 and 11" },
	),
});

const createWeightSchema = (isMetric: boolean) =>
	z.object({
		weight: z.string().refine(
			(val) => {
				const num = Number.parseFloat(val);
				const minWeight = isMetric ? 20 : 44;
				const maxWeight = isMetric ? 500 : 1100;
				return !Number.isNaN(num) && num >= minWeight && num <= maxWeight;
			},
			{
				message: `Weight must be between ${isMetric ? "20 and 500 kg" : "44 and 1100 lbs"}`,
			},
		),
	});

export function MeasurementsStep() {
	const { formData, updateFormData, setCurrentStep } = useFormStore();
	const [unit, setUnit] = useState<"metric" | "imperial">("metric");

	useEffect(() => {
		// Set metric as default unit in form data when component mounts
		if (!formData.unit) {
			updateFormData("unit", "metric");
		} else {
			setUnit(formData.unit);
		}
	}, [formData.unit, updateFormData]);

	const metricHeightForm = useForm<z.infer<typeof metricHeightSchema>>({
		resolver: zodResolver(metricHeightSchema),
		defaultValues: { height: formData.height || "" },
	});

	const imperialHeightForm = useForm<z.infer<typeof imperialHeightSchema>>({
		resolver: zodResolver(imperialHeightSchema),
		defaultValues: {
			heightFeet: formData.heightFeet || "",
			heightInches: formData.heightInches || "",
		},
	});

	const weightSchema = createWeightSchema(unit === "metric");
	const weightForm = useForm<z.infer<typeof weightSchema>>({
		resolver: zodResolver(weightSchema),
		defaultValues: {
			weight: formData.weight || "",
		},
	});

	useEffect(() => {
		// Trigger validation for the forms when component mounts with preloaded data
		if (unit === "metric") {
			if (formData.height) metricHeightForm.trigger();
			if (formData.weight) weightForm.trigger();
		} else {
			if (formData.heightFeet || formData.heightInches) imperialHeightForm.trigger();
			if (formData.weight) weightForm.trigger();
		}
	}, [formData, unit, metricHeightForm, imperialHeightForm, weightForm]);

	const handleUnitSelection = (selectedUnit: "metric" | "imperial") => {
		setUnit(selectedUnit);
		updateFormData("unit", selectedUnit);
		// Reset forms when changing units
		if (selectedUnit === "metric") {
			metricHeightForm.reset();
			weightForm.reset();
		} else {
			imperialHeightForm.reset();
			weightForm.reset();
		}
	};

	const handleSubmit = () => {
		if (unit === "metric") {
			const heightData = metricHeightForm.getValues();
			updateFormData("height", heightData.height);
		} else {
			const heightData = imperialHeightForm.getValues();
			updateFormData("heightFeet", heightData.heightFeet);
			updateFormData("heightInches", heightData.heightInches);
		}
		const weightData = weightForm.getValues();
		updateFormData("weight", weightData.weight);
		setCurrentStep(4);
	};

	const isValid = () => {
		if (unit === "metric") {
			return metricHeightForm.formState.isValid && weightForm.formState.isValid;
		}
		return imperialHeightForm.formState.isValid && weightForm.formState.isValid;
	};

	return (
		<Step title="Your Measurements">
			<div className="space-y-6">
				<div className="flex justify-center space-x-4">
					<RainbowButton
						colorScheme={unit === "metric" ? "black" : "white"}
						onClick={() => handleUnitSelection("metric")}
					>
						Metric
					</RainbowButton>
					<RainbowButton
						colorScheme={unit === "imperial" ? "black" : "white"}
						onClick={() => handleUnitSelection("imperial")}
					>
						Imperial
					</RainbowButton>
				</div>

				<div className="space-y-2">
					<h3 className="text-lg font-medium">Height</h3>
					{unit === "metric" ? (
						<Form {...metricHeightForm}>
							<FormField
								control={metricHeightForm.control}
								name="height"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												{...field}
												type="number"
												placeholder="Enter your height in cm"
												className="text-center text-lg"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</Form>
					) : (
						<Form {...imperialHeightForm}>
							<div className="flex space-x-2">
								<FormField
									control={imperialHeightForm.control}
									name="heightFeet"
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="Feet"
													className="text-center text-lg"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={imperialHeightForm.control}
									name="heightInches"
									render={({ field }) => (
										<FormItem className="flex-1">
											<FormControl>
												<Input
													{...field}
													type="number"
													placeholder="Inches"
													className="text-center text-lg"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</Form>
					)}
				</div>

				<div className="space-y-2">
					<h3 className="text-lg font-medium">Weight</h3>
					<Form {...weightForm}>
						<FormField
							control={weightForm.control}
							name="weight"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											{...field}
											type="number"
											placeholder={`Enter your weight in ${unit === "metric" ? "kg" : "lbs"}`}
											className="text-center text-lg"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</Form>
				</div>

				<RainbowButton onClick={handleSubmit} className="w-full" disabled={!isValid()}>
					Next
				</RainbowButton>
			</div>
		</Step>
	);
}

const activitySchema = z.object({
	activity: z.enum(["sedentary", "light", "moderate", "very", "extra"]),
});

export function ActivityStep() {
	const { formData, updateFormData, setCurrentStep } = useFormStore();

	const activities = [
		{
			value: "sedentary",
			label: "Sedentary",
			description: "Desk job and little to no exercise (e.g., office work with minimal movement)",
		},
		{
			value: "light",
			label: "Lightly Active",
			description: "Light exercise 1-3 days/week or active job with lots of walking",
		},
		{
			value: "moderate",
			label: "Moderately Active",
			description: "Moderate exercise 3-5 days/week or physically demanding job",
		},
		{
			value: "very",
			label: "Very Active",
			description: "Hard exercise 6-7 days/week or athletic job with daily training",
		},
		{
			value: "extra",
			label: "Extremely Active",
			description: "Professional athlete level or extremely physical job with additional training",
		},
	];

	const form = useForm<z.infer<typeof activitySchema>>({
		resolver: zodResolver(activitySchema),
		defaultValues: {
			activity:
				formData.activity &&
				["sedentary", "light", "moderate", "very", "extra"].includes(formData.activity)
					? formData.activity
					: "moderate",
		},
	});

	function onSubmit(values: z.infer<typeof activitySchema>) {
		updateFormData("activity", values.activity);
		setCurrentStep(6);
	}

	return (
		<Step title="What's your typical activity level?">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="activity"
						render={({ field }) => (
							<FormItem className="space-y-4">
								<FormControl>
									<div className="grid grid-cols-1 gap-4">
										{activities.map((activity) => (
											<Card
												key={activity.value}
												className={cn(
													"cursor-pointer border transition-all hover:bg-accent",
													field.value === activity.value && "border-primary bg-accent",
												)}
												onClick={() => field.onChange(activity.value)}
											>
												<CardHeader>
													<div className="flex items-center justify-between">
														<div className="space-y-1">
															<div className="text-lg font-medium">{activity.label}</div>
															<div className="text-sm text-muted-foreground">
																{activity.description}
															</div>
														</div>
														{field.value === activity.value && (
															<CheckIcon className="h-5 w-5 text-primary" />
														)}
													</div>
												</CardHeader>
											</Card>
										))}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<RainbowButton type="submit" className="w-full" disabled={!form.formState.isValid}>
						Next
					</RainbowButton>
				</form>
			</Form>
		</Step>
	);
}

const goalsSchema = z.object({
	goals: z.enum(["lose", "maintain", "gain"]),
});

export function GoalsStep() {
	const { formData, updateFormData, setCurrentStep } = useFormStore();

	const goals = [
		{
			value: "lose",
			label: "Fat Loss",
			description: "Achieve sustainable fat loss while preserving muscle mass",
		},
		{
			value: "maintain",
			label: "Body Recomposition",
			description: "Maintain weight while improving body composition and fitness",
		},
		{
			value: "gain",
			label: "Muscle Building",
			description: "Build lean muscle mass and strength through proper nutrition",
		},
	];

	const form = useForm<z.infer<typeof goalsSchema>>({
		resolver: zodResolver(goalsSchema),
		defaultValues: {
			goals:
				formData.goals && ["lose", "maintain", "gain"].includes(formData.goals)
					? formData.goals
					: "maintain",
		},
	});

	function onSubmit(values: z.infer<typeof goalsSchema>) {
		updateFormData("goals", values.goals);
		setCurrentStep(5);
	}

	return (
		<Step title="What are your weight and health goals?">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="goals"
						render={({ field }) => (
							<FormItem className="space-y-4">
								<FormControl>
									<div className="grid grid-cols-1 gap-4">
										{goals.map((goal) => (
											<Card
												key={goal.value}
												className={cn(
													"cursor-pointer border transition-all hover:bg-accent",
													field.value === goal.value && "border-primary bg-accent",
												)}
												onClick={() => field.onChange(goal.value)}
											>
												<CardHeader>
													<div className="flex items-center justify-between">
														<div className="space-y-1">
															<div className="text-lg font-medium">{goal.label}</div>
															<div className="text-sm text-muted-foreground">
																{goal.description}
															</div>
														</div>
														{field.value === goal.value && (
															<CheckIcon className="h-5 w-5 text-primary" />
														)}
													</div>
												</CardHeader>
											</Card>
										))}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<RainbowButton type="submit" className="w-full" disabled={!form.formState.isValid}>
						Next
					</RainbowButton>
				</form>
			</Form>
		</Step>
	);
}

const medicalConditionsSchema = z.object({
	medicalConditions: z.string().max(1000, "Description should be 1000 characters or less"),
});
export function MedicalConditionsStep() {
	const { formData, updateFormData, setCurrentStep } = useFormStore();

	const form = useForm<z.infer<typeof medicalConditionsSchema>>({
		resolver: zodResolver(medicalConditionsSchema),
		defaultValues: {
			medicalConditions: formData.medicalConditions || "",
		},
	});

	function onSubmit(values: z.infer<typeof medicalConditionsSchema>) {
		updateFormData("medicalConditions", values.medicalConditions);
		setCurrentStep(7);
	}

	return (
		<Step title="Do you have any medical conditions or health concerns?">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="medicalConditions"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										placeholder="Conditions like diabetes, high blood pressure, or digestive issues can significantly impact dietary recommendations."
										className="min-h-[150px] text-lg"
										autoFocus
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<RainbowButton type="submit" className="w-full" disabled={!form.formState.isValid}>
						Next
					</RainbowButton>
				</form>
			</Form>
		</Step>
	);
}

const dietaryRestrictionsSchema = z.object({
	dietaryRestrictions: z.string().max(1000, "Description should be 1000 characters or less"),
});

export function DietaryRestrictionsStep() {
	const { formData, updateFormData, setCurrentStep } = useFormStore();

	const form = useForm<z.infer<typeof dietaryRestrictionsSchema>>({
		resolver: zodResolver(dietaryRestrictionsSchema),
		defaultValues: {
			dietaryRestrictions: formData.dietaryRestrictions || "",
		},
	});

	function onSubmit(values: z.infer<typeof dietaryRestrictionsSchema>) {
		updateFormData("dietaryRestrictions", values.dietaryRestrictions);
		setCurrentStep(8);
	}

	return (
		<Step title="Do you have any dietary restrictions?">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="dietaryRestrictions"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										placeholder="For example: vegetarian, vegan, gluten-free, lactose intolerant, food allergies (nuts, shellfish, dairy), or religious dietary laws."
										className="min-h-[150px] text-lg"
										autoFocus
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<RainbowButton type="submit" className="w-full" disabled={!form.formState.isValid}>
						Next
					</RainbowButton>
				</form>
			</Form>
		</Step>
	);
}

const foodPreferencesSchema = z.object({
	foodPreferences: z.string().max(1000, "Description should be 1000 characters or less"),
});
export function FoodPreferencesStep() {
	const { formData, updateFormData, setCurrentStep } = useFormStore();

	const form = useForm<z.infer<typeof foodPreferencesSchema>>({
		resolver: zodResolver(foodPreferencesSchema),
		defaultValues: {
			foodPreferences: formData.foodPreferences || "",
		},
	});

	function onSubmit(values: z.infer<typeof foodPreferencesSchema>) {
		updateFormData("foodPreferences", values.foodPreferences);
		setCurrentStep(9);
	}

	return (
		<Step title="Are there any foods you particularly enjoy or dislike?">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="foodPreferences"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										placeholder="Incorporating favorite foods can increase adherence. Avoiding disliked foods enhances satisfaction."
										className="min-h-[150px] text-lg"
										autoFocus
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<RainbowButton type="submit" className="w-full" disabled={!form.formState.isValid}>
						Next
					</RainbowButton>
				</form>
			</Form>
		</Step>
	);
}

const dietaryApproachSchema = z.object({
	dietaryApproach: z.string().max(1000, "Description should be 1000 characters or less"),
});

export function DietaryApproachStep() {
	const { formData, updateFormData, setCurrentStep } = useFormStore();

	const form = useForm<z.infer<typeof dietaryApproachSchema>>({
		resolver: zodResolver(dietaryApproachSchema),
		defaultValues: {
			dietaryApproach: formData.dietaryApproach || "",
		},
	});

	function onSubmit(values: z.infer<typeof dietaryApproachSchema>) {
		updateFormData("dietaryApproach", values.dietaryApproach);
		setCurrentStep(10);
	}

	return (
		<Step title="Are you interested in following any specific dietary approaches or meal plans?">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="dietaryApproach"
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										placeholder="For example: low-carb, Mediterranean, keto, paleo, intermittent fasting, or others."
										className="min-h-[150px] text-lg"
										autoFocus
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<RainbowButton type="submit" className="w-full" disabled={!form.formState.isValid}>
						Next
					</RainbowButton>
				</form>
			</Form>
		</Step>
	);
}

export function ExamplePlanStep() {
	return (
		<Step title="Perfect! Let's create your personalized meal plan">
			<div className="space-y-4">
				<p className="text-gray-600">
					Based on your preferences, we&apos;ll generate a sample daily meal plan tailored just for
					you. This will give you a taste of what you can expect from our AI-powered meal planning.
				</p>
				<DailyExample />
			</div>
		</Step>
	);
}
