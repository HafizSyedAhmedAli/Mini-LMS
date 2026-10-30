import { NextResponse } from "next/server";
import { route } from "@/shared/api/http";
import { SESSION_COOKIE } from "@/shared/lib/session";

export const POST = route(
  async () => {
    const res = NextResponse.json({ ok: true });
    res.cookies.set({ name: SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
    return res;
  },
  { public: true },
);
