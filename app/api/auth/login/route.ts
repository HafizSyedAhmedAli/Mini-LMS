import { NextResponse } from "next/server";
import { loginSchema } from "@/features/auth/model/schema";
import { authenticate } from "@/features/auth/server";
import { parseBody, route } from "@/shared/api/http";
import { sessionCookie, signSession } from "@/shared/lib/session";

export const POST = route(
  async ({ req }) => {
    const { email, password } = await parseBody(req, loginSchema);
    const adminId = await authenticate(email, password);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookie(await signSession(adminId)));
    return res;
  },
  { public: true },
);
