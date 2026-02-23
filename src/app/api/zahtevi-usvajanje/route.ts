export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";

// POST 
export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

  
    const forbidden = requireRole(auth, ["UDOMITELJ", "VOLONTER", "ADMIN"]);
    if (forbidden) return forbidden;

    const body = await req.json().catch(() => ({}));

    const kontakt = String(body?.kontakt ?? "").trim();
    const motivacija = String(body?.motivacija ?? "").trim();
    const zivotinjaId = Number(body?.zivotinjaId);

    if (!kontakt || !motivacija || !Number.isFinite(zivotinjaId)) {
      return fail("Nedostaju obavezna polja.", 400, "VALIDATION");
    }

    const zivotinja = await prisma.zivotinja.findUnique({
      where: { id: zivotinjaId },
      select: { id: true, status: true },
    });

    if (!zivotinja) return fail("Životinja nije pronađena.", 404, "NOT_FOUND");

   
    if (zivotinja.status !== "AKTIVNA") {
      return fail("Životinja trenutno nije dostupna za udomljavanje.", 400, "VALIDATION");
    }

    const created = await prisma.zahtevZaUsvajanje.create({
      data: {
        kontakt,
        motivacija,
        korisnikId: auth.userId,
        zivotinjaId,
        status: "NA_CEKANJU",
      },
    });

    return ok(created, 201);
  } catch (e: any) {
    console.error("POST ZAHTEV USAJANJE ERROR:", e);
    return fail("Greška na serveru.", 500, "SERVER_ERROR");
  }
}
