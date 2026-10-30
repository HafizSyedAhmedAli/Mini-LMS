// src/pages/login/index.tsx
import { LoginForm } from "@/features/auth";
import { Card } from "@/shared/ui/kit";

export function LoginPage() {
  return (
    <div className="mx-auto mt-24 max-w-sm space-y-4">
      <h1 className="text-2xl font-semibold">Mini LMS</h1>
      <Card>
        <LoginForm />
      </Card>
    </div>
  );
}
