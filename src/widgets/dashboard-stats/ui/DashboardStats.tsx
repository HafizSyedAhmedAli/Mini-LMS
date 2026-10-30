"use client";
import { formatMinor } from "@/shared/lib/money";
import { useApi } from "@/shared/lib/use-api";
import { ErrorText } from "@/shared/ui/kit";
import type { DashboardDTO } from "../model/types";

function Stat({
  id,
  label,
  value,
  hint,
}: {
  id: string;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p data-testid={`stat-${id}`} className="mt-1 text-2xl font-semibold">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function DashboardStats() {
  const { data, error, loading } = useApi<DashboardDTO>("/api/dashboard");
  if (error) return <ErrorText error={error} />;
  if (loading || !data) return <p className="text-slate-500">Loading…</p>;
  const a = data.attendance;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Stat id="students" label="Active students" value={data.students} />
      <Stat id="staff" label="Active staff" value={data.staff} />
      <Stat
        id="attendance"
        label={`Present today (${data.date})`}
        value={a.present}
        hint={`Absent ${a.absent} · Late ${a.late} · Excused ${a.excused} · Not marked ${a.unmarked}`}
      />
      <Stat
        id="collected-today"
        label="Collected today"
        value={formatMinor(data.fees.collectedTodayMinor)}
      />
      <Stat
        id="collected-month"
        label="Collected this month"
        value={formatMinor(data.fees.collectedMonthMinor)}
      />
      <Stat
        id="outstanding"
        label="Outstanding balances"
        value={formatMinor(data.fees.outstandingMinor)}
        hint={`${data.fees.studentsOwing} student(s) owing`}
      />
    </div>
  );
}
