import { db } from "@/shared/db/client";
import { HttpError } from "@/shared/api/http";
import { hashPassword, verifyPassword } from "@/shared/lib/password";

let dummyHash: Promise<string> | undefined;

/** Always does one bcrypt compare, so response time doesn't reveal whether the email exists. */
export async function authenticate(email: string, password: string) {
  const admin = await db.admin.findUnique({ where: { email } });
  dummyHash ??= hashPassword("dummy-password");
  const ok = await verifyPassword(password, admin?.passwordHash ?? (await dummyHash));
  if (!admin || !ok) throw new HttpError(401, "Invalid email or password");
  return admin.id;
}
