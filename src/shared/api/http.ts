import { NextResponse, type NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { Prisma } from "@/shared/generated/prisma/client";
import { SESSION_COOKIE, verifySession } from "@/shared/lib/session";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const isPrismaError = (e: unknown, code: string) =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === code;

export async function parseBody<S extends z.ZodType>(
  req: Request,
  schema: S,
): Promise<z.output<S>> {
  const raw = await req.json().catch(() => {
    throw new HttpError(400, "Invalid JSON body");
  });
  return schema.parse(raw);
}

export function parseQuery<S extends z.ZodType>(req: NextRequest, schema: S): z.output<S> {
  return schema.parse(Object.fromEntries(req.nextUrl.searchParams));
}

type Ctx<P> = { req: NextRequest; params: P; adminId: string };

/** Every API handler goes through this. Authenticated unless `{ public: true }`. */
export function route<P = Record<string, string>>(
  fn: (c: Ctx<P>) => Promise<unknown>,
  opts: { public?: boolean } = {},
) {
  return async (req: NextRequest, ctx: { params: Promise<P> }) => {
    try {
      let adminId = "";
      if (!opts.public) {
        const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
        if (!session) throw new HttpError(401, "Unauthorized");
        adminId = session.sub;
      }
      const params = (await ctx?.params) ?? ({} as P);
      const out = await fn({ req, params, adminId });
      return out instanceof Response ? out : NextResponse.json(out);
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}

function toErrorResponse(e: unknown) {
  if (e instanceof HttpError) return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof ZodError) {
    const issues = e.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
    const error = issues.map((i) => `${i.path || "body"}: ${i.message}`).join("; ");
    return NextResponse.json({ error, issues }, { status: 400 });
  }
  if (isPrismaError(e, "P2002"))
    return NextResponse.json(
      { error: "A record with the same unique value already exists" },
      { status: 409 },
    );
  if (isPrismaError(e, "P2025")) return NextResponse.json({ error: "Not found" }, { status: 404 });
  console.error(e);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
