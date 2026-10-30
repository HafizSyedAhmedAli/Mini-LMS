import { db } from "@/shared/db/client";
import { toDbDate, todayISO } from "@/shared/lib/date";
import type { DashboardDTO } from "./model/types";

export async function getDashboard(): Promise<DashboardDTO> {
  const today = todayISO();
  const todayDate = toDbDate(today);
  const monthStart = toDbDate(`${today.slice(0, 8)}01`);

  const [students, staff, att, paidToday, paidMonth, sums] = await Promise.all([
    db.person.count({ where: { kind: "STUDENT", archivedAt: null } }),
    db.person.count({ where: { kind: "STAFF", archivedAt: null } }),
    db.attendance.groupBy({ by: ["status"], where: { date: todayDate }, _count: { _all: true } }),
    db.feeEntry.aggregate({
      where: { type: "PAYMENT", entryDate: todayDate },
      _sum: { amountMinor: true },
    }),
    db.feeEntry.aggregate({
      where: { type: "PAYMENT", entryDate: { gte: monthStart, lte: todayDate } },
      _sum: { amountMinor: true },
    }),
    db.feeEntry.groupBy({ by: ["personId", "type"], _sum: { amountMinor: true } }),
  ]);

  const count = (s: string) => att.find((a) => a.status === s)?._count._all ?? 0;
  const marked = att.reduce((n, a) => n + a._count._all, 0);

  const balance = new Map<string, number>();
  for (const s of sums) {
    const sign = s.type === "CHARGE" ? 1 : -1;
    balance.set(s.personId, (balance.get(s.personId) ?? 0) + sign * (s._sum.amountMinor ?? 0));
  }
  let outstandingMinor = 0;
  let studentsOwing = 0;
  for (const b of balance.values()) {
    if (b > 0) {
      outstandingMinor += b;
      studentsOwing++;
    }
  }

  return {
    date: today,
    students,
    staff,
    attendance: {
      present: count("PRESENT"),
      absent: count("ABSENT"),
      late: count("LATE"),
      excused: count("EXCUSED"),
      unmarked: Math.max(0, students + staff - marked),
    },
    fees: {
      collectedTodayMinor: paidToday._sum.amountMinor ?? 0,
      collectedMonthMinor: paidMonth._sum.amountMinor ?? 0,
      outstandingMinor,
      studentsOwing,
    },
  };
}
