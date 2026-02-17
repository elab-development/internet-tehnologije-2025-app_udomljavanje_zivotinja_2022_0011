export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth } from "@/lib/guard";

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const user = await prisma.korisnik.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        ime: true,
        prezime: true,
        email: true,
        datumRodjenja: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) return fail("Korisnik nije pronađen.", 404, "NOT_FOUND");
    return ok(user, 200);
  } catch (e: any) {
    console.error("GET /api/me ERROR:", e);
    return fail("Greška pri učitavanju profila.", 500, "SERVER_ERROR");
  }
}
