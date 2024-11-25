import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isAfter } from "date-fns";

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const user = await supabase.auth.getUser();
    if (!user.error && user.data.user) {
      console.log("user", user.data.user.app_metadata);
      const subscriptionExpires =
        user.data.user.app_metadata.subscription_expires;

      if (
        !subscriptionExpires ||
        isAfter(new Date(), new Date(subscriptionExpires))
      ) {
        if (request.nextUrl.pathname !== "/me/subscription") {
          return NextResponse.redirect(
            new URL("/me/subscription", request.url),
          );
        }
      }
    }

    if (!user.error && user.data.user) {
      console.log("user", user.data.user.user_metadata);
      const completed = user.data.user.user_metadata.completed_profile;

      if (!completed) {
        if (request.nextUrl.pathname === "/me") {
          return NextResponse.redirect(new URL("/me/profile", request.url));
        }
      }
    }
    if (request.nextUrl.pathname.startsWith("/me") && user.error) {
      console.log(1);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (
      ["/", "/login", "/signup", "/forgot", "/confirm"].includes(
        request.nextUrl.pathname,
      ) &&
      !user.error &&
      user.data.user?.app_metadata.subscription_expires &&
      isAfter(
        new Date(user.data.user.app_metadata.subscription_expires),
        new Date(),
      )
    ) {
      return NextResponse.redirect(new URL("/me", request.url));
    }

    return response;
  } catch (e) {
    console.log(e);
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
