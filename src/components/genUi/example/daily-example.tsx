"use client";

import { singleDailyPlanSchema } from "@/app/api/gen-day/schema";
import { useFormStore } from "@/store";
import { experimental_useObject as useObject } from "ai/react";
import Link from "next/link";
import type { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealCard } from "./meal-card";
import { ShoppingListCard } from "./shopping-list-card";
import { InfoCard } from "./info-card";
import { toast } from "@/components/ui/use-toast";
import supabase from "@/supabase/client";

type DailyPlanData = z.infer<typeof singleDailyPlanSchema>;

export default function DailyExample() {
	const {
		object: mealPlan,
		isLoading,
		error,
		submit,
	} = useObject<DailyPlanData>({
		api: "/api/gen-day",
		schema: singleDailyPlanSchema,
		onError: (err) => {
			console.error(err.message);
			toast({
				variant: "destructive",
				title: err.message,
			});
		},
		onFinish: async ({ object, error }) => {
			if (error) {
				console.error(error.message);
				toast({
					variant: "destructive",
					title: error.message,
				});
				return;
			}
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user) {
					const { error: saveError } = await supabase.from("diets_day").insert([
						{
							user_id: user.id,
							plan: object,
						},
					]);
					if (saveError) {
						console.error("Error saving diet:", saveError);
						toast({
							variant: "destructive",
							title: "Error saving diet plan to database",
						});
					}
				}
			} catch (err) {
				console.error("Error saving diet:", err);
				toast({
					variant: "destructive",
					title: "Error saving diet plan to database",
				});
			}
		},
	});
	const { formData } = useFormStore();
	const handleGenerate = () => submit(formData);

	// Calculate total macros
	const totalMacros = mealPlan?.meals
		? Object.values(mealPlan.meals).reduce(
				(acc, meal) => {
					if (meal?.items) {
						for (const item of meal.items) {
							acc.protein += item.protein || 0;
							acc.carbs += item.carbs || 0;
							acc.fats += item.fats || 0;
						}
					}
					return acc;
				},
				{ protein: 0, carbs: 0, fats: 0 },
			)
		: null;

	return (
		<div className="container mx-auto p-4 max-w-4xl">
			{!isLoading && !mealPlan ? (
				<Button
					onClick={handleGenerate}
					disabled={isLoading}
					className="mb-6 text-lg py-6 px-8 w-full"
				>
					Create My Sample Meal Plan
				</Button>
			) : !isLoading && mealPlan ? (
				<Link href="/signup">
					<Button disabled={isLoading} className="mb-6 text-lg py-6 px-8 w-full">
						Get The Full Version →
					</Button>
				</Link>
			) : null}

			{error && (
				<Card className="mb-6 bg-red-50 shadow-lg">
					<CardHeader>
						<CardTitle className="text-2xl font-bold text-red-600">Error</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg text-red-600">{error.message}</p>
					</CardContent>
				</Card>
			)}

			{(mealPlan || isLoading) && (
				<div className="space-y-6">
					<Card className="shadow-lg">
						<CardHeader className="bg-primary/10">
							<CardTitle className="text-2xl font-bold">Your meal plan for the day</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-xl pt-4 text-muted-foreground">
								<div>Calories: {mealPlan?.totalCalories || "Calculating..."}</div>
								{totalMacros && (
									<div>
										Protein: {totalMacros.protein}g Carbs: {totalMacros.carbs}g Fats:{" "}
										{totalMacros.fats}g
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{mealPlan?.meals &&
						Object.entries(mealPlan.meals).map(([mealName, meal]) => (
							<MealCard
								key={mealName}
								mealName={mealName}
								// @ts-ignore
								items={meal.items || []}
							/>
						))}
					{mealPlan?.shoppingList?.categories && mealPlan.shoppingList.categories.length > 0 && (
						// @ts-ignore
						<ShoppingListCard categories={mealPlan.shoppingList.categories} />
					)}
					{mealPlan?.explanation && <InfoCard title="Explanation" content={mealPlan.explanation} />}
				</div>
			)}

			{isLoading && (
				<div className="flex justify-center items-center py-8">
					<Loader2 className="h-8 w-8 animate-spin" />
				</div>
			)}
			<br />
			{!isLoading && mealPlan && (
				<Link href="/signup">
					<Button disabled={isLoading} className="mb-6 text-lg py-6 px-8 w-full">
						Get The Full Version →
					</Button>
				</Link>
			)}
		</div>
	);
}
