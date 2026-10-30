"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/shared/api/client";
import { Button, ErrorText, Input } from "@/shared/ui/kit";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(undefined);
    try {
      await api("/api/auth/login", {
        method: "POST",
        json: { email: f.get("email"), password: f.get("password") },
      });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input label="Email" name="email" type="email" autoComplete="username" required />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <ErrorText error={error} />
      <Button type="submit" disabled={busy} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
