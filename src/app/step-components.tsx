import Results from "@/app/form/results";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import RainbowButton from "@/components/ui/rainbow-button";
import { useFormStore } from "@/store";
import { ArrowLeft } from "lucide-react";

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

const sliderVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
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

  const handleGenderSelection = (gender: string) => (e: React.MouseEvent) => {
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

export function AgeStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const age = parseInt(formData.age);
    setIsValid(formData.age !== "" && age > 0 && age <= 120);
  }, [formData.age]);

  return (
    <Step title="How old are you?">
      <div className="space-y-4">
        <Input
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
          onClick={() => setCurrentStep(3)}
          className="w-full"
          disabled={!isValid}
        >
          Next
        </RainbowButton>
      </div>
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
      <div className="space-y-4">
        {formData.unit === "metric" ? (
          <Input
            id="height"
            type="number"
            value={formData.height}
            onChange={(e) => updateFormData("height", e.target.value)}
            placeholder="Enter your height "
            required
            min="50"
            max="300"
            className="text-center text-lg"
          />
        ) : (
          <div className="flex space-x-2">
            <Input
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
        <RainbowButton
          onClick={() => setCurrentStep(5)}
          className="w-full"
          disabled={!isValid}
        >
          Next
        </RainbowButton>
      </div>
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
      <div className="space-y-4">
        <Input
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
        <RainbowButton
          onClick={() => setCurrentStep(6)}
          className="w-full"
          disabled={!isValid}
        >
          Next
        </RainbowButton>
      </div>
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
      <div className="space-y-4">
        <Input
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
        <RainbowButton
          onClick={() => setCurrentStep(7)}
          className="w-full"
          disabled={!isValid}
        >
          Next
        </RainbowButton>
      </div>
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
      <div className="space-y-4">
        <Input
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
        <RainbowButton
          onClick={() => setCurrentStep(8)}
          className="w-full"
          disabled={!isValid}
        >
          Next
        </RainbowButton>
      </div>
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
      <div className="space-y-4">
        <Input
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
        <RainbowButton
          onClick={() => setCurrentStep(9)}
          className="w-full"
          disabled={!isValid}
        >
          Next
        </RainbowButton>
      </div>
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

export function ActivityLevelStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();

  return (
    <Step title="What's your activity level?">
      <RadioGroup
        value={formData.activityLevel}
        onValueChange={(value) => {
          updateFormData("activityLevel", value);
          setCurrentStep(10);
        }}
        className="space-y-4"
      >
        {[
          { value: "sedentary", label: "Sedentary" },
          { value: "lightly-active", label: "Lightly Active" },
          { value: "moderately-active", label: "Moderately Active" },
          { value: "very-active", label: "Very Active" },
        ].map((item) => (
          <div
            key={item.value}
            className="flex items-center space-x-2 bg-secondary/50 p-4 rounded-lg hover:bg-secondary/70 transition-colors"
          >
            <RadioGroupItem
              value={item.value}
              id={item.value}
              className="text-primary"
            />
            <Label htmlFor={item.value} className="flex-grow cursor-pointer">
              {item.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </Step>
  );
}

export function DietaryRestrictionsStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();

  return (
    <Step title="Do you have any dietary restrictions?">
      <div className="space-y-4">
        {[
          "Vegetarian",
          "Vegan",
          "Gluten-Free",
          "Dairy-Free",
          "Keto",
          "Paleo",
        ].map((diet) => (
          <div
            key={diet}
            className="flex items-center space-x-2 bg-secondary/50 p-4 rounded-lg hover:bg-secondary/70 transition-colors"
          >
            <input
              type="checkbox"
              id={diet.toLowerCase()}
              value={diet}
              checked={formData.dietaryRestrictions.includes(diet)}
              onChange={(e) => {
                const updatedRestrictions = e.target.checked
                  ? [...formData.dietaryRestrictions, diet]
                  : formData.dietaryRestrictions.filter(
                      (item) => item !== diet,
                    );
                updateFormData("dietaryRestrictions", updatedRestrictions);
              }}
              className="text-primary focus:ring-primary"
            />
            <Label
              htmlFor={diet.toLowerCase()}
              className="flex-grow cursor-pointer"
            >
              {diet}
            </Label>
          </div>
        ))}
        <RainbowButton onClick={() => setCurrentStep(11)} className="w-full">
          Next
        </RainbowButton>
      </div>
    </Step>
  );
}

export function AllergiesStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();

  return (
    <Step title="Do you have any food allergies?">
      <div className="space-y-4">
        <Textarea
          id="allergies"
          value={formData.allergies}
          onChange={(e) => updateFormData("allergies", e.target.value)}
          placeholder="List any food allergies you have"
          className="min-h-[100px]"
        />
        <RainbowButton onClick={() => setCurrentStep(12)} className="w-full">
          Next
        </RainbowButton>
      </div>
    </Step>
  );
}

export function HealthGoalsStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(formData.healthGoals.trim() !== "");
  }, [formData.healthGoals]);

  return (
    <Step title="What are your health goals?">
      <div className="space-y-4">
        <Textarea
          id="healthGoals"
          value={formData.healthGoals}
          onChange={(e) => updateFormData("healthGoals", e.target.value)}
          placeholder="Describe your health goals"
          required
          className="min-h-[100px]"
        />
        <RainbowButton
          onClick={() => setCurrentStep(13)}
          className="w-full"
          disabled={!isValid}
        >
          Next
        </RainbowButton>
      </div>
    </Step>
  );
}

export function MealPreferencesStep() {
  const { formData, updateFormData, setCurrentStep } = useFormStore();

  return (
    <Step title="Any specific meal preferences?">
      <div className="space-y-4">
        <Textarea
          id="mealPreferences"
          value={formData.mealPreferences}
          onChange={(e) => updateFormData("mealPreferences", e.target.value)}
          placeholder="Describe your meal preferences"
          className="min-h-[100px]"
        />
        <RainbowButton onClick={() => setCurrentStep(14)} className="w-full">
          Next
        </RainbowButton>
      </div>
    </Step>
  );
}

export function CookingSkillStep() {
  const { formData, updateFormData } = useFormStore();

  return (
    <Step title="How would you rate your cooking skills?">
      <div className="space-y-6">
        <motion.div
          variants={sliderVariants}
          initial="hidden"
          animate="visible"
        >
          <Slider
            min={1}
            max={5}
            step={1}
            value={[parseInt(formData.cookingSkill) || 1]}
            onValueChange={(value) =>
              updateFormData("cookingSkill", value[0].toString())
            }
            className="w-full"
          />
        </motion.div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Beginner</span>
          <span>Intermediate</span>
          <span>Expert</span>
        </div>
      </div>
    </Step>
  );
}
