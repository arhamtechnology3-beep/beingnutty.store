import "server-only";
import bcrypt from "bcryptjs";

const ROUNDS = 12;

// Compared against when the account is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", ROUNDS);

export const hashPassword = (password: string) => bcrypt.hash(password, ROUNDS);

export async function verifyPassword(password: string, hash: string | null | undefined) {
  const ok = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return ok && Boolean(hash);
}
