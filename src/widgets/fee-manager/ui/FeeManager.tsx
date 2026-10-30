"use client";
import { useState } from "react";
import { LedgerTable, type BalanceRowDTO, type LedgerDTO } from "@/entities/fee";
import { FeeForm } from "@/features/record-fee";
import { formatMinor } from "@/shared/lib/money";
import { useApi } from "@/shared/lib/use-api";
import { useDebounced } from "@/shared/lib/use-debounced";
import { Card, ErrorText, Input } from "@/shared/ui/kit";

export function FeeManager() {
  const [q, setQ] = useState("");
  const dq = useDebounced(q);
  const [selected, setSelected] = useState<string | null>(null);
  const balances = useApi<BalanceRowDTO[]>(`/api/fees/balances?${new URLSearchParams({ q: dq })}`);
  const ledger = useApi<LedgerDTO>(selected ? `/api/fees?personId=${selected}` : null);
  const refresh = () => {
    balances.reload();
    ledger.reload();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Student balances">
        <div className="mb-3">
          <Input
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or code"
          />
        </div>
        <ErrorText error={balances.error} />
        <table className="w-full text-left text-sm">
          <thead className="border-b text-slate-500">
            <tr>
              <th className="py-2">Student</th>
              <th>Charged</th>
              <th>Paid</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {(balances.data ?? []).map((r) => (
              <tr key={r.personId} className="border-b last:border-0">
                <td className="py-2">
                  <button className="font-medium underline" onClick={() => setSelected(r.personId)}>
                    {r.firstName} {r.lastName}
                  </button>
                  <span className="ml-2 font-mono text-xs text-slate-500">{r.code}</span>
                </td>
                <td>{formatMinor(r.chargedMinor)}</td>
                <td>{formatMinor(r.paidMinor)}</td>
                <td className={r.balanceMinor > 0 ? "font-semibold text-red-600" : ""}>
                  {formatMinor(r.balanceMinor)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="space-y-4">
        {!selected && (
          <p className="text-sm text-slate-500">Select a student to see their ledger.</p>
        )}
        {selected && ledger.data && (
          <>
            <Card title={`${ledger.data.person.firstName} ${ledger.data.person.lastName}`}>
              <p className="mb-4 text-sm text-slate-600">
                Balance:{" "}
                <strong data-testid="balance" className="text-lg text-slate-900">
                  {formatMinor(ledger.data.balanceMinor)}
                </strong>
              </p>
              <FeeForm personId={selected} onSaved={refresh} />
            </Card>
            <Card title="Payment history">
              <LedgerTable entries={ledger.data.entries} />
            </Card>
          </>
        )}
        <ErrorText error={ledger.error} />
      </div>
    </div>
  );
}
