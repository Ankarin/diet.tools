import Results from "@/app/form/results";
import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import RainbowButton from "@/components/ui/rainbow-button";
import { useFormStore } from "@/store";
import { ArrowLeft } from "lucide-react";

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

interface StepProps {
  title: string;
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
        <h2 className="text-2xl font-bold text-center flex-grow">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

export function GenderStep() {
  const { updateFormData, setCurrentStep } = useFormStore();

  const handleGenderSelection =
    (gender: string) => async (e: React.MouseEvent) => {
      e.preventDefault();
      updateFormData("gender", gender);
      setCurrentStep(2);
      const res = await supabase.auth.signInAnonymously();
      console.log(res);
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

export function AgeStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const age = parseInt(formData.age);
    setIsValid(formData.age !== "" && age > 0 && age <= 120);
  }, [formData.age]);

  return (
    <Step title="How old are you?">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid) {
            setCurrentStep(3);
          }
        }}
      >
        <div className="space-y-4">
          <Input
            autoFocus={true}
            id="age"
            type="number"
            value={formData.age}
            onChange={(e) => updateFormData("age", e.target.value)}
            placeholder="Enter your age"
            required
            min="1"
            max="120"
            className="text-center text-lg"
          />
          <RainbowButton
            colorScheme="green"
            type="submit"
            className="w-full"
            disabled={!isValid}
          >
            Next
          </RainbowButton>
        </div>
      </form>
    </Step>
  );
}

export function UnitStep() {
  const { updateFormData, setCurrentStep } = useFormStore();

  const handleUnitSelection = (unit: "metric" | "imperial") => {
    updateFormData("unit", unit);
    setCurrentStep(4);
  };

  return (
    <Step title="Choose your preferred unit system">
      <div className="flex justify-center space-x-4">
        <RainbowButton
          colorScheme="black"
          onClick={() => handleUnitSelection("metric")}
        >
          Metric
        </RainbowButton>
        <RainbowButton
          colorScheme="white"
          onClick={() => handleUnitSelection("imperial")}
        >
          Imperial
        </RainbowButton>
      </div>
    </Step>
  );
}

export function HeightStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (formData.unit === "metric") {
      const height = parseInt(formData.height);
      setIsValid(formData.height !== "" && height > 0 && height <= 300);
    } else {
      const feet = parseInt(formData.heightFeet || "0");
      const inches = parseInt(formData.heightInches || "0");
      setIsValid(
        formData.heightFeet !== "" &&
          feet > 0 &&
          feet <= 9 &&
          formData.heightInches !== "" &&
          inches >= 0 &&
          inches < 12,
      );
    }
  }, [
    formData.height,
    formData.heightFeet,
    formData.heightInches,
    formData.unit,
  ]);

  return (
    <Step title={`What's your height? (cm)`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid) {
            setCurrentStep(5);
          }
        }}
      >
        <div className="space-y-4">
          {formData.unit === "metric" ? (
            <Input
              autoFocus={true}
              id="height"
              type="number"
              value={formData.height}
              onChange={(e) => updateFormData("height", e.target.value)}
              placeholder="Enter your height"
              required
              min="50"
              max="300"
              className="text-center text-lg"
            />
          ) : (
            <div className="flex space-x-2">
              <Input
                autoFocus={true}
                id="heightFeet"
                type="number"
                value={formData.heightFeet}
                onChange={(e) => updateFormData("heightFeet", e.target.value)}
                placeholder="Feet"
                required
                min="1"
                max="9"
                className="text-center text-lg"
              />
              <Input
                id="heightInches"
                type="number"
                value={formData.heightInches}
                onChange={(e) => updateFormData("heightInches", e.target.value)}
                placeholder="Inches"
                required
                min="0"
                max="11"
                className="text-center text-lg"
              />
            </div>
          )}
          <RainbowButton type="submit" className="w-full" disabled={!isValid}>
            Next
          </RainbowButton>
        </div>
      </form>
    </Step>
  );
}

