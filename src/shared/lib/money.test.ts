import { describe, expect, it } from "vitest";
import { formatMinor, toMinor } from "./money";

describe("money", () => {
  it("converts to integer minor units without float drift", () => {
    expect(toMinor(10.1)).toBe(1010);
    expect(toMinor(0.07)).toBe(7);
    expect(toMinor(1500)).toBe(150000);
  });
  it("formats", () => {
    expect(formatMinor(100000, "USD")).toBe("$1,000.00");
  });
});
