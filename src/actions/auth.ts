"use server";
import { createClient } from "@/supabase/server";

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<void | string> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
}

export async function logout(): Promise<void | string> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) return error.message;
}

export async function signup({
  email,
  password,
  origin,
}: {
  email: string;
  password: string;
  origin: string;
}): Promise<void | string> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/confirm-callback`,
    },
  });

  if (error) throw error;
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
  if (error) throw error;
  else {
    return "success";
  }
}

export async function reset({
  password,
}: {
  password: string;
}): Promise<string | void> {
  const supabase = await createClient();
  const { error, data } = await supabase.auth.updateUser({
    password: password,
  });
  console.log(data);
  console.log(error);
  if (error) throw error;
}
