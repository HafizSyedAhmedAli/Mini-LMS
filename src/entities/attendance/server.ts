import { db } from "@/shared/db/client";
import { HttpError, isPrismaError } from "@/shared/api/http";
import { fromDbDate, toDbDate, todayISO } from "@/shared/lib/date";
import type { AttendanceInput, AttendanceQuery } from "./model/schema";

const include = {
  person: { select: { id: true, code: true, firstName: true, lastName: true, kind: true } },
} as const;

const toDTO = <T extends { date: Date }>(a: T) => ({ ...a, date: fromDbDate(a.date) });

export async function listAttendance(q: AttendanceQuery) {
  // Never unbounded: with no filter, default to today.
  const date = q.date ?? (q.personId ? undefined : todayISO());
  const rows = await db.attendance.findMany({
    where: { ...(date && { date: toDbDate(date) }), ...(q.personId && { personId: q.personId }) },
    include,
    orderBy: [{ date: "desc" }, { person: { lastName: "asc" } }],
    take: 400,
  });
  return rows.map(toDTO);
}

export async function recordAttendance(input: AttendanceInput) {
  if (input.date > todayISO())
    throw new HttpError(400, "Cannot record attendance for a future date");
  const person = await db.person.findUnique({ where: { id: input.personId } });
  if (!person) throw new HttpError(404, "Person not found");
  if (person.archivedAt) throw new HttpError(409, "Person is archived");
  try {
    const row = await db.attendance.create({
      data: {
        personId: input.personId,
        date: toDbDate(input.date),
        status: input.status,
        note: input.note,
      },
      include,
    });
    return toDTO(row);
  } catch (e) {
    if (isPrismaError(e, "P2002"))
      throw new HttpError(409, "Attendance already recorded for this person on this date");
    throw e;
  }
}

export async function updateAttendance(
  id: string,
  data: { status: AttendanceInput["status"]; note?: string | null },
) {
  return toDTO(await db.attendance.update({ where: { id }, data, include }));
}
