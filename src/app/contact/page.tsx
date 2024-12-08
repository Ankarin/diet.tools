"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import supabase from "@/supabase/client";

const formSchema = z.object({
	email: z.string().email({ message: "Please enter a valid email" }),
	message: z.string().min(10, { message: "Message must be at least 10 characters" }),
});

export default function ContactPage() {
	const { toast } = useToast();
	const [isEmailPrepopulated, setIsEmailPrepopulated] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			message: "",
		},
	});

	useEffect(() => {
		const getUser = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				if (session?.user?.email) {
					form.setValue("email", session.user.email);
					setIsEmailPrepopulated(true);
				}
			} catch (error) {
				console.error("Error fetching user session:", error);
			}
		};

		getUser();
	}, [form.setValue]);

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error);
			}

			form.reset();

			toast({
				title: "Success!",
				description: "Your message has been sent.",
			});
		} catch (error: any) {
			toast({
				variant: "destructive",
				title: "Error",
				description: error.message,
			});
		}
	}

	return (
		<div className="h-[calc(100vh-65px)] bg-white dark:bg-zinc-950 flex items-center">
			<div className="container max-w-[600px] mx-auto px-4">
				<div className="mb-6 space-y-2">
					<h1 className="text-3xl font-bold tracking-tight">Get in touch</h1>
					<p className="text-zinc-500 dark:text-zinc-400">
						Have a question or a feedback? We&apos;d love to hear from you.
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-medium">Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="you@example.com"
											className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
											disabled={isEmailPrepopulated}
											readOnly={isEmailPrepopulated}
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="message"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-sm font-medium">Message</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Tell us what you're thinking about..."
											className="min-h-[120px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 resize-none"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-xs" />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? "Sending..." : "Send message"}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
