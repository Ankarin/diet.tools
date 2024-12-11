"use server";

import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { FormData } from "@/store";
import { Resend } from "resend";

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

	const { data, error: signUpError } = await supabase.auth.signUp({
		email,
		password,
	});

	if (signUpError) {
		return { error: signUpError.message };
	}

	if (form) {
		const { error: profileError } = await supabase.from("users").upsert({
			id: data.user?.id,
			...form,
		});

		if (profileError) {
			return { error: profileError.message };
		}
	}

	const resend = new Resend(process.env.RESEND_API_KEY);
	resend.emails.send({
		from: "AI Diet Planner <hello@diet.tools>",
		to: "ankarn41k@gmail.com",
		subject: `New Signup: ${email}`,
		text: `New User Signup Details:
--------------------------
Email: ${email}

Profile Information:
------------------
Gender: ${form.gender || "Not specified"}
Age: ${form.age || "Not specified"}
Height: ${form.unit === "metric" ? `${form.height} cm` : `${form.heightFeet}'${form.heightInches}"`}
Weight: ${form.weight}${form.unit === "metric" ? " kg" : " lbs"}

Goals & Activity:
---------------
Fitness Goal: ${form.goals || "Not specified"}
Activity Level: ${form.activity || "Not specified"}

Health & Preferences:
------------------
Medical Conditions: ${form.medicalConditions || "None specified"}
Dietary Restrictions: ${form.dietaryRestrictions || "None specified"}
Food Preferences: ${form.foodPreferences || "None specified"}
Dietary Approach: ${form.dietaryApproach || "Not specified"}

Signup Time: ${new Date().toISOString()}`,
	});

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
