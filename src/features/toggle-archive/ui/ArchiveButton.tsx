"use client";
import { useState } from "react";
import type { PersonDTO } from "@/entities/person";
import { api } from "@/shared/api/client";
import { Button } from "@/shared/ui/kit";

export function ArchiveButton({ person, onDone }: { person: PersonDTO; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const archived = !!person.archivedAt;
  return (
    <Button
      variant={archived ? "ghost" : "danger"}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await api(`/api/people/${person.id}`, { method: "PATCH", json: { archived: !archived } });
          onDone();
        } finally {
          setBusy(false);
        }
      }}
    >
      {archived ? "Restore" : "Archive"}
    </Button>
  );
}
