"use client";

import React from "react";
import { createPortalSession } from "@/app/api/actions/create-portal-session";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

function Page() {
  const handleManageSubscription = async () => {
    try {
      const { data, serverError } = await createPortalSession({});
      if (serverError) {
        toast({
          variant: "destructive",
          title: "Error opening customer portal",
        });
        return;
      }
      window.location.href = data.url;
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Failed to open customer portal",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Subscription</h2>
          <Button onClick={handleManageSubscription}>
            Manage Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Page;
