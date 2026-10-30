"use client";
import { useState } from "react";
import { STATUS_LABEL, type AttendanceDTO } from "@/entities/attendance";
import { fullName, type PersonDTO } from "@/entities/person";
import { useApi } from "@/shared/lib/use-api";
import { Card, Select } from "@/shared/ui/kit";

export function AttendanceHistory() {
  const [personId, setPersonId] = useState("");
  const people = useApi<PersonDTO[]>("/api/people?status=all");
  const rows = useApi<AttendanceDTO[]>(personId ? `/api/attendance?personId=${personId}` : null);

  return (
    <Card title="History by person">
      <div className="mb-3 w-72">
        <Select label="Person" value={personId} onChange={(e) => setPersonId(e.target.value)}>
          <option value="">Select…</option>
          {(people.data ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} — {fullName(p)}
            </option>
          ))}
        </Select>
      </div>
      <ul className="space-y-1 text-sm">
        {(rows.data ?? []).map((a) => (
          <li key={a.id}>
            {a.date} — {STATUS_LABEL[a.status]}
          </li>
        ))}
      </ul>
    </Card>
  );
}
