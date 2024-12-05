"use client";
import { toast } from "@/components/ui/use-toast";
import { login } from "@/app/api/actions/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import supabase from "@/supabase/client";
import RainbowButton from "@/components/ui/rainbow-button";

const FormSchema = z.object({
	email: z.string().email({ message: "Must be valid email" }),
	password: z.string().min(8, { message: "Password is required" }),
});

export default function Page() {
	const router = useRouter();
	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { mutate, isPending } = useMutation({
		mutationFn: login,

		onSuccess: () => {
			router.replace("/me");
		},
		onSettled: (res) => {
			if (res.error) {
				toast({
					variant: "destructive",
					title: res.error,
				});
			}
		},
	});

	async function onSubmit(data: z.infer<typeof FormSchema>) {
		// @ts-ignore
		mutate(data);
	}

	const handleGoogleSignIn = async () => {
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: "https://www.diet.tools/api/google-callback",
			},
		});

		if (error) {
			console.error("Error signing in with Google:", error);
			toast({
				variant: "destructive",
				title: "Google Sign-In Error",
				description: error.message,
			});
		} else {
			console.log("Successfully signed in:", data);
			router.replace("/me");
		}
	};

	return (
		<Form {...form}>
			<p className={"font-semibold text-xl"}>Login</p>
			<p className={"pb-4 pt-1"}>
				Don&apos;t have an account ?{" "}
				<Link href={"/signup"} className={"text-blue-600 cursor-pointer"}>
					Sign Up
				</Link>
			</p>

			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="w-full pt-5  space-y-6"
			>
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
				<Link href={"/forgot"} className={"text-blue-600 cursor-pointer "}>
					Forgot password
				</Link>

				<br />

				{isPending ? (
					<Loader2 className="h-10 w-10 animate-spin" />
				) : (
					<RainbowButton type="submit" className="w-full">
						Login
					</RainbowButton>
				)}
			</form>
			<br />
			<RainbowButton
				onClick={handleGoogleSignIn}
				colorScheme="black"
				className="w-full"
			>
				Login with Google
			</RainbowButton>
		</Form>
	);
}
