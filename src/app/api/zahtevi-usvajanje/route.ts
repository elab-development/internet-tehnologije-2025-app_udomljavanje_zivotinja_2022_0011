export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";


// POST (UDOMITELJ/VOLONTER)
export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const roleResp = requireRole(auth, ["UDOMITELJ", "VOLONTER"]);
    if (roleResp) return roleResp;

    const body = await req.json().catch(() => ({}));
    const zivotinjaId = Number(body?.zivotinjaId);
    const kontakt = String(body?.kontakt ?? "").trim();
    const motivacija = String(body?.motivacija ?? "").trim();

    if (!Number.isFinite(zivotinjaId) || !kontakt || !motivacija) {
      return fail("Nedostaju podaci (zivotinjaId, kontakt, motivacija).", 400, "VALIDATION");
    }

    const zivotinja = await prisma.zivotinja.findUnique({ where: { id: zivotinjaId } });
    if (!zivotinja) return fail("Životinja nije pronađena.", 404, "NOT_FOUND");
    if (zivotinja.status !== "AKTIVNA") {
      return fail("Životinja trenutno nije dostupna za udomljavanje.", 409, "NOT_AVAILABLE");
    }

    // spreči dupliranje aktivnog zahteva
    const already = await prisma.zahtevZaUsvajanje.findFirst({
      where: {
        korisnikId: auth.userId,
        zivotinjaId,
        status: { in: ["NA_CEKANJU", "ODOBREN"] },
      },
    });

    if (already) {
      return fail("Već imate aktivan zahtev za ovu životinju.", 409, "ALREADY_EXISTS");
    }

    const created = await prisma.zahtevZaUsvajanje.create({
      data: {
        korisnikId: auth.userId,
        zivotinjaId,
        kontakt,
        motivacija,
        status: "NA_CEKANJU",
      },
    });

    // kasnije: eksterni email API i upis u Notifikacija

    return ok(created, 201);
  } catch (e) {
    console.error("POST ZAHTEV USVAJANJE ERROR:", e);
    return fail("Greška pri slanju zahteva.", 500, "SERVER_ERROR");
  }
}
