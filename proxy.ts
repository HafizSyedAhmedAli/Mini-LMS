import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/shared/lib/session";

export async function proxy(req: NextRequest) {
  const authed = !!(await verifySession(req.cookies.get(SESSION_COOKIE)?.value));
  if (req.nextUrl.pathname === "/login") {
    return authed ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }
  return authed ? NextResponse.next() : NextResponse.redirect(new URL("/login", req.url));
}

// API routes are excluded on purpose: each handler enforces auth itself via route().
export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
