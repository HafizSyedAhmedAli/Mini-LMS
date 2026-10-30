import { attendanceUpdate } from "@/entities/attendance";
import { updateAttendance } from "@/entities/attendance/server";
import { parseBody, route } from "@/shared/api/http";

export const PATCH = route<{ id: string }>(async ({ req, params }) =>
  updateAttendance(params.id, await parseBody(req, attendanceUpdate)),
);
