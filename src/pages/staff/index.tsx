// src/pages/staff/index.tsx
import { PeopleManager } from "@/widgets/people-manager";

export function StaffPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Staff</h1>
      <PeopleManager kind="STAFF" />
    </>
  );
}
