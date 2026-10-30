import type { ComponentProps, ReactNode } from "react";

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");
const field = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm";

export function Button({
  variant = "primary",
  className,
  ...p
}: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-slate-900 text-white hover:bg-slate-700",
    ghost: "border border-slate-300 bg-white hover:bg-slate-100",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };
  return (
    <button
      type="button"
      className={cx(
        "rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50",
        styles[variant],
        className,
      )}
      {...p}
    />
  );
}

export function Input({ label, className, ...p }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input className={cx(field, className)} {...p} />
    </label>
  );
}

export function Select({
  label,
  className,
  children,
  ...p
}: ComponentProps<"select"> & { label: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <select className={cx(field, className)} {...p}>
        {children}
      </select>
    </label>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {title && <h2 className="mb-3 text-base font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

export function ErrorText({ error }: { error?: string }) {
  return error ? (
    <p role="alert" className="text-sm text-red-600">
      {error}
    </p>
  ) : null;
}
