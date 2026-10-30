"use client";
import { useState, type FormEvent } from "react";
import type { PersonDTO, PersonKind } from "@/entities/person";
import { api } from "@/shared/api/client";
import { Button, ErrorText, Input } from "@/shared/ui/kit";

type Props = { kind: PersonKind; person?: PersonDTO; onSaved: () => void; onCancel: () => void };

export function PersonForm({ kind, person, onSaved, onCancel }: Props) {
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim() || null;
    const body = {
      code: v("code"),
      firstName: v("firstName"),
      lastName: v("lastName"),
      email: v("email"),
      phone: v("phone"),
      guardianName: v("guardianName"),
      position: v("position"),
    };
    setBusy(true);
    setError(undefined);
    try {
      if (person) await api(`/api/people/${person.id}`, { method: "PATCH", json: body });
      else await api("/api/people", { method: "POST", json: { kind, ...body } });
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <Input
        label="Code"
        name="code"
        defaultValue={person?.code}
        placeholder="Roll no. / staff ID"
        required
      />
      <span />
      <Input label="First name" name="firstName" defaultValue={person?.firstName} required />
      <Input label="Last name" name="lastName" defaultValue={person?.lastName} required />
      <Input label="Email" name="email" type="email" defaultValue={person?.email ?? ""} />
      <Input label="Phone" name="phone" defaultValue={person?.phone ?? ""} />
      {kind === "STUDENT" ? (
        <Input
          label="Guardian name"
          name="guardianName"
          defaultValue={person?.guardianName ?? ""}
        />
      ) : (
        <Input label="Position" name="position" defaultValue={person?.position ?? ""} />
      )}
      <div className="flex items-end gap-2 sm:col-span-2">
        <Button type="submit" disabled={busy}>
          Save
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <ErrorText error={error} />
      </div>
    </form>
  );
}
