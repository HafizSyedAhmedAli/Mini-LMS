"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "@/features/auth";

const links = [
  ["/", "Dashboard"],
  ["/students", "Students"],
  ["/staff", "Staff"],
  ["/attendance", "Attendance"],
  ["/fees", "Fees"],
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between border-b pb-4">
        <nav className="flex gap-1">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                path === href ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </header>
      <main className="space-y-4">{children}</main>
    </div>
  );
}
