"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import supabase from "@/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { SubscribeButton } from "../subscription/subcribe-button";

export default function SettingsPage() {
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
		queryKey: ["subscription"],
		queryFn: async () => {
			const {
				data: {
					session: { user },
				},
			} = await supabase.auth.getSession();
			if (!user) throw new Error("No user found");

			const { data: subscription, error } = await supabase
				.from("subs")
				.select("*")
				.eq("id", user.id)
				.single();

			// If no subscription found, return null instead of throwing error
			if (error?.code === "PGRST116") {
				return null;
			}
			if (error) throw error;

			const isSubscribed = subscription?.subscription_expires
				? new Date(subscription.subscription_expires) > new Date()
				: false;

			return subscription
				? {
						isSubscribed,
						expiresAt: subscription?.subscription_expires,
						canceled: subscription?.canceled,
						requested_cancel: subscription?.requested_cancel,
					}
				: null;
		},
	});

	const { mutate: cancelSub, isPending: isCancelling } = useMutation({
		mutationFn: async () => {
			const {
				data: {
					session: { user },
				},
			} = await supabase.auth.getSession();
			if (!user) throw new Error("No user found");

			const { error } = await supabase
				.from("subs")
				.update({
					requested_cancel: true,
				})
				.eq("id", user.id);

			if (error) throw error;
			return { success: true };
		},
		onSuccess: () => {
			toast({
				title: "Success",
				description: "Your subscription has been cancelled",
			});
			queryClient.invalidateQueries({ queryKey: ["subscription"] });
		},
		onError: (error) => {
			toast({
				variant: "destructive",
				title: "Error",
				description: "Failed to cancel subscription",
			});
			console.error("Error cancelling subscription:", error);
		},
	});

	const handleCancelSubscription = () => {
		if (window.confirm("Are you sure you want to cancel your subscription?")) {
			cancelSub();
		}
	};

	if (isLoadingSubscription) {
		return (
			<div className="flex justify-center items-center min-h-[200px]">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-8">Settings</h1>

			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Subscription Status</CardTitle>
						<CardDescription>Manage your subscription settings</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{subscription ? (
								<>
									<p>
										<span className="font-medium">Status: </span>
										<span
											className={
												subscription.isSubscribed
													? "text-green-600"
													: "text-red-600"
											}
										>
											{subscription.isSubscribed ? "Active" : "Inactive"}
										</span>
										{subscription.canceled && (
											<span className="ml-2 text-yellow-600">
												(Cancelled - Access until expiration)
											</span>
										)}
									</p>
									{subscription.expiresAt && (
										<p>
											<span className="font-medium">Expires: </span>
											{new Date(subscription.expiresAt).toLocaleDateString()}
										</p>
									)}
								</>
							) : (
								<p>You don&apos;t have an active subscription.</p>
							)}
						</div>
					</CardContent>
					<CardFooter>
						{subscription?.isSubscribed && !subscription?.canceled ? (
							<Button
								variant="destructive"
								onClick={handleCancelSubscription}
								disabled={isCancelling}
							>
								{isCancelling ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Cancelling...
									</>
								) : (
									"Cancel Subscription"
								)}
							</Button>
						) : subscription?.canceled ? (
							<p className="text-sm text-muted-foreground">
								Your subscription will remain active until the expiration date.
							</p>
						) : (
							<SubscribeButton />
						)}
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
