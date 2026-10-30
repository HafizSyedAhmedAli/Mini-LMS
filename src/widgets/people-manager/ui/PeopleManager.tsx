"use client";
import { useState } from "react";
import { fullName, type PersonDTO, type PersonKind } from "@/entities/person";
import { PersonForm } from "@/features/person-form";
import { ArchiveButton } from "@/features/toggle-archive";
import { useApi } from "@/shared/lib/use-api";
import { useDebounced } from "@/shared/lib/use-debounced";
import { Button, Card, ErrorText, Input, Select } from "@/shared/ui/kit";

export function PeopleManager({ kind }: { kind: PersonKind }) {
  const student = kind === "STUDENT";
  const [q, setQ] = useState("");
  const dq = useDebounced(q);
  const [status, setStatus] = useState<"active" | "archived" | "all">("active");
  const [editing, setEditing] = useState<PersonDTO | "new" | null>(null);
  const { data, error, loading, reload } = useApi<PersonDTO[]>(
    `/api/people?${new URLSearchParams({ kind, status, q: dq })}`,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-64">
          <Input
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, code, email"
          />
        </div>
        <div className="w-40">
          <Select
            label="Show"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All</option>
          </Select>
        </div>
        <Button onClick={() => setEditing("new")}>{student ? "Add student" : "Add staff"}</Button>
      </div>

      {editing && (
        <Card title={editing === "new" ? (student ? "New student" : "New staff") : "Edit"}>
          <PersonForm
            key={editing === "new" ? "new" : editing.id}
            kind={kind}
            person={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        </Card>
      )}

      <Card>
        <ErrorText error={error} />
        {loading && !data ? <p className="text-sm text-slate-500">Loading…</p> : null}
        {data && !data.length ? <p className="text-sm text-slate-500">Nothing found.</p> : null}
        {data?.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="p-2">Code</th>
                <th>Name</th>
                <th>Contact</th>
                <th>{student ? "Guardian" : "Position"}</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-2 font-mono">{p.code}</td>
                  <td>{fullName(p)}</td>
                  <td>{p.email ?? p.phone ?? "—"}</td>
                  <td>{(student ? p.guardianName : p.position) ?? "—"}</td>
                  <td>{p.archivedAt ? "Archived" : "Active"}</td>
                  <td className="space-x-2 p-2 text-right">
                    <Button variant="ghost" onClick={() => setEditing(p)}>
                      Edit
                    </Button>
                    <ArchiveButton person={p} onDone={reload} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </Card>
    </div>
  );
}
