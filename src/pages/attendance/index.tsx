// src/pages/attendance/index.tsx
import { AttendanceBoard, AttendanceHistory } from "@/widgets/attendance-board";

export function AttendancePage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Attendance</h1>
      <AttendanceBoard />
      <AttendanceHistory />
    </>
  );
}
