// src/pages/fees/index.tsx
import { FeeManager } from "@/widgets/fee-manager";

export function FeesPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Fees</h1>
      <FeeManager />
    </>
  );
}
