"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useFormStore } from "@/store";
import {
  GenderStep,
  AgeStep,
  UnitStep,
  HeightStep,
  WeightStep,
  GoalsStep,
  DietaryRestrictionsStep,
  MedicalConditionsStep,
  ActivityStep,
  FoodPreferencesStep,
  MealPreparationStep,
  DietaryApproachStep,
  ExamplePlanStep,
} from "./step-components";

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
            key={index}
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
      setCurrentStep(parseInt(step, 10));
    }
  }, [searchParams, setCurrentStep]);

  return null;
}

export default function BodyCompositionCalculator() {
  const router = useRouter();
  const { currentStep } = useFormStore();

  useEffect(() => {
    router.replace(`?step=${currentStep}`, { scroll: false });
  }, [currentStep, router]);

  const steps = [
    <GenderStep key="gender" />,
    <AgeStep key="age" />,
    <UnitStep key="unit" />,
    <HeightStep key="height" />,
    <WeightStep key="weight" />,
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
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                ></div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="py-6 md:py-0 border-t border-border/40">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Ai Diet Planner
          </p>
        </div>
      </footer>
    </div>
  );
}
