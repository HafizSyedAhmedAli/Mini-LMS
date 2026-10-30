import { execSync } from "node:child_process";

export default function globalSetup() {
  if (!process.env.DATABASE_URL?.includes("_test")) {
    throw new Error("Refusing to reset a non-test database");
  }
  const run = (cmd: string) => execSync(cmd, { stdio: "inherit", env: process.env });
  run("bunx prisma migrate reset --force");
  run("bunx prisma db seed");
}
