"use client";
import { useState } from "react";
import { StatusBadge, type AttendanceDTO } from "@/entities/attendance";
import { fullName, type PersonDTO, type PersonKind } from "@/entities/person";
import { StatusButtons } from "@/features/mark-attendance";
import { useApi } from "@/shared/lib/use-api";
import { useToday } from "@/shared/lib/use-today";
import { Card, ErrorText, Input, Select } from "@/shared/ui/kit";

export function AttendanceBoard() {
  const today = useToday();
  const [picked, setPicked] = useState<string>();
  const date = picked ?? today; // null until mounted
  const [kind, setKind] = useState<PersonKind>("STUDENT");
  const people = useApi<PersonDTO[]>(`/api/people?kind=${kind}&status=active`);
  const att = useApi<AttendanceDTO[]>(date ? `/api/attendance?date=${date}` : null);
  const byPerson = new Map((att.data ?? []).map((a) => [a.personId, a]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-44">
          <Input
            label="Date"
            type="date"
            value={date ?? ""}
            max={today ?? undefined}
            onChange={(e) => e.target.value && setPicked(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select label="Who" value={kind} onChange={(e) => setKind(e.target.value as PersonKind)}>
            <option value="STUDENT">Students</option>
            <option value="STAFF">Staff</option>
          </Select>
        </div>
      </div>
      <Card>
        <ErrorText error={people.error ?? att.error} />
        {people.data && !people.data.length ? (
          <p className="text-sm text-slate-500">No active records.</p>
        ) : null}
        <table className="w-full text-left text-sm">
          <tbody>
            {date &&
              (people.data ?? []).map((p) => {
                const current = byPerson.get(p.id);
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-2 font-mono">{p.code}</td>
                    <td>{fullName(p)}</td>
                    <td>
                      <StatusBadge status={current?.status} />
                    </td>
                    <td className="p-2">
                      <StatusButtons
                        personId={p.id}
                        date={date}
                        current={current}
                        onChanged={att.reload}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
