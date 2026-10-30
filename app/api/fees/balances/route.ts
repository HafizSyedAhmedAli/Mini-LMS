import { z } from "zod";
import { listBalances } from "@/entities/fee/server";
import { parseQuery, route } from "@/shared/api/http";

export const GET = route(async ({ req }) =>
  listBalances(parseQuery(req, z.object({ q: z.string().trim().optional() })).q),
);
