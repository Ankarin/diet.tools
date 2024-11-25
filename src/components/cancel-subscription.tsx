"use client";

import supabase from "@/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function CancelSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("cancel-subscription");
      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been successfully cancelled.",
      });
      router.refresh();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCancelSubscription}
      disabled={isLoading}
      variant="destructive"
    >
      {isLoading ? "Cancelling..." : "Cancel Subscription"}
    </Button>
  );
}
