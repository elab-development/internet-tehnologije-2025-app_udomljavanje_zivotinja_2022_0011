import bcrypt from "bcryptjs";

export async function hashLozinka(lozinka: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(lozinka, salt);
}

export async function proveriLozinka(lozinka: string, hash: string) {
  return bcrypt.compare(lozinka, hash);
}
