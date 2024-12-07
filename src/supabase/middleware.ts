import { createServerClient } from "@supabase/ssr";
import { isAfter } from "date-fns";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
	"/login",
	"/signup",
	"/forgot",
	"/confirm",
	"/1",
	"/2",
	"/3",
	"/4",
	"/5",
	"/6",
	"/7",
	"/8",
	"/9",
	"/10",
] as const;
const SUBSCRIPTION_ROUTE = "/me/subscription";
const PROFILE_ROUTE = "/me/profile";
const ME_ROUTE = "/me";
const LOGIN_ROUTE = "/login";
const CONTACT_ROUTE = "/contact";
const API_ROUTE = "/api";

interface UserMetadata {
	completed_profile?: boolean;
}

interface AppMetadata {
	subscription_expires?: string;
}

const createSupabaseClient = (request: NextRequest, response: NextResponse) => {
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
					cookiesToSet.forEach(({ name, value, options }) =>
						response.cookies.set(name, value, options),
					);
				},
			},
		},
	);
};

const isSubscriptionExpired = (subscriptionExpires?: string) => {
	return !subscriptionExpires || isAfter(new Date(), new Date(subscriptionExpires));
};

const hasValidSubscription = (subscriptionExpires?: string) => {
	return subscriptionExpires && isAfter(new Date(subscriptionExpires), new Date());
};

const redirectTo = (request: NextRequest, path: string) => {
	return NextResponse.redirect(new URL(path, request.url));
};

export const updateSession = async (request: NextRequest) => {
	try {
		const response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		});

		const path = request.nextUrl.pathname;

		// Fast path for numbered routes and root
		if (path === "/" || /^\/\d+$/.test(path)) {
			// Only handle root redirect, skip all other middleware checks
			if (path === "/") {
				return redirectTo(request, "/1");
			}
			return response;
		}

		// Allow public access to API routes
		if (request.nextUrl.pathname.startsWith(API_ROUTE)) {
			return response;
		}

		const supabase = createSupabaseClient(request, response);
		const {
			data: {
				session: { user },
			},
			error,
		} = await supabase.auth.getSession();

		// Handle unauthenticated access to protected routes
		if ((error || !user) && request.nextUrl.pathname.startsWith(ME_ROUTE)) {
			return redirectTo(request, LOGIN_ROUTE);
		}

		// Skip subscription checks for public routes
		if (PUBLIC_ROUTES.includes(request.nextUrl.pathname as any)) {
			return response;
		}

		// Check subscription status
		if (!user) {
			return response;
		}

		const { subscription_expires } = user.app_metadata as AppMetadata;
		const { completed_profile } = user.user_metadata as UserMetadata;

		// Check subscription status
		if (isSubscriptionExpired(subscription_expires)) {
			if (
				request.nextUrl.pathname !== SUBSCRIPTION_ROUTE &&
				request.nextUrl.pathname !== CONTACT_ROUTE
			) {
				return redirectTo(request, SUBSCRIPTION_ROUTE);
			}
		}

		// Check profile completion
		if (!completed_profile && request.nextUrl.pathname === ME_ROUTE) {
			return redirectTo(request, PROFILE_ROUTE);
		}

		// Redirect authenticated users with valid subscription away from public routes
		if (
			PUBLIC_ROUTES.includes(request.nextUrl.pathname as (typeof PUBLIC_ROUTES)[number]) &&
			hasValidSubscription(subscription_expires)
		) {
			return redirectTo(request, ME_ROUTE);
		}

		return response;
	} catch (e) {
		console.error("Middleware error:", e);
		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		});
	}
};
