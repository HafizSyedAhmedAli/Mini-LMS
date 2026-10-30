import { formatMinor } from "@/shared/lib/money";
import type { FeeEntryDTO } from "../model/schema";

export function LedgerTable({ entries }: { entries: FeeEntryDTO[] }) {
  if (!entries.length) return <p className="text-sm text-slate-500">No entries yet.</p>;
  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b text-slate-500">
        <tr>
          <th className="py-2">Date</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr key={e.id} className="border-b last:border-0">
            <td className="py-2">{e.entryDate}</td>
            <td>{e.type === "CHARGE" ? "Charge" : "Payment"}</td>
            <td>{formatMinor(e.amountMinor)}</td>
            <td>{e.note ?? "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
