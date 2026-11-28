import { afterEach, describe, expect, it } from "vitest";
import { isAdmin } from "./auth-utils";

const originalAdminEmails = process.env.ADMIN_EMAILS;

afterEach(() => {
  if (originalAdminEmails === undefined) {
    delete process.env.ADMIN_EMAILS;
  } else {
    process.env.ADMIN_EMAILS = originalAdminEmails;
  }
});

describe("isAdmin", () => {
  it("authorizes emails included in the server allowlist", () => {
    process.env.ADMIN_EMAILS = "owner@example.com";

    expect(isAdmin("owner@example.com")).toBe(true);
    expect(isAdmin("other@example.com")).toBe(false);
  });

  it("compares emails without case sensitivity or surrounding whitespace", () => {
    process.env.ADMIN_EMAILS = " Owner@Example.com , other@example.com ";

    expect(isAdmin("owner@example.com")).toBe(true);
    expect(isAdmin(" OTHER@example.com ")).toBe(true);
  });

  it("rejects missing emails and an empty allowlist", () => {
    process.env.ADMIN_EMAILS = "";

    expect(isAdmin("owner@example.com")).toBe(false);
    expect(isAdmin(null)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});
