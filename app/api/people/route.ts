import { NextResponse } from "next/server";
import { personInput, personQuery } from "@/entities/person";
import { createPerson, listPeople } from "@/entities/person/server";
import { parseBody, parseQuery, route } from "@/shared/api/http";

export const GET = route(async ({ req }) => listPeople(parseQuery(req, personQuery)));

export const POST = route(async ({ req }) => {
  const person = await createPerson(await parseBody(req, personInput));
  return NextResponse.json(person, { status: 201 });
});
