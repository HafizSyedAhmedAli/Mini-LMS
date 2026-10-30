import { createServer } from "node:http";
import { NextRequest } from "next/server";
import request from "supertest";

import * as login from "../../app/api/auth/login/route";
import * as logout from "../../app/api/auth/logout/route";
import * as me from "../../app/api/auth/me/route";
import * as people from "../../app/api/people/route";
import * as person from "../../app/api/people/[id]/route";
import * as attendance from "../../app/api/attendance/route";
import * as attendanceId from "../../app/api/attendance/[id]/route";
import * as fees from "../../app/api/fees/route";
import * as balances from "../../app/api/fees/balances/route";
import * as dashboard from "../../app/api/dashboard/route";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Handler = (req: NextRequest, ctx: { params: Promise<any> }) => Promise<Response>;
type Mod = Partial<Record<"GET" | "POST" | "PATCH", Handler>>;

const table: Array<[string, Mod]> = [
  ["/api/auth/login", login],
  ["/api/auth/logout", logout],
  ["/api/auth/me", me],
  ["/api/people", people],
  ["/api/people/:id", person],
  ["/api/attendance", attendance],
  ["/api/attendance/:id", attendanceId],
  ["/api/fees", fees],
  ["/api/fees/balances", balances],
  ["/api/dashboard", dashboard],
];

const routes = table.map(([path, mod]) => {
  const keys: string[] = [];
  const re = new RegExp(`^${path.replace(/:(\w+)/g, (_, k) => (keys.push(k), "([^/]+)"))}/?$`);
  return { re, keys, mod };
});

export function createTestServer() {
  return createServer(async (nodeReq, nodeRes) => {
    const url = new URL(nodeReq.url ?? "/", "http://localhost");
    const method = (nodeReq.method ?? "GET") as "GET" | "POST" | "PATCH";
    const hit = routes.map((r) => ({ r, m: url.pathname.match(r.re) })).find((x) => x.m);
    const handler = hit?.r.mod[method];
    if (!hit || !hit.m || !handler) {
      nodeRes.statusCode = hit ? 405 : 404;
      return nodeRes.end();
    }
    const params = Object.fromEntries(hit.r.keys.map((k, i) => [k, hit.m![i + 1]]));

    const chunks: Buffer[] = [];
    for await (const c of nodeReq) chunks.push(c as Buffer);
    const headers = new Headers();
    for (const [k, v] of Object.entries(nodeReq.headers))
      if (v !== undefined) headers.set(k, [v].flat().join(", "));

    const req = new NextRequest(url, {
      method,
      headers,
      body: method === "GET" || !chunks.length ? undefined : new Uint8Array(Buffer.concat(chunks)),
    });
    const res = await handler(req, { params: Promise.resolve(params) });

    nodeRes.statusCode = res.status;
    res.headers.forEach((v, k) => k !== "set-cookie" && nodeRes.setHeader(k, v));
    const cookies = res.headers.getSetCookie();
    if (cookies.length) nodeRes.setHeader("set-cookie", cookies);
    nodeRes.end(Buffer.from(await res.arrayBuffer()));
  });
}

export const server = createTestServer();

export async function loginAgent() {
  const agent = request.agent(server); // keeps the session cookie
  await agent
    .post("/api/auth/login")
    .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
    .expect(200);
  return agent;
}

export async function createStudent(agent: ReturnType<typeof request.agent>, code = "S-1") {
  const res = await agent
    .post("/api/people")
    .send({ kind: "STUDENT", code, firstName: "Ada", lastName: "Lovelace" })
    .expect(201);
  return res.body as { id: string };
}
