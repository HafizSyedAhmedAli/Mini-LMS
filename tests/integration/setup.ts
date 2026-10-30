import { afterAll, beforeEach } from "vitest";
import { db } from "@/shared/db/client";
import { hashPassword } from "@/shared/lib/password";

if (!process.env.DATABASE_URL?.includes("_test")) {
  throw new Error("Refusing to truncate a non-test database");
}

beforeEach(async () => {
  await db.$executeRawUnsafe(
    'TRUNCATE "Attendance","FeeEntry","Person","Admin" RESTART IDENTITY CASCADE',
  );
  await db.admin.create({
    data: {
      email: process.env.ADMIN_EMAIL!,
      passwordHash: await hashPassword(process.env.ADMIN_PASSWORD!),
    },
  });
});

afterAll(() => db.$disconnect());
