"use client";
import { useRouter } from "next/navigation";
import { api } from "@/shared/api/client";
import { Button } from "@/shared/ui/kit";

export function LogoutButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await api("/api/auth/logout", { method: "POST" });
        router.replace("/login");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
