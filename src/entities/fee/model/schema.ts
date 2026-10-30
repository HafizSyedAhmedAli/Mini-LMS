import { z } from "zod";
import { isoDate } from "@/shared/lib/zod";

export const feeTypes = ["CHARGE", "PAYMENT"] as const;
export type FeeType = (typeof feeTypes)[number];

const money = z
  .number()
  .positive()
  .max(10_000_000)
  .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, "At most 2 decimal places");

export const feeInput = z.object({
  personId: z.string().min(1),
  type: z.enum(feeTypes),
  amount: money,
  date: isoDate.optional(),
  note: z.string().trim().max(200).nullish(),
});
export type FeeInput = z.infer<typeof feeInput>;

export type FeeEntryDTO = {
  id: string;
  type: FeeType;
  amountMinor: number;
  entryDate: string;
  note: string | null;
};
export type Totals = { chargedMinor: number; paidMinor: number; balanceMinor: number };
export type LedgerDTO = Totals & {
  person: { id: string; code: string; firstName: string; lastName: string; archived: boolean };
  entries: FeeEntryDTO[];
};
export type BalanceRowDTO = Totals & {
  personId: string;
  code: string;
  firstName: string;
  lastName: string;
  archived: boolean;
};
