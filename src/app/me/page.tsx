"use client";

import { useQuery } from "@tanstack/react-query";
import { InfoCard } from "@/app/me/info-card";
import { ShoppingListCard } from "@/app/me/shopping-list-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { weeklyPlanSchema, WeeklyPlanData, NutritionTargets } from "@/app/api/gen-day/schema";
import { MealCard } from "@/app/me/meal-card";
import RainbowButton from "@/components/ui/rainbow-button";
import { toast } from "@/components/ui/use-toast";
import { useFormStore } from "@/store";
import supabase from "@/supabase/client";
import { experimental_useObject as useObject } from "ai/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function WeeklyExample() {
	const { formData } = useFormStore();

	const {
		object: weeklyPlan,
		isLoading: isGenerating,
		error: generationError,
		submit,
	} = useObject<WeeklyPlanData>({
		api: "/api/gen-week",
		schema: weeklyPlanSchema,
		onError: (err) => {
			console.error(1, err.message);
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
			}
			const { data, error: err } = await supabase.from("diets").insert({
				plan: object,
			});
			console.log(data);
			if (err) {
				console.error(err.message);
				toast({
					variant: "destructive",
					title: "Error saving diet plan to database",
				});
			}
		},
	});

	const router = useRouter();

	const fetchLatestDiet = async () => {
		const res = await supabase.auth.getUser();
		if (res.error) return null;

		console.log(res.data?.user.user_metadata);
		if (!res.data?.user.user_metadata?.completed_profile) {
			router.push("/me/profile");
		}
		const { data, error } = await supabase
			.from("diets")
			.select("plan")
			.order("created_at", { ascending: false })
			.limit(1)
			.single();

		if (error) return null;
		return data.plan as WeeklyPlanData;
	};

	const {
		data: latestPlan,
		isLoading: isLoadingLatestPlan,
		error: loadError,
	} = useQuery({
		queryKey: ["latestDiet"],
		queryFn: fetchLatestDiet,
		enabled: !weeklyPlan, // Only fetch if there's no generated plan
	});

	const currentPlan = weeklyPlan || latestPlan;
	const isLoading = isGenerating || isLoadingLatestPlan;
	const error = generationError || loadError;

	const handleGenerate = () => submit(formData);

	const formatNutritionTargets = (targets?: NutritionTargets) => {
		if (!targets) return "No nutrition targets available";
		return `Calories: ${targets.calories ?? "N/A"}, Protein: ${targets.protein ?? "N/A"}, Carbs: ${targets.carbs ?? "N/A"}, Fats: ${targets.fats ?? "N/A"}`;
	};

	return (
		<div className="container mx-auto p-4 max-w-5xl">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 z-10 relative bg-background">
				<RainbowButton
					colorScheme="black"
					onClick={handleGenerate}
					disabled={isLoading}
					className="w-full md:w-auto"
				>
					<div className="flex items-center justify-center">
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Weekly Plan
							</>
						) : (
							<>
								<RefreshCw className="mr-2 h-4 w-4" /> Generate Weekly Plan
							</>
						)}
					</div>
				</RainbowButton>
				<Link href="/me/profile" className="w-full md:w-auto">
					<RainbowButton colorScheme="white" disabled={isLoading} className="w-full">
						<div className="flex items-center justify-center">Update Profile</div>
					</RainbowButton>
				</Link>
			</div>
			{error && (
				<Card className="mb-6 bg-red-50 shadow-lg">
					<CardHeader>
						<CardTitle className="text-xl font-bold text-red-600">Error</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-red-600">{error.message}</p>
					</CardContent>
				</Card>
			)}

			{(currentPlan || isLoading) && (
				<div className="space-y-6">
					{currentPlan?.dailyPlans && currentPlan.dailyPlans.length > 0 ? (
						<Tabs
							defaultValue={
								currentPlan.dailyPlans.find(
									(plan) =>
										plan.day === new Date().toLocaleDateString("en-US", { weekday: "long" }),
								)?.day ?? "Monday"
							}
							className="w-full"
						>
							<ScrollArea className="w-full">
								<TabsList className="inline-flex h-14 items-center justify-start space-x-2 rounded-lg bg-gray-100 p-1">
									{currentPlan.dailyPlans.map((dayPlan, index) => (
										<TabsTrigger
											key={index}
											value={dayPlan.day ?? `Day ${index + 1}`}
											className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-3 text-gray-600 data-[state=active]:text-black font-medium text-sm hover:bg-gray-50 whitespace-nowrap"
										>
											{dayPlan.day ?? `Day ${index + 1}`}
										</TabsTrigger>
									))}
								</TabsList>
								<ScrollBar orientation="horizontal" />
							</ScrollArea>
							{currentPlan.dailyPlans.map((dayPlan, index) => (
								<TabsContent key={index} value={dayPlan.day ?? `Day ${index + 1}`}>
									<Card className="mb-6">
										<CardHeader className="bg-primary/10">
											<CardTitle className="text-2xl">
												{dayPlan.day ?? `Day ${index + 1}`}
											</CardTitle>
											<CardDescription className="text-lg">
												Total Calories: {dayPlan.totalCalories ?? "N/A"}
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-6 pt-6">
											<MealCard mealName="breakfast" meal={dayPlan.meals?.breakfast} />
											<MealCard mealName="lunch" meal={dayPlan.meals?.lunch} />
											<MealCard mealName="dinner" meal={dayPlan.meals?.dinner} />
										</CardContent>
									</Card>
								</TabsContent>
							))}
						</Tabs>
					) : isLoading ? (
						<LoadingSkeleton />
					) : null}

					{currentPlan?.shoppingList && (
						<ShoppingListCard shoppingList={currentPlan.shoppingList} />
					)}
					{currentPlan?.explanation && (
						<InfoCard title="Overview" content={currentPlan.explanation} />
					)}

					{currentPlan?.nutritionTargets && (
						<InfoCard
							title="Nutrition Targets"
							content={formatNutritionTargets(currentPlan.nutritionTargets)}
						/>
					)}
				</div>
			)}
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-4">
			<div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
				))}
			</div>
		</div>
	);
}
