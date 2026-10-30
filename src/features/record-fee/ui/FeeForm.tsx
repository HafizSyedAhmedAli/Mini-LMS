"use client";
import { useState, type FormEvent } from "react";
import { api } from "@/shared/api/client";
import { useToday } from "@/shared/lib/use-today";
import { Button, ErrorText, Input, Select } from "@/shared/ui/kit";

export function FeeForm({ personId, onSaved }: { personId: string; onSaved: () => void }) {
  const today = useToday();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget; // capture before awaiting
    const f = new FormData(form);
    setBusy(true);
    setError(undefined);
    try {
      await api("/api/fees", {
        method: "POST",
        json: {
          personId,
          type: f.get("type"),
          amount: Number(f.get("amount")),
          date: String(f.get("date") ?? "") || undefined,
          note: String(f.get("note") ?? "").trim() || null,
        },
      });
      form.reset();
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-4">
      <Select label="Type" name="type" defaultValue="CHARGE">
        <option value="CHARGE">Charge</option>
        <option value="PAYMENT">Payment</option>
      </Select>
      <Input label="Amount" name="amount" type="number" step="0.01" min="0.01" required />
      {/* key remounts once `today` is known so defaultValue applies; reset() then returns to it */}
      <Input
        key={today ?? "pending"}
        label="Date"
        name="date"
        type="date"
        defaultValue={today ?? ""}
        max={today ?? undefined}
      />
      <Input label="Note" name="note" />
      <div className="flex items-center gap-3 sm:col-span-4">
        <Button type="submit" disabled={busy}>
          Record
        </Button>
        <ErrorText error={error} />
      </div>
    </form>
  );
}
