import {afterEach, describe, expect, it, vi} from "vitest";
import {checkContactRateLimit} from "./rate-limit";

const originalEnv = {...process.env};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  process.env = {...originalEnv};
});

describe("checkContactRateLimit", () => {
  it("allows local development without Upstash credentials", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.stubEnv("NODE_ENV", "development");

    await expect(checkContactRateLimit(new Request("http://localhost"))).resolves.toEqual({
      allowed: true,
    });
  });

  it("fails closed in production when Upstash is not configured", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    vi.stubEnv("NODE_ENV", "production");

    await expect(checkContactRateLimit(new Request("https://example.com"))).resolves.toEqual({
      allowed: false,
      unavailable: true,
    });
  });

  it("blocks requests after the configured threshold", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({result: [6, 420]}), {status: 200}),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      checkContactRateLimit(
        new Request("https://example.com", {headers: {"x-real-ip": "203.0.113.10"}}),
      ),
    ).resolves.toEqual({allowed: false, retryAfterSeconds: 420});

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(options.headers).toMatchObject({Authorization: "Bearer test-token"});
    expect(String(options.body)).toContain("lazo-sur:contact:ip:");
    expect(String(options.body)).not.toContain("203.0.113.10");
  });

  it("fails closed when the Redis request fails", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network failure")));

    await expect(
      checkContactRateLimit(
        new Request("https://example.com", {headers: {"x-real-ip": "203.0.113.10"}}),
      ),
    ).resolves.toEqual({allowed: false, unavailable: true});
  });

  it("does not trust forwarded IP headers in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      checkContactRateLimit(
        new Request("https://example.com", {headers: {"x-forwarded-for": "203.0.113.10"}}),
      ),
    ).resolves.toEqual({allowed: false, unavailable: true});

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
