export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const data = await prisma.zivotinja.findMany({
      where,
      orderBy: { postavljeno: "desc" },
      include: {
        korisnik: { select: { id: true, ime: true, prezime: true } },
      },
    });

    return ok(data, 200);
  } catch (e: any) {
    console.error("GET ZIVOTINJE ERROR:", e);
    return fail("Greška pri učitavanju životinja.", 500, "SERVER_ERROR");
  }
}

// POST
export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const forbidden = requireRole(auth, ["ADMIN", "VOLONTER"]);
  if (forbidden) return forbidden;

  try {
    const body = await req.json();

    const ime = String(body?.ime ?? "").trim();
    const vrsta = String(body?.vrsta ?? "").trim();
    const starost = Number(body?.starost ?? 0);
    const pol = String(body?.pol ?? "").trim();
    const lokacija = String(body?.lokacija ?? "").trim();
    const opis = String(body?.opis ?? "").trim();

    if (!ime || !vrsta || !starost || !pol || !lokacija || !opis) {
      return fail("Nedostaju obavezna polja za životinju.", 400, "VALIDATION");
    }

    const nova = await prisma.zivotinja.create({
      data: {
        ime,
        vrsta,
        starost,
        pol,
        lokacija,
        opis,
        korisnikId: auth.userId,
      },
    });

    return ok(nova, 201);
  } catch (e: any) {
    console.error("POST ZIVOTINJA ERROR:", e);
    return fail("Greška pri dodavanju životinje.", 500, "SERVER_ERROR");
  }
}

