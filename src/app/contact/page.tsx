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

const formSchema = z.object({
	name: z.string().min(2, { message: "Name must be at least 2 characters" }),
	email: z.string().email({ message: "Please enter a valid email" }),
	message: z
		.string()
		.min(10, { message: "Message must be at least 10 characters" }),
});

export default function ContactPage() {
	const { toast } = useToast();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			email: "",
			message: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		try {
			console.log(data);
			toast({
				title: "✨ Message sent",
				description: "We'll get back to you soon!",
				className: "bg-black text-white border-none",
			});
			form.reset();
		} catch (error) {
			console.error("Contact form submission error:", error);
			toast({
				title: "Something went wrong",
				description: "Please try again later",
				variant: "destructive",
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
						<div className="grid gap-4 sm:grid-cols-2">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Your name"
												className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
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
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-xs" />
									</FormItem>
								)}
							/>
						</div>
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
						<Button
							type="submit"
							className="w-full"
						>
							Send message
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
