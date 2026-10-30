import { db } from "@/shared/db/client";
import { HttpError } from "@/shared/api/http";
import type { Prisma } from "@/shared/generated/prisma/client";
import type { PersonInput, PersonQuery, PersonUpdate } from "./model/schema";

export async function listPeople(q: PersonQuery) {
  const term = q.q;
  const where: Prisma.PersonWhereInput = {
    ...(q.kind && { kind: q.kind }),
    ...(q.status === "active" && { archivedAt: null }),
    ...(q.status === "archived" && { archivedAt: { not: null } }),
    ...(term && {
      OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { code: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ],
    }),
  };
  return db.person.findMany({
    where,
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 200,
  });
}

export async function getPerson(id: string) {
  const person = await db.person.findUnique({ where: { id } });
  if (!person) throw new HttpError(404, "Person not found");
  return person;
}

export const createPerson = (input: PersonInput) => db.person.create({ data: input });

export function updatePerson(id: string, input: PersonUpdate) {
  const { archived, ...fields } = input;
  return db.person.update({
    where: { id },
    data: {
      ...fields,
      ...(archived !== undefined && { archivedAt: archived ? new Date() : null }),
    },
  });
}
