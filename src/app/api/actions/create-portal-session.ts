"use server";

import { actionClient } from "@/lib/actions";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createPortalSession = actionClient.action(
  async ({ ctx }): Promise<{ url: string }> => {
    try {
      const user = ctx.user;

      // Find the Stripe customer by email
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      const customer = customers.data[0];
      if (!customer) {
        throw new Error("No Stripe customer found for this user");
      }

      // Create a billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${process.env.NEXT_PUBLIC_URL}/me/settings`,
      });

      return { url: session.url };
    } catch (error) {
      console.error("Error creating portal session:", error);
      throw new Error("Failed to create portal session");
    }
  }
);
