import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";

export default function setup() {
  const env = { ...process.env, ...parse(readFileSync(".env.test")) };
  if (!env.DATABASE_URL?.includes("_test"))
    throw new Error("Refusing to run against a non-test database");
  execSync("bunx prisma migrate deploy", { stdio: "inherit", env });
}
