export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const forbidden = requireRole(auth, ["VOLONTER", "ADMIN"]);
  if (forbidden) return forbidden;

  try {
    const mojeZivotinje = await prisma.zivotinja.findMany({
      where: { korisnikId: auth.userId },
      orderBy: { postavljeno: "desc" },
      select: {
        id: true,
        ime: true,
        vrsta: true,
        starost: true,
        pol: true,
        lokacija: true,
        status: true,
        slikaUrl: true,
        postavljeno: true,
      },
    });

    const zahteviZaMojeZivotinje = await prisma.zahtevZaUsvajanje.findMany({
      where: { zivotinja: { korisnikId: auth.userId } },
      orderBy: { vremePodnosenjaZahteva: "desc" },
      include: {
        korisnik: { select: { id: true, ime: true, prezime: true, email: true } },
        zivotinja: { select: { id: true, ime: true, slikaUrl: true, status: true } },
      },
    });

    return ok({ mojeZivotinje, zahteviZaMojeZivotinje }, 200);
  } catch (e: any) {
    console.error("GET /api/me/dashboard ERROR:", e);
    return fail("Greška pri učitavanju podataka.", 500, "SERVER_ERROR");
  }
}
