import { personUpdate } from "@/entities/person";
import { getPerson, updatePerson } from "@/entities/person/server";
import { parseBody, route } from "@/shared/api/http";

type P = { id: string };

export const GET = route<P>(async ({ params }) => getPerson(params.id));

export const PATCH = route<P>(async ({ req, params }) =>
  updatePerson(params.id, await parseBody(req, personUpdate)),
);
