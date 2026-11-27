import {createHash} from "node:crypto";

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_SECONDS = 10 * 60;

const INCREMENT_WITH_TTL = [
  "local count = redis.call('INCR', KEYS[1])",
  "if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end",
  "local ttl = redis.call('TTL', KEYS[1])",
  "return {count, ttl}",
].join("\n");

type RedisResponse = {
  result?: [number, number];
  error?: string;
};

export type RateLimitResult =
  | {allowed: true}
  | {allowed: false; retryAfterSeconds: number}
  | {allowed: false; unavailable: true};

function getTrustedClientIp(request: Request): string | null {
  // Vercel sets x-real-ip at its ingress. Do not trust arbitrary forwarded
  // headers in production: clients can supply x-forwarded-for themselves.
  const platformIp = request.headers.get("x-real-ip")?.trim();
  if (platformIp && platformIp.length <= 64) return platformIp;

  // Local development has no trusted reverse proxy.
  if (process.env.NODE_ENV !== "production") return "local-development";

  return null;
}

export async function checkContactRateLimit(request: Request): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return process.env.NODE_ENV === "production"
      ? {allowed: false, unavailable: true}
      : {allowed: true};
  }

  const ip = getTrustedClientIp(request);
  if (!ip) return {allowed: false, unavailable: true};

  const ipHash = createHash("sha256").update(ip).digest("hex");
  const key = `lazo-sur:contact:ip:${ipHash}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        INCREMENT_WITH_TTL,
        "1",
        key,
        String(CONTACT_WINDOW_SECONDS),
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) throw new Error("Upstash request failed.");

    const payload = (await response.json()) as RedisResponse;
    if (payload.error || !Array.isArray(payload.result)) {
      throw new Error("Upstash returned an invalid response.");
    }

    const [count, ttl] = payload.result;
    if (!Number.isInteger(count) || !Number.isInteger(ttl) || ttl < 0) {
      throw new Error("Upstash returned an invalid counter.");
    }

    return count > CONTACT_LIMIT
      ? {allowed: false, retryAfterSeconds: Math.max(1, ttl)}
      : {allowed: true};
  } catch {
    // Fail closed: a Redis outage must not silently disable production limits.
    return {allowed: false, unavailable: true};
  }
}
