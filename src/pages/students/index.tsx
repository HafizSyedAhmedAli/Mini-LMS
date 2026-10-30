// src/pages/students/index.tsx
import { PeopleManager } from "@/widgets/people-manager";

export function StudentsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Students</h1>
      <PeopleManager kind="STUDENT" />
    </>
  );
}
