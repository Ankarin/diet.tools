import { createClient } from "@/supabase/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createSafeActionClient } from "next-safe-action";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(30, "1m"),
});

export const actionClient = createSafeActionClient()
  .use(async ({ next }) => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getSession();
    console.log("user", data.session.user);
    if (error) {
      throw new Error("Unauthorized");
    }
    const user = data.session?.user;
    return next({ ctx: { user } });
  })
  .use(async ({ next, ctx }) => {
    const { user } = ctx;
    const { success } = await rateLimiter.limit(user.id);
    if (!success) {
      console.log("Rate limit exceeded");
      throw new Error("Rate limit exceeded");
    }
    return next();
  });
