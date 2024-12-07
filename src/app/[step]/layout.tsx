"use client";

import { useFormStore } from "@/store";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React from "react";

export default function StepLayout({
	children,
}: {
	children: React.ReactNode;
	params: { step: string };
}) {
	const router = useRouter();
	const { currentStep } = useFormStore();
	const totalSteps = 10;
	const progress = (currentStep / totalSteps) * 100;

	const handleNext = () => {
		if (currentStep < totalSteps) {
			router.push(`/${currentStep + 1}`);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			router.push(`/${currentStep - 1}`);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<div className="fixed top-0 left-0 w-full h-1 bg-gray-200">
				<motion.div
					className="h-full bg-primary"
					initial={{ width: 0 }}
					animate={{ width: `${progress}%` }}
					transition={{ duration: 0.5 }}
				/>
			</div>
			<main className="flex-grow flex items-center justify-center py-12 px-4">
				<div className="w-full max-w-3xl">
					<div className="mt-6 md:mt-12">
						{children}
						<div className="mt-8 flex justify-between items-center">
							<Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
								Back
							</Button>
							<p className="text-sm text-muted-foreground">
								Step {currentStep} of {totalSteps}
							</p>
							<Button onClick={handleNext} disabled={currentStep === totalSteps}>
								{currentStep === totalSteps ? "Complete" : "Next"}
							</Button>
						</div>
					</div>
				</div>
			</main>
			<footer className="mt-auto py-8 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
					<div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-6 md:px-0">
						<p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
							&copy; {new Date().getFullYear()} Ai Diet Planner. All rights reserved.
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
