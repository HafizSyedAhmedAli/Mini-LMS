import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";
import { signSession, verifySession } from "./session";

describe("password", () => {
  it("hashes (never plaintext) and verifies", async () => {
    const hash = await hashPassword("s3cret-pass");
    expect(hash).not.toContain("s3cret-pass");
    expect(await verifyPassword("s3cret-pass", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("session", () => {
  it("round-trips and rejects tampering", async () => {
    const token = await signSession("admin-1");
    expect(await verifySession(token)).toEqual({ sub: "admin-1" });
    expect(await verifySession(token.slice(0, -2) + "xx")).toBeNull();
    expect(await verifySession(undefined)).toBeNull();
  });
});
