"use server";

import { actionClient } from "@/lib/actions";
import { createClient } from "@/supabase/server";
import { z } from "zod";

const cancelSubscriptionSchema = z.object({});

export const cancelSubscription = actionClient
  .schema(cancelSubscriptionSchema)
  .action(async ({ ctx }) => {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error("Failed to get user");
      }

      if (!user) {
        throw new Error("No user found");
      }

      // Here you would typically interact with your payment provider's API to cancel the subscription
      // For this example, we'll just update the user's metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { subscription_expires: null },
      });

      if (updateError) {
        throw new Error("Failed to cancel subscription");
      }

      return { message: "Subscription cancelled successfully" };
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  });
