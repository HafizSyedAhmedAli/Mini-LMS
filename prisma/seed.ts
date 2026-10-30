import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/shared/generated/prisma/client";

const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password.length < 10) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (10+ chars)");
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_COST ?? 12));

await db.$transaction(async (tx) => {
  await tx.admin.deleteMany({ where: { email: { not: email } } });
  await tx.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
});
await db.$disconnect();
console.log(`Admin ready: ${email}`);
