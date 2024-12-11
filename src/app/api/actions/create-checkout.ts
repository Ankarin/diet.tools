"use server";

import { actionClient } from "@/lib/actions";
import { Resend } from "resend";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);
const checkoutSchema = z.object({
	priceId: z.string(),
});

export const createCheckoutSession = actionClient
	.schema(checkoutSchema)
	.action(async ({ parsedInput, ctx }): Promise<{ sessionId: string }> => {
		try {
			const { priceId } = parsedInput;

			const user = ctx.user;
			await resend.emails.send({
				from: "AI Diet Planner <hello@diet.tools>",
				to: "ankarn41k@gmail.com",
				subject: `Start checkout: ${user.email}`,
				text: `User ${user.email} started checkout`,
			});
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
				subscription_data: {
					trial_period_days: 7,
				},
			});

			return { sessionId: session.id };
		} catch (error) {
			console.error("Error creating checkout session:", error);
			throw error;
		}
	});
