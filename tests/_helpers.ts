import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { napraviToken } from "../src/lib/jwt";

export async function napraviTestKorisnika(
  role: "ADMIN" | "VOLONTER" | "UDOMITELJ"
) {
  const email = `test_${role.toLowerCase()}_${Date.now()}@example.com`;
  const lozinkaHash = await bcrypt.hash("Test123!", 10);

  const user = await prisma.korisnik.create({
    data: {
      ime: "Test",
      prezime: role,
      email,
      lozinka: lozinkaHash,
      role,
    } as any,
  });

  const token = await napraviToken({ userId: user.id, role: user.role });
  return { user, token };
}

export async function ocistiZivotinjeOdTestKorisnika(korisnikId: number) {
  await prisma.zivotinja.deleteMany({ where: { korisnikId } });
}