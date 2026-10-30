import { describe, expect, it } from "vitest";
import { fromDbDate, toDbDate, todayISO } from "./date";

describe("date", () => {
  it("uses the app timezone, not UTC", () => {
    const instant = new Date("2026-10-30T20:00:00Z");
    expect(todayISO(instant, "UTC")).toBe("2026-10-30");
    expect(todayISO(instant, "Asia/Karachi")).toBe("2026-10-31");
  });
  it("round-trips db dates", () => {
    expect(fromDbDate(toDbDate("2026-02-03"))).toBe("2026-02-03");
  });
});
