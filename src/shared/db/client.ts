import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const make = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 }),
  });

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? make();
if (process.env.NODE_ENV !== "production") g.prisma = db;
