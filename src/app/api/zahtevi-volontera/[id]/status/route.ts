export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";
import { StatusZahteva } from "@prisma/client";

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  //SAMO ADMIN
  const forbidden = requireRole(auth, ["ADMIN"]);
  if (forbidden) return forbidden;

  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return fail("Neispravan id zahteva.", 400, "VALIDATION");
    }

    const body = await req.json().catch(() => ({}));
    const status = body?.status as StatusZahteva;

    const dozvoljeni = ["NA_CEKANJU", "ODOBREN", "ODBIJEN", "OTKAZAN"];
    if (!dozvoljeni.includes(status)) {
      return fail("Neispravan status.", 400, "VALIDATION");
    }

    const postoji = await prisma.zahtevZaVolontera.findUnique({ where: { id } });
    if (!postoji) return fail("Zahtev nije pronađen.", 404, "NOT_FOUND");

    //promeni status zahteva
    const izmenjen = await prisma.zahtevZaVolontera.update({
      where: { id },
      data: { status },
    });

    //ako je ODOBREN user postaje VOLONTER
    if (status === "ODOBREN") {
      await prisma.korisnik.update({
        where: { id: izmenjen.korisnikId },
        data: { role: "VOLONTER" },
      });
    }

    return ok(izmenjen, 200);
  } catch (e: any) {
    console.error("PATCH ZAHTEV VOLONTER STATUS ERROR:", e);
    return fail("Greška pri izmeni statusa.", 500, "SERVER_ERROR");
  }
}
