"use client";

import RainbowButton from "@/components/ui/rainbow-button";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useFormStore } from "@/store";
import {
  GenderStep,
  AgeStep,
  UnitStep,
  HeightStep,
  WeightStep,
  WaistStep,
  HipStep,
  NeckStep,
  ActivityLevelStep,
  DietaryRestrictionsStep,
  AllergiesStep,
  HealthGoalsStep,
  MealPreferencesStep,
  CookingSkillStep,
} from "./step-components";

const ease = [0.16, 1, 0.3, 1];

function HeroTitles() {
  return (
    <div className="flex w-full max-w-2xl flex-col space-y-4 overflow-hidden pt-8">
      <motion.h1
        className="text-center text-4xl font-medium leading-tight text-foreground sm:text-5xl md:text-6xl"
        initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
        animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          ease,
          staggerChildren: 0.2,
        }}
      >
        {["Body", "composition", "calculator", ""].map((text, index) => (
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

export default function Hero2() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentStep, setCurrentStep, formData } = useFormStore();

  useEffect(() => {
    const step = searchParams.get("step");
    if (step) {
      setCurrentStep(parseInt(step, 10));
    }
  }, [searchParams, setCurrentStep]);

  useEffect(() => {
    router.replace(`?step=${currentStep}`, { scroll: false });
  }, [currentStep, router]);

  const handleSubmit = () => {
    console.log(formData);
    alert("Form submitted! Check console for data.");
  };

  const steps = [
    <GenderStep key="gender" />,
    <AgeStep key="age" />,
    <UnitStep key="unit" />,
    <HeightStep key="height" />,
    <WeightStep key="weight" />,
    <WaistStep key="waist" />,
    <HipStep key="hip" />,
    <NeckStep key="neck" />,
    <ActivityLevelStep key="activity" />,
    <DietaryRestrictionsStep key="diet" />,
    <AllergiesStep key="allergies" />,
    <HealthGoalsStep key="goals" />,
    <MealPreferencesStep key="preferences" />,
    <CookingSkillStep key="cooking" />,
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="z-[50] sticky top-0 w-full bg-background/95 border-b backdrop-blur-sm border-border/40">
        <div className="container h-14 flex items-center justify-between">
          <Link
            href="/?step=1"
            className="flex justify-start items-center hover:opacity-85 transition-opacity duration-300"
          >
            <span className="font-bold text-xl">{"//"}Bodycomposition</span>
          </Link>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl">
          <HeroTitles />
          <form className="mt-12" onSubmit={(e) => e.preventDefault()}>
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

            {currentStep === steps.length && (
              <RainbowButton
                type="button"
                onClick={handleSubmit}
                className="w-full mt-6"
              >
                Generate Diet Plan
              </RainbowButton>
            )}
          </form>
        </div>
      </main>

      <footer className="py-6 md:py-0 border-t border-border/40">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Bodycomposition 2024 © All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
