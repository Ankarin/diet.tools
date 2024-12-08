/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/supabase/client";

const baseSchema = z.object({
	gender: z.enum(["male", "female"], { required_error: "Gender is required" }),
	age: z.string().refine(
		(val) => {
			const num = Number.parseInt(val, 10);
			return !isNaN(num) && num >= 1 && num <= 120;
		},
		{ message: "Age must be between 1 and 120" },
	),
	unit: z.enum(["metric", "imperial"]),
	weight: z.string().refine(
		(val) => {
			const num = Number.parseFloat(val);
			return !Number.isNaN(num) && num > 0;
		},
		{ message: "Weight must be a positive number" },
	),
	goals: z.enum(["lose", "maintain", "gain"], { required_error: "Goal is required" }),
	activity: z.enum(["sedentary", "light", "moderate", "very", "extra"], {
		required_error: "Activity level is required",
	}),
	medicalConditions: z.string().max(1000, {
		message: "Medical conditions should be 1000 characters or less",
	}),
	dietaryRestrictions: z.string().max(1000, {
		message: "Dietary restrictions should be 1000 characters or less",
	}),
	foodPreferences: z.string().max(1000, {
		message: "Food preferences should be 1000 characters or less",
	}),
	dietaryApproach: z.string().max(1000, {
		message: "Dietary approach should be 1000 characters or less",
	}),
});

const metricSchema = baseSchema.extend({
	height: z.string().refine(
		(val) => {
			const num = parseFloat(val);
			return !isNaN(num) && num >= 50 && num <= 300;
		},
		{ message: "Height must be between 50 and 300 cm" },
	),
});

const imperialSchema = baseSchema.extend({
	heightFeet: z.string().refine(
		(val) => {
			const num = parseInt(val, 10);
			return !isNaN(num) && num >= 1 && num <= 9;
		},
		{ message: "Height (feet) must be between 1 and 9" },
	),
	heightInches: z.string().refine(
		(val) => {
			const num = parseInt(val, 10);
			return !isNaN(num) && num >= 0 && num < 12;
		},
		{ message: "Height (inches) must be between 0 and 11" },
	),
});

type FormValues = z.infer<typeof metricSchema> & z.infer<typeof imperialSchema>;

