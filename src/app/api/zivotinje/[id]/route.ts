export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";

type Params = { params: { id: string } };

// GET /api/zivotinje/:id  (PUBLIC)
export async function GET(_: Request, { params }: Params) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return fail("Neispravan id.", 400, "VALIDATION");
    }

    const data = await prisma.zivotinja.findUnique({
      where: { id },
      include: {
        korisnik: { select: { id: true, ime: true, prezime: true } },
      },
    });

    if (!data) {
      return fail("Životinja nije pronađena.", 404, "NOT_FOUND");
    }

    return ok(data, 200);
  } catch (e: any) {
    console.error("GET ZIVOTINJA ID ERROR:", e);
    return fail("Greška pri učitavanju životinje.", 500, "SERVER_ERROR");
  }
}

// PATCH /api/zivotinje/:id  (PROTECTED: ADMIN/VOLONTER)
export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const forbidden = requireRole(auth, ["ADMIN", "VOLONTER"]);
  if (forbidden) return forbidden;

  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return fail("Neispravan id.", 400, "VALIDATION");
    }

    const body = await req.json().catch(() => ({}));

    // dozvoli parcijalni update
    const ime = body?.ime !== undefined ? String(body.ime).trim() : undefined;
    const vrsta = body?.vrsta !== undefined ? String(body.vrsta).trim() : undefined;
    const pol = body?.pol !== undefined ? String(body.pol).trim() : undefined;
    const lokacija = body?.lokacija !== undefined ? String(body.lokacija).trim() : undefined;
    const opis = body?.opis !== undefined ? String(body.opis).trim() : undefined;

    const starost =
      body?.starost !== undefined ? Number(body.starost) : undefined;

    // Validacije samo za polja koja su poslata
    if (ime !== undefined && !ime) return fail("Ime ne može biti prazno.", 400, "VALIDATION");
    if (vrsta !== undefined && !vrsta) return fail("Vrsta ne može biti prazna.", 400, "VALIDATION");
    if (pol !== undefined && !pol) return fail("Pol ne može biti prazan.", 400, "VALIDATION");
    if (lokacija !== undefined && !lokacija) return fail("Lokacija ne može biti prazna.", 400, "VALIDATION");
    if (opis !== undefined && !opis) return fail("Opis ne može biti prazan.", 400, "VALIDATION");

    if (starost !== undefined) {
      if (!Number.isFinite(starost) || starost <= 0) {
        return fail("Starost mora biti pozitivan broj.", 400, "VALIDATION");
      }
    }

    // update payload
    const dataToUpdate: any = {};
    if (ime !== undefined) dataToUpdate.ime = ime;
    if (vrsta !== undefined) dataToUpdate.vrsta = vrsta;
    if (starost !== undefined) dataToUpdate.starost = starost;
    if (pol !== undefined) dataToUpdate.pol = pol;
    if (lokacija !== undefined) dataToUpdate.lokacija = lokacija;
    if (opis !== undefined) dataToUpdate.opis = opis;

    if (Object.keys(dataToUpdate).length === 0) {
      return fail("Nema polja za izmenu.", 400, "VALIDATION");
    }

    // prvo proveri da li postoji (lepši 404)
    const postoji = await prisma.zivotinja.findUnique({ where: { id } });
    if (!postoji) {
      return fail("Životinja nije pronađena.", 404, "NOT_FOUND");
    }

    const izmenjena = await prisma.zivotinja.update({
      where: { id },
      data: dataToUpdate,
    });

    return ok(izmenjena, 200);
  } catch (e: any) {
    console.error("PATCH ZIVOTINJA ERROR:", e);
    return fail("Greška pri izmeni životinje.", 500, "SERVER_ERROR");
  }
}

// DELETE /api/zivotinje/:id  (PROTECTED: ADMIN/VOLONTER)
export async function DELETE(req: Request, { params }: Params) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const forbidden = requireRole(auth, ["ADMIN", "VOLONTER"]);
  if (forbidden) return forbidden;

  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return fail("Neispravan id.", 400, "VALIDATION");
    }

    const postoji = await prisma.zivotinja.findUnique({ where: { id } });
    if (!postoji) {
      return fail("Životinja nije pronađena.", 404, "NOT_FOUND");
    }

    await prisma.zivotinja.delete({ where: { id } });

    return ok({ deleted: true, id }, 200);
  } catch (e: any) {
    console.error("DELETE ZIVOTINJA ERROR:", e);
    return fail("Greška pri brisanju životinje.", 500, "SERVER_ERROR");
  }
}
