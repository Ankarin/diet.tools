"use client";
import { signup } from "@/app/api/actions/auth";
import { useFormStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import supabase from "@/supabase/client";
import { useState } from "react";

import RainbowButton from "@/components/ui/rainbow-button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const FormSchema = z
	.object({
		email: z.string().email({ message: "Must be valid email" }),
		password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
		confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters long" }),
		terms: z.boolean().refine((value) => value === true, {
			message: "You must agree to the terms and privacy policy",
		}),
	})
	.refine(
		(values) => {
			return values.password === values.confirmPassword;
		},
		{
			message: "Passwords do not match",
			path: ["confirmPassword"],
		},
	);

export default function Page() {
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			terms: false,
		},
	});

	const [isRedirecting, setIsRedirecting] = useState(false);
	const { mutate: signUp, isPending } = useMutation({
		mutationFn: async (values: z.infer<typeof FormSchema>) => {
			const result = await signup({
				email: values.email,
				password: values.password,
			});

			if (result?.error) {
				setIsRedirecting(false);
				toast({
					variant: "destructive",
					title: "Error",
					description: result.error,
				});
				return;
			}
		},
	});
	async function onSubmit(data: z.infer<typeof FormSchema>) {
		setIsRedirecting(true);
		signUp(data);
	}

	const isTermsChecked = form.watch("terms");

	return (
		<div>
			<Form {...form}>
				<p className={"font-semibold text-xl"}> Sign Up</p>
				<p className={"pb-4 pt-1"}>
					Already have an account ?{" "}
					<Link href={"/login"} className={"text-blue-600 cursor-pointer"}>
						Sign In
					</Link>
				</p>

				<form onSubmit={form.handleSubmit(onSubmit)} className="w-full pt-5  space-y-6">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input type={"password"} {...field} />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<Input type={"password"} {...field} />
								</FormControl>

								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="terms"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0">
								<FormControl>
									<Checkbox checked={field.value} onCheckedChange={field.onChange} />
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>
										I agree to the{" "}
										<Link href="/terms" className="text-blue-600 hover:underline">
											Terms of Use
										</Link>{" "}
										and{" "}
										<Link href="/privacy" className="text-blue-600 hover:underline">
											Privacy Policy
										</Link>
									</FormLabel>
									<FormMessage />
								</div>
							</FormItem>
						)}
					/>

					{(isPending || isRedirecting) ? (
						<div className="flex justify-center">
							<Loader2 className="h-10 w-10 animate-spin" />
						</div>
					) : (
						<RainbowButton type="submit" className="w-full" disabled={isPending || isRedirecting || !isTermsChecked}>
							Sign Up
						</RainbowButton>
					)}
				</form>
			</Form>
			{/* <br />
			<RainbowButton
				colorScheme="black"
				onClick={handleGoogleSignUp}
				className="w-full"
				disabled={!isTermsChecked}
			>
				Sign up with Google
			</RainbowButton> */}
		</div>
	);
}
