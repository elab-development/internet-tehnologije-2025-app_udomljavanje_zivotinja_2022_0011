export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json().catch(() => ({}));

    const iskustvo = String(body?.iskustvo ?? "").trim();
    const motivacija = String(body?.motivacija ?? "").trim();

    if (!iskustvo || !motivacija) {
      return fail("Iskustvo i motivacija su obavezni.", 400, "VALIDATION");
    }

    // sprecava dupliranje zahteva
    const vecPostoji = await prisma.zahtevZaVolontera.findFirst({
      where: { korisnikId: auth.userId },
    });
    if (vecPostoji) {
      return fail("Već ste podneli zahtev za volontera.", 409, "ALREADY_EXISTS");
    }

    const zahtev = await prisma.zahtevZaVolontera.create({
      data: {
        iskustvo,
        motivacija,
        korisnikId: auth.userId,
      },
    });

    return ok(zahtev, 201);
  } catch (e: any) {
    console.error("POST ZAHTEV VOLONTER ERROR:", e);
    return fail("Greška pri podnošenju zahteva.", 500, "SERVER_ERROR");
  }
}

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const forbidden = requireRole(auth, ["ADMIN"]);
  if (forbidden) return forbidden;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const data = await prisma.zahtevZaVolontera.findMany({
      where,
      orderBy: { vremePodnosenjaZahteva: "desc" },
      include: {
        korisnik: { select: { id: true, ime: true, prezime: true, email: true, role: true } },
      },
    });

    return ok(data, 200);
  } catch (e: any) {
    console.error("GET ZAHTEVI VOLONTER ERROR:", e);
    return fail("Greška pri učitavanju zahteva.", 500, "SERVER_ERROR");
  }
}

