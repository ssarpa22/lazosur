import {afterEach, describe, expect, it} from "vitest";
import {isAdmin} from "./auth";

const originalAdminEmails = process.env.ADMIN_EMAILS;

afterEach(() => {
  if (originalAdminEmails === undefined) {
    delete process.env.ADMIN_EMAILS;
  } else {
    process.env.ADMIN_EMAILS = originalAdminEmails;
  }
});

describe("isAdmin", () => {
  it("requires both the server allowlist and the trusted app_metadata role", () => {
    process.env.ADMIN_EMAILS = "owner@example.com";
    expect(isAdmin("owner@example.com", {role: "admin"})).toBe(true);
    expect(isAdmin("owner@example.com", {role: "user"})).toBe(false);
    expect(isAdmin("owner@example.com", {})).toBe(false);
    expect(isAdmin("other@example.com", {role: "admin"})).toBe(false);
  });

  it("compares allowlisted emails without case sensitivity or whitespace", () => {
    process.env.ADMIN_EMAILS = " Owner@Example.com , other@example.com ";
    expect(isAdmin("owner@example.com", {role: "admin"})).toBe(true);
    expect(isAdmin("OTHER@example.com", {role: "admin"})).toBe(true);
  });

  it("does not trust a missing email, metadata, or an empty allowlist", () => {
    process.env.ADMIN_EMAILS = "";
    expect(isAdmin("owner@example.com", {role: "admin"})).toBe(false);
    process.env.ADMIN_EMAILS = "owner@example.com";
    expect(isAdmin(null, {role: "admin"})).toBe(false);
    expect(isAdmin("owner@example.com", null)).toBe(false);
  });
});
