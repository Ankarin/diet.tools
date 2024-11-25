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

function handleAuthError(error: Error): never {
  console.error("Auth Error:", error);
  throw new Error(error.message);
}

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    handleAuthError(error);
  }
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    handleAuthError(error);
  }
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

  if (error) {
    handleAuthError(error);
  }

  const res = await supabase.from("users").upsert({
    id: data?.user?.id,
    email,
    ...form,
  });

  if (res.error) {
    handleAuthError(res.error);
  }
}

export async function forgot({
  email,
  origin,
}: {
  email: string;
  origin: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/reset-callback`,
  });

  if (error) {
    handleAuthError(error);
  }
}

export async function reset({ password }: { password: string }): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    handleAuthError(error);
  }
}
