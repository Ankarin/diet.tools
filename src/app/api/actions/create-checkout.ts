"use server";

import { actionClient } from "@/lib/actions";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const checkoutSchema = z.object({
	priceId: z.string(),
});

export const createCheckoutSession = actionClient
	.schema(checkoutSchema)
	.action(async ({ parsedInput, ctx }): Promise<{ sessionId: string }> => {
		try {
			const { priceId } = parsedInput;

			const user = ctx.user;

			const session = await stripe.checkout.sessions.create({
				customer_email: user.email,
				payment_method_types: ["card"],
				line_items: [
					{
						price: priceId,
						quantity: 1,
					},
				],
				mode: "subscription",
				success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
				cancel_url: `${process.env.NEXT_PUBLIC_URL}/me`,
				allow_promotion_codes: true,
			});

			return { sessionId: session.id };
		} catch (error) {
			console.error("Error creating checkout session:", error);
			throw error;
		}
	});
