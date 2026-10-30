import { NextResponse } from "next/server";
import { attendanceInput, attendanceQuery } from "@/entities/attendance";
import { listAttendance, recordAttendance } from "@/entities/attendance/server";
import { parseBody, parseQuery, route } from "@/shared/api/http";

export const GET = route(async ({ req }) => listAttendance(parseQuery(req, attendanceQuery)));

export const POST = route(async ({ req }) => {
  const row = await recordAttendance(await parseBody(req, attendanceInput));
  return NextResponse.json(row, { status: 201 });
});
