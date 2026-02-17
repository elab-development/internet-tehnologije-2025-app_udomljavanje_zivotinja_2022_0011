export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";
import { StatusZahteva } from "@prisma/client";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const forbidden = requireRole(auth, ["VOLONTER", "ADMIN"]);
  if (forbidden) return forbidden;

  try {
    const id = Number(ctx.params.id);
    if (!Number.isFinite(id)) return fail("Neispravan id.", 400, "VALIDATION");

    const body = await req.json().catch(() => ({}));
    const raw = String(body?.status ?? "").trim();
    const komentarVolontera = String(body?.komentarVolontera ?? "").trim();

    const map: Record<string, StatusZahteva> = {
      NA_CEKANJU: StatusZahteva.NA_CEKANJU,
      ODOBREN: StatusZahteva.ODOBREN,
      ODBIJEN: StatusZahteva.ODBIJEN,
      OTKAZAN: StatusZahteva.OTKAZAN,
    };

    const status = map[raw];
    if (!status) return fail("Neispravan status.", 400, "VALIDATION");

    const zahtev = await prisma.zahtevZaUsvajanje.findUnique({
      where: { id },
      select: {
        id: true,
        zivotinjaId: true,
        zivotinja: { select: { korisnikId: true } },
      },
    });

    if (!zahtev) return fail("Zahtev nije pronađen.", 404, "NOT_FOUND");

    if (auth.role === "VOLONTER" && zahtev.zivotinja.korisnikId !== auth.userId) {
      return fail("Nemate pravo da menjate ovaj zahtev.", 403, "FORBIDDEN");
    }

    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.zahtevZaUsvajanje.update({
        where: { id: zahtev.id },
        data: {
          status,
          komentarVolontera: komentarVolontera ? komentarVolontera : undefined,
        },
      });

      if (status === StatusZahteva.ODOBREN) {
        await tx.zivotinja.update({
          where: { id: zahtev.zivotinjaId },
          data: { status: "UDOMLJENA" },
        });

        await tx.zahtevZaUsvajanje.updateMany({
          where: {
            zivotinjaId: zahtev.zivotinjaId,
            status: StatusZahteva.NA_CEKANJU,
            NOT: { id: zahtev.id },
          },
          data: { status: StatusZahteva.ODBIJEN },
        });
      }

      return up;
    });

    return ok(updated, 200);
  } catch (e: any) {
    console.error("PATCH ZAHTEV USAJANJE STATUS ERROR:", e);
    return fail("Greška na serveru.", 500, "SERVER_ERROR");
  }
}
