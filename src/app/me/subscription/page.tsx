"use client";

import { SubscribeButton } from "@/app/me/subscription/subcribe-button";
import {
	Sparkles,
	Brain,
	ChefHat,
	Target,
	BarChart3,
	Clock,
	Star,
	CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import supabase from "@/supabase/client";

const features = [
	{
		icon: Brain,
		title: "AI-Powered Meal Plans",
		description:
			"Get personalized daily and weekly meal plans generated by advanced AI, tailored to your exact preferences and needs",
	},
	{
		icon: ChefHat,
		title: "Smart Recipe Generation",
		description:
			"Receive detailed recipes with ingredients and instructions, perfectly matched to your dietary requirements",
	},
	{
		icon: Target,
		title: "Personalized Nutrition",
		description:
			"Plans adapted to your body metrics, goals, dietary restrictions, and food preferences",
	},
	{
		icon: BarChart3,
		title: "Nutritional Analysis",
		description: "Get detailed calorie and macro breakdowns for every meal in your plan",
	},
	{
		icon: Clock,
		title: "Weekly Planning",
		description: "Access comprehensive weekly meal plans to streamline your nutrition journey",
	},
	{
		icon: Sparkles,
		title: "Shopping Lists",
		description: "Get organized shopping lists with all ingredients needed for your meal plans",
	},
];

const testimonials = [
	{
		name: "Sarah M.",
		role: "Fitness Enthusiast",
		content:
			"This AI meal planner has completely transformed my approach to nutrition. I've lost 15 pounds while enjoying every meal!",
		image: "https://randomuser.me/api/portraits/women/1.jpg",
	},
	{
		name: "Michael R.",
		role: "Busy Professional",
		content:
			"The time I save on meal planning is incredible. Plus, the recipes are delicious and fit perfectly with my workout routine.",
		image: "https://randomuser.me/api/portraits/men/1.jpg",
	},
	{
		name: "Emma L.",
		role: "Health Coach",
		content:
			"I recommend this to all my clients. The AI-powered customization is unlike anything I've seen before.",
		image: "https://randomuser.me/api/portraits/women/2.jpg",
	},
];

export default function SubscribePage() {
	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};
	useEffect(() => {
		setEmail();
	}, []);
	const setEmail = async () => {
		const user = await supabase.auth.getUser();
		await supabase.from("users").upsert({ id: user.data.user.id, email: user.data.user.email });
	};

	const item = {
		hidden: { opacity: 0, y: 20 },
		show: { opacity: 1, y: 0 },
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
			{/* Hero Section */}
			<div className="flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 sm:pb-16 items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center w-full"
				>
					<h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
						Diet Plan
					</h1>
					<p className="mt-4 sm:mt-6 text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto px-2">
						Join thousands of happy customers who have transformed their lives with our AI-powered
						personalized nutrition platform.
					</p>
				</motion.div>

				{/* Price Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="mt-8 sm:mt-12 w-full max-w-md mx-auto px-2"
				>
					<div className="relative">
						<div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/60 rounded-2xl blur opacity-25" />
						<div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
							<div className="px-4 py-6 sm:p-10 sm:pb-6">
								<div className="flex justify-center">
									<span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
										Limited Time Offer
									</span>
								</div>
								<div className="mt-4 flex flex-col items-center">
									<div className="text-gray-400 text-lg mb-1">
										<span className="line-through">$15/month</span>
									</div>
									<div className="flex justify-center items-baseline text-6xl font-extrabold">
										<span className="text-gray-900">$10</span>
										<span className="ml-1 text-2xl text-gray-500">/month</span>
									</div>
								</div>
								<p className="mt-4 text-center text-gray-500">
									Cancel anytime • No commitment required
								</p>
							</div>
							<div className="px-6 pt-6 pb-8 bg-gray-50 sm:px-10 sm:py-10">
								<div className="flex flex-col gap-4 text-gray-600">
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-5 w-5 text-primary" />
										<span>Unlimited AI-generated meal plans</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-5 w-5 text-primary" />
										<span>Daily and weekly meal planning</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-5 w-5 text-primary" />
										<span>Personalized nutrition and recipes</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-5 w-5 text-primary" />
										<span>Detailed macro breakdowns</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-5 w-5 text-primary" />
										<span>Smart shopping lists</span>
									</div>
									<div className="flex items-center gap-2">
										<CheckCircle2 className="h-5 w-5 text-primary" />
										<span>Recipe instructions and tips</span>
									</div>
								</div>
								<div className="mt-8">
									<SubscribeButton />
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Features Grid */}
				<motion.div
					variants={container}
					initial="hidden"
					animate="show"
					className="mt-8 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-0"
				>
					{features.map((feature, index) => (
						<motion.div
							key={index}
							variants={item}
							className="relative bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
						>
							<div className="flex items-start gap-4">
								<div className="flex-shrink-0">
									<feature.icon className="h-6 w-6 text-primary" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
									<p className="mt-2 text-sm text-gray-600">{feature.description}</p>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* Testimonials */}
				<div className="mt-24">
					<h2 className="text-3xl font-bold text-center text-gray-900 mb-12">What Our Users Say</h2>
					<motion.div
						variants={container}
						initial="hidden"
						animate="show"
						className="grid grid-cols-1 md:grid-cols-3 gap-8"
					>
						{testimonials.map((testimonial, index) => (
							<motion.div
								key={index}
								variants={item}
								className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
							>
								<div className="flex items-center mb-4">
									<Image
										src={testimonial.image}
										alt={testimonial.name}
										width={48}
										height={48}
										className="h-12 w-12 rounded-full"
									/>
									<div className="ml-4">
										<h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
										<p className="text-gray-600">{testimonial.role}</p>
									</div>
								</div>
								<div className="flex mb-4">
									{[...Array(5)].map((_, i) => (
										<Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
									))}
								</div>
								<p className="text-gray-700">{testimonial.content}</p>
							</motion.div>
						))}
					</motion.div>
				</div>

				{/* Final CTA */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
					className="mt-24 text-center"
				>
					<h2 className="text-3xl font-bold text-gray-900">Ready to Transform Your Diet?</h2>
					<p className="mt-4 text-xl text-gray-600">
						Join now and get your first personalized meal plan in minutes.
					</p>
					<div className="mt-8">
						<SubscribeButton />
					</div>
				</motion.div>
			</div>
		</div>
	);
}
