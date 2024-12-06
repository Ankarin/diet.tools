"use client";

import RainbowButton from "@/components/ui/rainbow-button";
import { toast } from "@/components/ui/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { createCheckoutSession } from "@/app/api/actions/create-checkout";

export function SubscribeButton() {
	const [isLoading, setIsLoading] = useState(false);

	const handleSubscribe = async () => {
		setIsLoading(true);
		const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? "";
		try {
			const { data, serverError } = await createCheckoutSession({ priceId });
			if (serverError) {
				toast({
					variant: "destructive",
					title: "Error creating checkout session",
				});
			}
			const sessionId = data.sessionId;
			const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
			await stripe.redirectToCheckout({ sessionId });
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<RainbowButton className="w-full" onClick={handleSubscribe} disabled={isLoading}>
			{isLoading ? "Processing..." : "Subscribe Now"}
		</RainbowButton>
	);
}
