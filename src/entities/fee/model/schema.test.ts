import { describe, expect, it } from "vitest";
import { feeInput } from "./schema";

const base = { personId: "p1", type: "CHARGE" as const };

describe("feeInput", () => {
  it.each([10, 10.25, 0.01])("accepts %s", (amount) => {
    expect(feeInput.safeParse({ ...base, amount }).success).toBe(true);
  });
  it.each([0, -5, 1.005, 10.999])("rejects %s", (amount) => {
    expect(feeInput.safeParse({ ...base, amount }).success).toBe(false);
  });
  it("rejects impossible dates", () => {
    expect(feeInput.safeParse({ ...base, amount: 1, date: "2026-02-31" }).success).toBe(false);
  });
});