export default function UserForm() {
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const form = useForm<FormValues>({
		resolver: zodResolver(metricSchema),
		defaultValues: {
			gender: "male",
			age: "",
			unit: "imperial",
			height: "",
			weight: "",
			heightFeet: "",
			heightInches: "",
			goals: "maintain",
			activity: "moderate",
			medicalConditions: "",
			dietaryRestrictions: "",
			foodPreferences: "",
			dietaryApproach: "",
		},
	});

	const watchUnit = form.watch("unit");

	useEffect(() => {
		const fetchUserData = async () => {
			setIsLoading(true);
			try {
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
						toast({
							title: "Error",
							description: "Failed to load user data",
							variant: "destructive",
						});
					} else if (data) {
						// Convert numeric values to strings for form fields
						const formattedData = {
							...data,
							age: data.age?.toString() || "",
							height: data.height?.toString() || "",
							weight: data.weight?.toString() || "",
							heightFeet: data.heightFeet?.toString() || "",
							heightInches: data.heightInches?.toString() || "",
						};
						form.reset(formattedData);
					}
				}
			} catch (error) {
				console.error("Unexpected error while fetching user data:", error);
				toast({
					title: "Error",
					description: "An unexpected error occurred while loading user data",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchUserData();
	}, [form, toast]);

	useEffect(() => {
		// biome-ignore lint/correctness/noUnusedVariables: <explanation>
		const schema = watchUnit === "metric" ? metricSchema : imperialSchema;
		form.clearErrors();
		if (watchUnit === "metric") {
			form.setValue("heightFeet", "");
			form.setValue("heightInches", "");
		} else {
			form.setValue("height", "");
		}
	}, [watchUnit, form]);

	const router = useRouter();

	async function onSubmit(values: FormValues) {
		setIsSubmitting(true);
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast({
					title: "Error",
					description: "You must be logged in to save data",
					variant: "destructive",
				});
				return;
			}

			const { error } = await supabase.from("users").upsert(
				{
					id: user.id,
					...values,
					// Convert string values to numbers for database storage
					age: parseInt(values.age, 10),
					height: values.height ? parseFloat(values.height) : null,
					weight: parseFloat(values.weight),
					heightFeet: values.heightFeet ? parseInt(values.heightFeet, 10) : null,
					heightInches: values.heightInches ? parseInt(values.heightInches, 10) : null,
				},
				{ onConflict: "id" },
			);

			if (error) {
				console.error("Error saving user data:", error);
				toast({
					title: "Error",
					description: "Failed to save user data",
					variant: "destructive",
				});
			} else {
				await supabase.auth.updateUser({
					data: {
						completed_profile: true,
					},
				});
				setTimeout(() => {}, 1000);

				toast({
					title: "Success",
					description: "User data saved successfully",
				});
			}
		} catch (error) {
			console.error("Unexpected error:", error);
			toast({
				title: "Error",
				description: "An unexpected error occurred",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
		router.push("/me");
	}

	if (isLoading) {
		return <div>Loading user data...</div>;
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit, (errors) => {
					console.error(errors);
					toast({
						title: "Validation Error",
						description: "Please check the form for errors",
						variant: "destructive",
					});
				})}
				className="space-y-8"
			>
				<FormField
					control={form.control}
					name="gender"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Gender</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									value={field.value}
									className="flex flex-col space-y-1"
								>
									<FormItem className="flex items-center space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="male" />
										</FormControl>
										<FormLabel className="font-normal">Male</FormLabel>
									</FormItem>
									<FormItem className="flex items-center space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="female" />
										</FormControl>
										<FormLabel className="font-normal">Female</FormLabel>
									</FormItem>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="age"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Age</FormLabel>
							<FormControl>
								<Input {...field} type="number" placeholder="Enter your age" />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="unit"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Unit System</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select unit system" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="metric">Metric</SelectItem>
									<SelectItem value="imperial">Imperial</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				{watchUnit === "metric" ? (
					<FormField
						control={form.control}
						name="height"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Height (cm)</FormLabel>
								<FormControl>
									<Input {...field} type="number" placeholder="Enter your height in cm" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				) : (
					<>
						<FormField
							control={form.control}
							name="heightFeet"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Height (feet)</FormLabel>
									<FormControl>
										<Input {...field} type="number" placeholder="Feet" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="heightInches"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Height (inches)</FormLabel>
									<FormControl>
										<Input {...field} type="number" placeholder="Inches" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</>
				)}
				<FormField
					control={form.control}
					name="weight"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Weight ({watchUnit === "metric" ? "kg" : "lbs"})</FormLabel>
							<FormControl>
								<Input
									{...field}
									type="number"
									placeholder={`Enter your weight in ${watchUnit === "metric" ? "kg" : "lbs"}`}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="goals"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Goals</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									value={field.value}
									className="flex flex-col space-y-3"
								>
									<FormItem className="flex items-start space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="lose" />
										</FormControl>
										<div className="space-y-1">
											<FormLabel className="font-medium">Fat Loss</FormLabel>
											<p className="text-sm text-muted-foreground">
												Achieve sustainable fat loss while preserving muscle mass
											</p>
										</div>
									</FormItem>
									<FormItem className="flex items-start space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="maintain" />
										</FormControl>
										<div className="space-y-1">
											<FormLabel className="font-medium">Body Recomposition</FormLabel>
											<p className="text-sm text-muted-foreground">
												Maintain weight while improving body composition and fitness
											</p>
										</div>
									</FormItem>
									<FormItem className="flex items-start space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="gain" />
										</FormControl>
										<div className="space-y-1">
											<FormLabel className="font-medium">Muscle Building</FormLabel>
											<p className="text-sm text-muted-foreground">
												Build lean muscle mass and strength through proper nutrition
											</p>
										</div>
									</FormItem>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="activity"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Activity Level</FormLabel>
							<FormControl>
								<RadioGroup
									onValueChange={field.onChange}
									value={field.value}
									className="flex flex-col space-y-3"
								>
									<FormItem className="flex items-start space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="sedentary" />
										</FormControl>
										<div className="space-y-1">
											<FormLabel className="font-medium">Sedentary</FormLabel>
											<p className="text-sm text-muted-foreground">
												Desk job and little to no exercise (e.g., office work with minimal movement)
											</p>
										</div>
									</FormItem>
									<FormItem className="flex items-start space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="light" />
										</FormControl>
										<div className="space-y-1">
											<FormLabel className="font-medium">Lightly Active</FormLabel>
											<p className="text-sm text-muted-foreground">
												Light exercise 1-3 days/week or active job with lots of walking
											</p>
										</div>
									</FormItem>
									<FormItem className="flex items-start space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="moderate" />
										</FormControl>
										<div className="space-y-1">
											<FormLabel className="font-medium">Moderately Active</FormLabel>
											<p className="text-sm text-muted-foreground">
												Moderate exercise 3-5 days/week or physically demanding job
											</p>
										</div>
									</FormItem>
									<FormItem className="flex items-start space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="very" />
										</FormControl>
										<div className="space-y-1">
											<FormLabel className="font-medium">Very Active</FormLabel>
											<p className="text-sm text-muted-foreground">
												Hard exercise 6-7 days/week or athletic job with daily training
											</p>
										</div>
									</FormItem>
									<FormItem className="flex items-start space-x-3 space-y-0">
										<FormControl>
											<RadioGroupItem value="extra" />
										</FormControl>
										<div className="space-y-1">
											<FormLabel className="font-medium">Extremely Active</FormLabel>
											<p className="text-sm text-muted-foreground">
												Professional athlete level or extremely physical job with additional
												training
											</p>
										</div>
									</FormItem>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="medicalConditions"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Medical Conditions</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="Do you have any medical conditions or health concerns?"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="dietaryRestrictions"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Dietary Restrictions</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="Do you have any dietary restrictions? (e.g., vegetarian, vegan, gluten-free, allergies)"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="foodPreferences"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Food Preferences</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="Are there any foods you particularly enjoy or dislike?"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="dietaryApproach"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Dietary Approach</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="Are you interested in following any specific dietary approaches or meal plans? (e.g., low-carb, Mediterranean, keto)"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : "Save"}
				</Button>
			</form>
		</Form>
	);
}
