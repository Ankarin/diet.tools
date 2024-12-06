"use server";

import { createClient } from "@/supabase/server";

export type FormData = {
	gender: "male" | "female" | "";
	age: string;
	unit: "metric" | "imperial" | "";
	height: string;
	heightFeet: string;
	heightInches: string;
	weight: string;
	goals: string;
	activity: string;
	medicalConditions: string;
	dietaryRestrictions: string;
	foodPreferences: string;
	dietaryApproach: string;
	mealPreparation: string;
};

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
}

export async function logout(): Promise<void> {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();

	if (error) throw new Error(`Logout failed: ${error.message}`);
}

export async function signup({
	email,
	password,
	origin,
	form,
}: {
	email: string;
	password: string;
	origin: string;
	form: FormData;
}) {
	try {
		const supabase = await createClient();
		const {
			data: { session },
			error: sessionError,
		} = await supabase.auth.getSession();

		if (sessionError) {
			return { error: sessionError.message };
		}

		if (session?.user?.is_anonymous) {
			const { error } = await supabase.auth.updateUser({
				email,
				password,
			});
			if (error) {
				return { error: error.message };
			}

			const { error: upsertError } = await supabase.from("users").upsert({
				id: session.user.id,
				email,
				...form,
			});

			if (upsertError) {
				return { error: upsertError.message };
			}
		} else {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${origin}/api/confirm-callback`,
				},
			});

			if (error) {
				return { error: error.message };
			}

			if (data?.user) {
				const { error: upsertError } = await supabase.from("users").upsert({
					id: data.user.id,
					email,
					...form,
				});

				if (upsertError) {
					return { error: upsertError.message };
				}
			}
		}

		return { success: true };
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error("Signup error:", error);
		return { error: error.message || "An error occurred during signup" };
	}
}

export async function forgot({
	email,
	origin,
}: {
	email: string;
	origin: string;
}) {
	const supabase = await createClient();
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${origin}/api/reset-callback`,
	});
	if (error) {
		return {
			error: error.message,
		};
	}
}

export async function reset({ password }: { password: string }) {
	const supabase = await createClient();
	const { error } = await supabase.auth.updateUser({
		password: password,
	});
	if (error) {
		return {
			error: error.message,
		};
	}
}
