import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { addMonths } from "date-fns";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: Request) {
  const body = await req.text();
  const heads = await headers();
  const sig = heads.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "No Stripe signature found" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log("Received event:", event.type);

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session
      );
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const customerEmail = session.customer_details?.email;
  if (!customerEmail) {
    console.error("No customer email found in the session");
    return;
  }

  await updateUserSubscription(customerEmail, true);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerEmail = invoice.customer_email;
  if (!customerEmail) {
    console.error("No customer email found in the invoice");
    return;
  }

  await updateUserSubscription(customerEmail, false);
}

async function updateUserSubscription(
  customerEmail: string,
  isNewSubscription: boolean
) {
  try {
    // Fetch user ID from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError || "User not found");
      return;
    }

    const userId = userData.id;

    // Calculate new expiration date
    const newExpirationDate = addMonths(new Date(), 1);

    // Fetch current app_metadata
    const { data: currentUser, error: currentUserError } =
      await supabase.auth.admin.getUserById(userId);

    if (currentUserError || !currentUser) {
      console.error(
        "Error fetching current user:",
        currentUserError || "User not found"
      );
      return;
    }

    const currentMetadata = currentUser.user.app_metadata || {};

    // Update app_metadata
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      app_metadata: {
        ...currentMetadata,
        subscription_expires: newExpirationDate.toISOString(),
      },
    });

    if (error) {
      console.error("Error updating user app_metadata:", error);
    } else {
      console.log("User subscription updated successfully:", data);
    }

    // Handle additional logic for new subscriptions or renewals
    if (isNewSubscription) {
      console.log("New subscription created for user:", userId);
      // Add any additional logic for new subscriptions
    } else {
      console.log("Subscription renewed for user:", userId);
      // Add any additional logic for renewals
    }
  } catch (error) {
    console.error("Error in updateUserSubscription:", error);
  }
}
