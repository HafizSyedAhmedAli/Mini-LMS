import { STATUS_LABEL, type AttendanceStatus } from "../model/schema";

export function StatusBadge({ status }: { status?: AttendanceStatus }) {
  return (
    <span data-testid="status" className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">
      {status ? STATUS_LABEL[status] : "Not marked"}
    </span>
  );
}
