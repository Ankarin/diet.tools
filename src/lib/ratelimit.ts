import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = process.env.RATE_LIMIT ?? "30";
const ratelimitNumber = parseInt(ratelimit);

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(ratelimitNumber, "1h"),
});
