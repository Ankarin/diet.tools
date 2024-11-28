import { createBrowserClient } from "@supabase/ssr";

const createClient = () =>
  createBrowserClient(
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

const supabase = createClient();

export default supabase;
