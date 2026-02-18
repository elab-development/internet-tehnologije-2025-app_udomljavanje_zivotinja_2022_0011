export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";
import { StatusZahteva, StatusNotifikacije } from "@prisma/client";
import { posaljiMail } from "@/lib/mailer";

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

    const noviStatus = map[raw];
    if (!noviStatus) return fail("Neispravan status.", 400, "VALIDATION");

    // Učitaj zahtev + udomitelj + životinja (da imamo email, ime i vlasnika)
    const zahtev = await prisma.zahtevZaUsvajanje.findUnique({
      where: { id },
      include: {
        korisnik: { select: { email: true, ime: true, prezime: true } },
        zivotinja: { select: { id: true, ime: true, korisnikId: true } },
      },
    });

    if (!zahtev) return fail("Zahtev nije pronađen.", 404, "NOT_FOUND");

    // VOLONTER sme samo ako je on postavio životinju
    if (auth.role === "VOLONTER" && zahtev.zivotinja.korisnikId !== auth.userId) {
      return fail("Nemate pravo da menjate ovaj zahtev.", 403, "FORBIDDEN");
    }

    const stariStatus = zahtev.status;

    // 1) Sve DB promene u transakciji
    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.zahtevZaUsvajanje.update({
        where: { id: zahtev.id },
        data: {
          status: noviStatus,
          komentarVolontera: komentarVolontera ? komentarVolontera : null,
        },
      });

      // Ako je zahtev odobren → životinja postaje udomljena + ostali pending zahtevi se odbijaju
      if (noviStatus === StatusZahteva.ODOBREN) {
        await tx.zivotinja.update({
          where: { id: zahtev.zivotinja.id },
          data: { status: "UDOMLJENA" },
        });

        await tx.zahtevZaUsvajanje.updateMany({
          where: {
            zivotinjaId: zahtev.zivotinja.id,
            status: StatusZahteva.NA_CEKANJU,
            NOT: { id: zahtev.id },
          },
          data: { status: StatusZahteva.ODBIJEN },
        });
      }

      return up;
    });

    // 2) Slanje mejla + upis notifikacije (samo ako se status promenio)
    if (stariStatus !== noviStatus) {
      const to = zahtev.korisnik.email;
      const punoIme = `${zahtev.korisnik.ime} ${zahtev.korisnik.prezime}`.trim();
      const imeZivotinje = zahtev.zivotinja.ime;

      const subject = `ResQ collective – Status zahteva: ${noviStatus}`;
      const text =
        `Zdravo ${punoIme || ""}\n\n` +
        `Status tvog zahteva za udomljavanje za "${imeZivotinje}" je promenjen.\n` +
        `Novi status: ${noviStatus}\n` +
        (komentarVolontera ? `Komentar volontera: ${komentarVolontera}\n` : "") +
        `\nHvala što pomažeš napuštenim životinjama!\nResQ collective`;

      // Kreiraj notifikaciju kao DRAFT
      const notif = await prisma.notifikacija.create({
        data: {
          naMail: to,
          naslov: subject,
          tekst: text,
          status: StatusNotifikacije.DRAFT,
          zahtevId: zahtev.id,
        },
      });

      try {
        await posaljiMail({ to, subject, text });

        await prisma.notifikacija.update({
          where: { id: notif.id },
          data: { status: StatusNotifikacije.POSLATA },
        });
      } catch (e) {
        console.error("MAIL SEND ERROR:", e);

        await prisma.notifikacija.update({
          where: { id: notif.id },
          data: { status: StatusNotifikacije.NEUSPESNA },
        });
      }
    }

    return ok(updated, 200);
  } catch (e: any) {
    console.error("PATCH ZAHTEV USAJANJE STATUS ERROR:", e);
    return fail("Greška na serveru.", 500, "SERVER_ERROR");
  }
}
