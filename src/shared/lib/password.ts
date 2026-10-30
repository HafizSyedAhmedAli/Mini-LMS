import bcrypt from "bcryptjs";

const cost = () => Number(process.env.BCRYPT_COST ?? 12);
export const hashPassword = (plain: string) => bcrypt.hash(plain, cost());
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
