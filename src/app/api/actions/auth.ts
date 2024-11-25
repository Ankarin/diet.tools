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
    throw new Error(`Login failed: ${error.message}`);
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
}): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/confirm-callback`,
    },
  });

  if (error) throw new Error(`Signup failed: ${error.message}`);

  const { error: upsertError } = await supabase.from("users").upsert({
    id: data?.user?.id,
    email,
    ...form,
  });

  if (upsertError)
    throw new Error(`User data update failed: ${upsertError.message}`);
}

export async function forgot({
  email,
  origin,
}: {
  email: string;
  origin: string;
}): Promise<string> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/reset-callback`,
  });
  if (error) throw new Error(`Password reset request failed: ${error.message}`);
  return "success";
}

export async function reset({ password }: { password: string }): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password,
  });
  if (error) throw new Error(`Password reset failed: ${error.message}`);
}
