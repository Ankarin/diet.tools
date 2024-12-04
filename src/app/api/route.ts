import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  console.log(code);
  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
    console.log(123123, supabase);
    console.log(44, requestUrl.origin);

    return NextResponse.redirect(`https://www.keyguests.com/en/me`, 301);
  }
  return NextResponse.redirect(`${requestUrl.origin}/`, 301);
}
