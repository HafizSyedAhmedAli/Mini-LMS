import { db } from "@/shared/db/client";
import { HttpError, route } from "@/shared/api/http";

export const GET = route(async ({ adminId }) => {
  const admin = await db.admin.findUnique({
    where: { id: adminId },
    select: { id: true, email: true },
  });
  if (!admin) throw new HttpError(401, "Unauthorized");
  return admin;
});
