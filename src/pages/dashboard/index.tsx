// src/pages/dashboard/index.tsx
import { DashboardStats } from "@/widgets/dashboard-stats";

export function DashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <DashboardStats />
    </>
  );
}
