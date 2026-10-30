import { z } from "zod";

export const personKinds = ["STUDENT", "STAFF"] as const;
export type PersonKind = (typeof personKinds)[number];

export const personInput = z.object({
  kind: z.enum(personKinds),
  code: z.string().trim().min(1).max(40),
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.email().nullish(),
  phone: z.string().trim().max(30).nullish(),
  guardianName: z.string().trim().max(120).nullish(),
  position: z.string().trim().max(120).nullish(),
});

export const personUpdate = personInput
  .omit({ kind: true })
  .partial()
  .extend({ archived: z.boolean().optional() });

export const personQuery = z.object({
  kind: z.enum(personKinds).optional(),
  q: z.string().trim().optional(),
  status: z.enum(["active", "archived", "all"]).default("active"),
});

export type PersonInput = z.infer<typeof personInput>;
export type PersonUpdate = z.infer<typeof personUpdate>;
export type PersonQuery = z.infer<typeof personQuery>;

export type PersonDTO = {
  id: string;
  kind: PersonKind;
  code: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  guardianName: string | null;
  position: string | null;
  archivedAt: string | null;
  createdAt: string;
};

export const fullName = (p: { firstName: string; lastName: string }) =>
  `${p.firstName} ${p.lastName}`;
