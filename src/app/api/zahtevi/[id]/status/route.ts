export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { StatusZahteva } from "@prisma/client";

import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";

type Params = { params: { id: string } };


export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const forbidden = requireRole(auth, ["ADMIN", "VOLONTER"]);
  if (forbidden) return forbidden;

  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return fail("Neispravan id zahteva.", 400, "VALIDATION");
    }

    const body = await req.json().catch(() => ({}));
    const status = body?.status as StatusZahteva;


    const dozvoljeni = [ "NA_CEKANJU", "ODOBREN", "ODBIJEN", "OTKAZAN"];
    if (!dozvoljeni.includes(status)) {
      return fail(
        "Status mora biti NA_CEKANJU, ODOBREN, ODBIJEN, OTKAZAN",
        400,
        "VALIDATION"
      );
    }


    const postoji = await prisma.zahtevZaUsvajanje.findUnique({
      where: { id },
    });

    if (!postoji) {
      return fail("Zahtev nije pronađen.", 404, "NOT_FOUND");
    }

    const izmenjen = await prisma.zahtevZaUsvajanje.update({
      where: { id },
      data: { status },
    });

    return ok(izmenjen, 200);
  } catch (e: any) {
    console.error("PATCH ZAHTEV STATUS ERROR:", e);
    return fail("Greška pri izmeni statusa zahteva.", 500, "SERVER_ERROR");
  }
}
