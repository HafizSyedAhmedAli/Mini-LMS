import { z } from "zod";
import { isoDate } from "@/shared/lib/zod";

export const attendanceStatuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
export type AttendanceStatus = (typeof attendanceStatuses)[number];
export const STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

export const attendanceInput = z.object({
  personId: z.string().min(1),
  date: isoDate,
  status: z.enum(attendanceStatuses),
  note: z.string().trim().max(200).nullish(),
});
export const attendanceUpdate = z.object({
  status: z.enum(attendanceStatuses),
  note: z.string().trim().max(200).nullish(),
});
export const attendanceQuery = z.object({
  date: isoDate.optional(),
  personId: z.string().min(1).optional(),
});

export type AttendanceInput = z.infer<typeof attendanceInput>;
export type AttendanceQuery = z.infer<typeof attendanceQuery>;

export type AttendanceDTO = {
  id: string;
  personId: string;
  date: string;
  status: AttendanceStatus;
  note: string | null;
  person: {
    id: string;
    code: string;
    firstName: string;
    lastName: string;
    kind: "STUDENT" | "STAFF";
  };
};
