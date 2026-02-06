export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { proveriLozinka } from "@/lib/auth";
import { napraviToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const lozinka = String(body?.lozinka ?? "");

    if (!email || !lozinka) {
      return fail("Nedostaju email i lozinka.", 400, "VALIDATION");
    }

    const user = await prisma.korisnik.findUnique({ where: { email } });
    if (!user) {
      return fail("Pogrešan email ili lozinka.", 401, "INVALID_CREDENTIALS");
    }

    const okLozinka = await proveriLozinka(lozinka, user.lozinka);
    if (!okLozinka) {
      return fail("Pogrešan email ili lozinka.", 401, "INVALID_CREDENTIALS");
    }

    const token = await napraviToken({ userId: user.id, role: user.role });

    return ok(
      {
        token,
        user: {
          id: user.id,
          ime: user.ime,
          prezime: user.prezime,
          email: user.email,
          role: user.role,
        },
      },
      200
    );
  } catch (e: any) {
    console.error("LOGIN ERROR:", e);
    return fail("Greška pri prijavi.", 500, "SERVER_ERROR");
  }
}
