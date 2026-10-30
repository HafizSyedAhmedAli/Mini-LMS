import { db } from "@/shared/db/client";
import { HttpError } from "@/shared/api/http";
import { fromDbDate, toDbDate, todayISO } from "@/shared/lib/date";
import { toMinor } from "@/shared/lib/money";
import type { BalanceRowDTO, FeeInput, LedgerDTO, Totals } from "./model/schema";

type SumRow = { type: string; _sum: { amountMinor: number | null } };

function totals(rows: SumRow[]): Totals {
  let chargedMinor = 0;
  let paidMinor = 0;
  for (const r of rows) {
    if (r.type === "CHARGE") chargedMinor += r._sum.amountMinor ?? 0;
    else paidMinor += r._sum.amountMinor ?? 0;
  }
  return { chargedMinor, paidMinor, balanceMinor: chargedMinor - paidMinor };
}

export async function recordFee(input: FeeInput) {
  const date = input.date ?? todayISO();
  if (date > todayISO()) throw new HttpError(400, "Date cannot be in the future");
  const person = await db.person.findUnique({ where: { id: input.personId } });
  if (!person) throw new HttpError(404, "Person not found");
  if (person.kind !== "STUDENT") throw new HttpError(400, "Fees apply to students only");
  if (input.type === "CHARGE" && person.archivedAt)
    throw new HttpError(409, "Cannot charge an archived student");
  return db.feeEntry.create({
    data: {
      personId: input.personId,
      type: input.type,
      amountMinor: toMinor(input.amount),
      entryDate: toDbDate(date),
      note: input.note,
    },
  });
}

export async function getLedger(personId: string): Promise<LedgerDTO> {
  const person = await db.person.findUnique({ where: { id: personId } });
  if (!person) throw new HttpError(404, "Person not found");
  if (person.kind !== "STUDENT") throw new HttpError(400, "Fees apply to students only");
  const [entries, sums] = await Promise.all([
    db.feeEntry.findMany({
      where: { personId },
      orderBy: [{ entryDate: "desc" }, { createdAt: "desc" }],
      take: 500,
    }),
    db.feeEntry.groupBy({ by: ["type"], where: { personId }, _sum: { amountMinor: true } }),
  ]);
  return {
    person: {
      id: person.id,
      code: person.code,
      firstName: person.firstName,
      lastName: person.lastName,
      archived: !!person.archivedAt,
    },
    ...totals(sums),
    entries: entries.map((e) => ({
      id: e.id,
      type: e.type,
      amountMinor: e.amountMinor,
      entryDate: fromDbDate(e.entryDate),
      note: e.note,
    })),
  };
}

export async function listBalances(q?: string): Promise<BalanceRowDTO[]> {
  const people = await db.person.findMany({
    where: {
      kind: "STUDENT",
      ...(q && {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
        ],
      }),
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 200,
  });
  const sums = await db.feeEntry.groupBy({
    by: ["personId", "type"],
    where: { personId: { in: people.map((p) => p.id) } },
    _sum: { amountMinor: true },
  });
  const grouped = new Map<string, typeof sums>();
  for (const s of sums) grouped.set(s.personId, [...(grouped.get(s.personId) ?? []), s]);

  return people
    .map((p) => ({
      personId: p.id,
      code: p.code,
      firstName: p.firstName,
      lastName: p.lastName,
      archived: !!p.archivedAt,
      ...totals(grouped.get(p.id) ?? []),
    }))
    .filter((r) => !r.archived || r.balanceMinor !== 0); // archived students only matter while they owe
}