export function WeightStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const weight = parseFloat(formData.weight);
    const minWeight = formData.unit === "metric" ? 20 : 44;
    const maxWeight = formData.unit === "metric" ? 500 : 1100;
    setIsValid(
      formData.weight !== "" && weight >= minWeight && weight <= maxWeight,
    );
  }, [formData.weight, formData.unit]);

  return (
    <Step
      title={`What's your weight? (${formData.unit === "metric" ? "kg" : "lbs"})`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid) {
            setCurrentStep(6);
          }
        }}
      >
        <div className="space-y-4">
          <Input
            autoFocus={true}
            id="weight"
            type="number"
            value={formData.weight}
            onChange={(e) => updateFormData("weight", e.target.value)}
            placeholder={`Enter your weight`}
            required
            min={formData.unit === "metric" ? "20" : "44"}
            max={formData.unit === "metric" ? "500" : "1100"}
            className="text-center text-lg"
          />
          <RainbowButton type="submit" className="w-full" disabled={!isValid}>
            Next
          </RainbowButton>
        </div>
      </form>
    </Step>
  );
}
export function WaistStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const waist = parseFloat(formData.waist);
    const minWaist = formData.unit === "metric" ? 40 : 15;
    const maxWaist = formData.unit === "metric" ? 200 : 80;

    setIsValid(formData.waist !== "" && waist >= minWaist && waist <= maxWaist);
  }, [formData.waist, formData.unit]);

  return (
    <Step
      title={`What's your waist measurement? (${formData.unit === "metric" ? "cm" : "inches"})`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid) {
            setCurrentStep(7);
          }
        }}
      >
        <div className="space-y-4">
          <Input
            autoFocus={true}
            id="waist"
            type="number"
            value={formData.waist}
            onChange={(e) => updateFormData("waist", e.target.value)}
            placeholder={`Enter your waist measurement`}
            required
            min={formData.unit === "metric" ? "40" : "15"}
            max={formData.unit === "metric" ? "200" : "80"}
            className="text-center text-lg"
          />
          <RainbowButton type="submit" className="w-full" disabled={!isValid}>
            Next
          </RainbowButton>
        </div>
      </form>
    </Step>
  );
}

export function HipStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const hip = parseFloat(formData.hip);
    const minHip = formData.unit === "metric" ? 50 : 20;
    const maxHip = formData.unit === "metric" ? 200 : 80;
    setIsValid(formData.hip !== "" && hip >= minHip && hip <= maxHip);
  }, [formData.hip, formData.unit]);

  return (
    <Step
      title={`What's your hip measurement? (${formData.unit === "metric" ? "cm" : "inches"})`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid) {
            setCurrentStep(8);
          }
        }}
      >
        <div className="space-y-4">
          <Input
            autoFocus={true}
            id="hip"
            type="number"
            value={formData.hip}
            onChange={(e) => updateFormData("hip", e.target.value)}
            placeholder={`Enter your hip measurement`}
            required
            min={formData.unit === "metric" ? "50" : "20"}
            max={formData.unit === "metric" ? "200" : "80"}
            className="text-center text-lg"
          />
          <RainbowButton type="submit" className="w-full" disabled={!isValid}>
            Next
          </RainbowButton>
        </div>
      </form>
    </Step>
  );
}

export function NeckStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const neck = parseFloat(formData.neck);
    const minNeck = formData.unit === "metric" ? 20 : 8;
    const maxNeck = formData.unit === "metric" ? 80 : 32;
    setIsValid(formData.neck !== "" && neck >= minNeck && neck <= maxNeck);
  }, [formData.neck, formData.unit]);

  return (
    <Step
      title={`What's your neck measurement? (${formData.unit === "metric" ? "cm" : "inches"})`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid) {
            setCurrentStep(9);
          }
        }}
      >
        <div className="space-y-4">
          <Input
            autoFocus={true}
            id="neck"
            type="number"
            value={formData.neck}
            onChange={(e) => updateFormData("neck", e.target.value)}
            placeholder={`Enter your neck measurement`}
            required
            min={formData.unit === "metric" ? "20" : "8"}
            max={formData.unit === "metric" ? "80" : "32"}
            className="text-center text-lg"
          />
          <RainbowButton type="submit" className="w-full" disabled={!isValid}>
            Next
          </RainbowButton>
        </div>
      </form>
    </Step>
  );
}

export function BodyCompositionStep() {
  const { formData } = useFormStore();

  return (
    <motion.div initial="hidden" animate="visible" exit="hidden">
      <Results data={formData} />
    </motion.div>
  );
}
