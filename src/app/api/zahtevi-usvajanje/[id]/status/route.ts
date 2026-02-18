export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";
import { StatusZahteva, StatusNotifikacije } from "@prisma/client";
import { posaljiMail } from "@/lib/mailer";

type Ctx = { params: { id: string } } | { params: Promise<{ id: string }> };

async function parseId(ctx: Ctx) {
  const params = await (ctx as any).params;
  const idStr = params?.id;
  const id = Number(idStr);
  if (!idStr || !Number.isFinite(id)) return null;
  return id;
}



type AutoOdbijen = {
  zahtevId: number;
  email: string;
  ime: string;
  prezime: string;
};

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const forbidden = requireRole(auth, ["VOLONTER", "ADMIN"]);
  if (forbidden) return forbidden;

  try {
    const id = await parseId(ctx);
    if (!id) return fail("Neispravan id.", 400, "VALIDATION");

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

    const zahtev = await prisma.zahtevZaUsvajanje.findUnique({
      where: { id },
      include: {
        korisnik: { select: { email: true, ime: true, prezime: true } },
        zivotinja: { select: { id: true, ime: true, korisnikId: true } },
      },
    });

    if (!zahtev) return fail("Zahtev nije pronađen.", 404, "NOT_FOUND");


    if (auth.role === "VOLONTER" && zahtev.zivotinja.korisnikId !== auth.userId) {
      return fail("Nemate pravo da menjate ovaj zahtev.", 403, "FORBIDDEN");
    }

    const stariStatus = zahtev.status;

    let autoOdbijeni: AutoOdbijen[] = [];


    const updated = await prisma.$transaction(async (tx) => {
      const up = await tx.zahtevZaUsvajanje.update({
        where: { id: zahtev.id },
        data: {
          status: noviStatus,
          komentarVolontera: komentarVolontera ? komentarVolontera : null,
        },
      });

      if (noviStatus === StatusZahteva.ODOBREN) {
        // životinja postaje udomljena
        await tx.zivotinja.update({
          where: { id: zahtev.zivotinja.id },
          data: { status: "UDOMLJENA" },
        });


        const others = await tx.zahtevZaUsvajanje.findMany({
          where: {
            zivotinjaId: zahtev.zivotinja.id,
            status: StatusZahteva.NA_CEKANJU,
            NOT: { id: zahtev.id },
          },
          select: {
            id: true,
            korisnik: { select: { email: true, ime: true, prezime: true } },
          },
        });

        autoOdbijeni = others.map((o) => ({
          zahtevId: o.id,
          email: o.korisnik.email,
          ime: o.korisnik.ime,
          prezime: o.korisnik.prezime,
        }));


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


    async function snimiINajaviMail(args: {
      to: string;
      subject: string;
      text: string;
      zahtevId: number;
    }) {
      try {
        const notif = await prisma.notifikacija.create({
          data: {
            naMail: args.to,
            naslov: args.subject,
            tekst: args.text,
            status: StatusNotifikacije.DRAFT,
            zahtevId: args.zahtevId,
          },
        });

        try {
          await posaljiMail({ to: args.to, subject: args.subject, text: args.text });
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
      } catch (e) {
        console.error("NOTIF CREATE/UPDATE ERROR:", e);
      }
    }

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

      await snimiINajaviMail({ to, subject, text, zahtevId: zahtev.id });
    }


    if (noviStatus === StatusZahteva.ODOBREN && autoOdbijeni.length > 0) {
      const imeZivotinje = zahtev.zivotinja.ime;

      for (const o of autoOdbijeni) {
        const punoIme = `${o.ime} ${o.prezime}`.trim();

        const subject = `ResQ collective – Zahtev odbijen`;
        const text =
          `Zdravo ${punoIme || ""}\n\n` +
          `Nažalost, zahtev za udomljavanje za "${imeZivotinje}" je odbijen ` +
          `jer je životinja u međuvremenu udomljena.\n\n` +
          `Hvala ti na interesovanju i što pomažeš napuštenim životinjama!\n` +
          `ResQ collective`;

        await snimiINajaviMail({
          to: o.email,
          subject,
          text,
          zahtevId: o.zahtevId,
        });
      }
    }

    return ok(updated, 200);
  } catch (e) {
    console.error("PATCH ZAHTEV USAJANJE STATUS ERROR:", e);
    return fail("Greška na serveru.", 500, "SERVER_ERROR");
  }
}
