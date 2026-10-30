"use client";
import { useState } from "react";
import {
  attendanceStatuses,
  STATUS_LABEL,
  type AttendanceDTO,
  type AttendanceStatus,
} from "@/entities/attendance";
import { api } from "@/shared/api/client";
import { Button, ErrorText } from "@/shared/ui/kit";

type Props = { personId: string; date: string; current?: AttendanceDTO; onChanged: () => void };

export function StatusButtons({ personId, date, current, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function set(status: AttendanceStatus) {
    setBusy(true);
    setError(undefined);
    try {
      if (current)
        await api(`/api/attendance/${current.id}`, { method: "PATCH", json: { status } });
      else await api("/api/attendance", { method: "POST", json: { personId, date, status } });
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {attendanceStatuses.map((s) => (
        <Button
          key={s}
          variant={current?.status === s ? "primary" : "ghost"}
          disabled={busy}
          onClick={() => set(s)}
        >
          {STATUS_LABEL[s]}
        </Button>
      ))}
      <ErrorText error={error} />
    </div>
  );
}
