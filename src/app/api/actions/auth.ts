"use server";

import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { FormData } from "@/store";

export async function login({
	email,
	password,
}: {
	email: string;
	password: string;
}) {
	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});
	if (error) {
		return { error: error.message };
	}

	redirect("/me");
}

export async function logout(): Promise<void> {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();

	if (error) throw new Error(`Logout failed: ${error.message}`);

	redirect("/");
}

export async function signup({
	email,
	password,
	form,
}: {
	email: string;
	password: string;
	form: FormData;
}) {
	const supabase = await createClient();

	const { error: signUpError } = await supabase.auth.signUp({
		email,
		password,
	});

	if (signUpError) {
		return { error: signUpError.message };
	}

	if (form) {
		const { error: profileError } = await supabase
			.from("profiles")
			.update({
				form_data: form,
			})
			.eq("id", (await supabase.auth.getUser()).data.user?.id);

		if (profileError) {
			return { error: profileError.message };
		}
	}

	redirect("/me");
}

export async function forgot({
	email,
}: {
	email: string;
}) {
	const supabase = await createClient();
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: "/reset-password",
	});

	if (error) {
		return { error: error.message };
	}

	redirect("/check-email");
}

export async function reset({ password }: { password: string }) {
	const supabase = await createClient();
	const { error } = await supabase.auth.updateUser({
		password,
	});

	if (error) {
		return { error: error.message };
	}

	redirect("/me");
}
