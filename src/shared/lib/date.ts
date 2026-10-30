export const APP_TZ = process.env.NEXT_PUBLIC_APP_TIMEZONE ?? "Asia/Karachi";

/** "YYYY-MM-DD" for the given instant in the app timezone (Vercel runs in UTC, so never use toISOString for "today"). */
export function todayISO(now = new Date(), tz = APP_TZ) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export const toDbDate = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
export const fromDbDate = (d: Date) => d.toISOString().slice(0, 10);
