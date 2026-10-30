import request from "supertest";
import { describe, expect, it } from "vitest";
import { loginAgent, server } from "../helpers/server";

const protectedRoutes = [
  ["get", "/api/auth/me"],
  ["get", "/api/people"],
  ["post", "/api/people"],
  ["get", "/api/attendance"],
  ["post", "/api/attendance"],
  ["get", "/api/fees?personId=x"],
  ["post", "/api/fees"],
  ["get", "/api/fees/balances"],
  ["get", "/api/dashboard"],
] as const;

describe("auth", () => {
  it.each(protectedRoutes)("%s %s requires a session", async (method, path) => {
    await request(server)[method](path).expect(401);
  });

  it("rejects bad credentials the same way for unknown email and wrong password", async () => {
    const a = await request(server)
      .post("/api/auth/login")
      .send({ email: "nobody@x.com", password: "x" });
    const b = await request(server)
      .post("/api/auth/login")
      .send({ email: process.env.ADMIN_EMAIL, password: "wrong" });
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body).toEqual(b.body);
  });

  it("logs in with an httpOnly cookie, exposes no hash, and logs out", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
      .expect(200);
    expect(res.headers["set-cookie"][0]).toMatch(/HttpOnly/i);

    const agent = await loginAgent();
    const me = await agent.get("/api/auth/me").expect(200);
    expect(me.body.email).toBe(process.env.ADMIN_EMAIL);
    expect(me.body.passwordHash).toBeUndefined();

    await agent.post("/api/auth/logout").expect(200);
    await agent.get("/api/auth/me").expect(401);
  });
});
