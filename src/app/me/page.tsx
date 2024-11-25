"use client";

import { useQuery } from "@tanstack/react-query";
import { InfoCard } from "@/app/me/info-card";
import { ShoppingListCard } from "@/app/me/shopping-list-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  weeklyPlanSchema,
  WeeklyPlanData,
  NutritionTargets,
} from "@/app/api/gen-day/schema";
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
    const user = await supabase.auth.getSession();
    if (user.error) return null;
    const res = await supabase
      .from("users")
      .select()
      .eq("id", user.data.session.user.id)
      .single();

    if (res.error) return null;

    if (!res.data.completed_profile) {
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

  useEffect(() => {
    console.log(currentPlan);
  }, [currentPlan]);

  const handleGenerate = () => submit(formData);

  const formatNutritionTargets = (targets?: NutritionTargets) => {
    if (!targets) return "No nutrition targets available";
    return `Calories: ${targets.calories ?? "N/A"}, Protein: ${targets.protein ?? "N/A"}, Carbs: ${targets.carbs ?? "N/A"}, Fats: ${targets.fats ?? "N/A"}`;
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex flex-col space-y-4 md:flex-row justify-between mb-6">
        <RainbowButton
          colorScheme="black"
          onClick={handleGenerate}
          disabled={isLoading}
        >
          <div className="flex  items-center justify-between">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating
                Weekly Plan
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Generate Weekly Plan
              </>
            )}
          </div>
        </RainbowButton>
        <Link href="/me/profile">
          <RainbowButton colorScheme="white" disabled={isLoading}>
            <div className="flex  items-center justify-between">
              Update Profile
            </div>
          </RainbowButton>
        </Link>
      </div>
      {error && (
        <Card className="mb-6 bg-red-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-600">
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error.message}</p>
          </CardContent>
        </Card>
      )}

      {(currentPlan || isLoading) && (
        <div className="space-y-6">
          {currentPlan?.dailyPlans && currentPlan.dailyPlans.length > 0 ? (
            <Tabs defaultValue={"Monday"} className="w-full">
              <ScrollArea className="w-full">
                <TabsList className="inline-flex w-full md:w-auto">
                  {currentPlan.dailyPlans.map((dayPlan, index) => (
                    <TabsTrigger
                      key={index}
                      value={dayPlan.day ?? `Day ${index + 1}`}
                      className="flex-1 md:flex-none"
                    >
                      {dayPlan.day ?? `Day ${index + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
              {currentPlan.dailyPlans.map((dayPlan, index) => (
                <TabsContent
                  key={index}
                  value={dayPlan.day ?? `Day ${index + 1}`}
                >
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>{dayPlan.day ?? `Day ${index + 1}`}</CardTitle>
                      <CardDescription>
                        Total Calories: {dayPlan.totalCalories ?? "N/A"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MealCard
                        mealName="Breakfast"
                        meal={dayPlan.meals?.breakfast}
                      />
                      <MealCard mealName="Lunch" meal={dayPlan.meals?.lunch} />
                      <MealCard
                        mealName="Dinner"
                        meal={dayPlan.meals?.dinner}
                      />
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
