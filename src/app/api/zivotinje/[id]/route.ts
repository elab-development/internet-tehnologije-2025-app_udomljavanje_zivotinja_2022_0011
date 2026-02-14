export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";

type Ctx = { params: { id: string } };

function parseId(ctx: Ctx) {
  const idStr = ctx?.params?.id;
  const id = parseInt(idStr, 10);
  if (!idStr || Number.isNaN(id)) return null;
  return id;
}

// GET 
export async function GET(_: Request, ctx: Ctx) {
  try {
    const id = parseId(ctx);
    if (!id) return fail("Neispravan id.", 400, "VALIDATION");

    const data = await prisma.zivotinja.findUnique({
      where: { id },
      include: { korisnik: { select: { id: true, ime: true, prezime: true } } },
    });

    if (!data) return fail("Životinja nije pronađena.", 404, "NOT_FOUND");
    return ok(data, 200);
  } catch (e) {
    console.error("GET ZIVOTINJA ID ERROR:", e);
    return fail("Greška pri učitavanju životinje.", 500, "SERVER_ERROR");
  }
}

// PUT 
export async function PUT(req: Request, ctx: Ctx) {
  try {
    const id = parseId(ctx);
    if (!id) return fail("Neispravan id.", 400, "VALIDATION");

    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const roleResp = requireRole(auth, ["VOLONTER", "ADMIN"]);
    if (roleResp) return roleResp;

    const existing = await prisma.zivotinja.findUnique({ where: { id } });
    if (!existing) return fail("Životinja nije pronađena.", 404, "NOT_FOUND");

 
    if (auth.role === "VOLONTER" && existing.korisnikId !== auth.userId) {
      return fail("Nemate dozvolu za izmenu ove životinje.", 403, "FORBIDDEN");
    }

    const body = await req.json().catch(() => ({}));
    const data: any = {};

    if (body?.ime != null) data.ime = String(body.ime).trim();
    if (body?.vrsta != null) data.vrsta = String(body.vrsta).trim();
    if (body?.pol != null) data.pol = String(body.pol).trim();
    if (body?.lokacija != null) data.lokacija = String(body.lokacija).trim();
    if (body?.opis != null) data.opis = String(body.opis).trim();
    if (body?.starost != null) {
      const s = Number(body.starost);
      if (!Number.isFinite(s)) return fail("Neispravna starost.", 400, "VALIDATION");
      data.starost = s;
    }
    if (body?.status != null) data.status = String(body.status).trim(); // AKTIVNA/UDOMLJENA/PAUZIRANA

    const updated = await prisma.zivotinja.update({ where: { id }, data });
    return ok(updated, 200);
  } catch (e) {
    console.error("PUT ZIVOTINJA ERROR:", e);
    return fail("Greška pri izmeni životinje.", 500, "SERVER_ERROR");
  }
}

// DELETE 
export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const id = parseId(ctx);
    if (!id) return fail("Neispravan id.", 400, "VALIDATION");

    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const roleResp = requireRole(auth, ["VOLONTER", "ADMIN"]);
    if (roleResp) return roleResp;

    const existing = await prisma.zivotinja.findUnique({ where: { id } });
    if (!existing) return fail("Životinja nije pronađena.", 404, "NOT_FOUND");

    if (auth.role === "VOLONTER" && existing.korisnikId !== auth.userId) {
      return fail("Nemate dozvolu da obrišete ovu životinju.", 403, "FORBIDDEN");
    }

    await prisma.zivotinja.delete({ where: { id } });
    return ok({ deleted: true }, 200);
  } catch (e) {
    console.error("DELETE ZIVOTINJA ERROR:", e);
    return fail("Greška pri brisanju životinje.", 500, "SERVER_ERROR");
  }
}
