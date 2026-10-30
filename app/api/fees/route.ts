import { NextResponse } from "next/server";
import { z } from "zod";
import { feeInput } from "@/entities/fee";
import { getLedger, recordFee } from "@/entities/fee/server";
import { parseBody, parseQuery, route } from "@/shared/api/http";

export const GET = route(async ({ req }) =>
  getLedger(parseQuery(req, z.object({ personId: z.string().min(1) })).personId),
);

export const POST = route(async ({ req }) => {
  const entry = await recordFee(await parseBody(req, feeInput));
  return NextResponse.json(entry, { status: 201 });
});
