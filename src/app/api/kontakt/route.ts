export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";

function validanEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/kontakt (PUBLIC) - šalje poruku
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const ime = (body?.ime ?? "").trim();
    const email = (body?.email ?? "").trim();
    const poruka = (body?.poruka ?? "").trim();

    if (!ime || ime.length < 3) {
      return fail("Unesi ime i prezime (min 3 karaktera).", 400, "VALIDATION");
    }
    if (!email || !validanEmail(email)) {
      return fail("Unesi ispravnu email adresu.", 400, "VALIDATION");
    }
    if (!poruka || poruka.length < 10) {
      return fail("Poruka mora imati bar 10 karaktera.", 400, "VALIDATION");
    }

    const sacuvano = await prisma.kontaktPoruka.create({
      data: { ime, email, poruka },
      select: { id: true, createdAt: true },
    });

    return ok(
      {
        message: "Poruka je poslata. Javićemo ti se uskoro.",
        ...sacuvano,
      },
      201
    );
  } catch (e: any) {
    console.error("KONTAKT POST ERROR:", e);
    return fail("Greška na serveru.", 500, "SERVER_ERROR");
  }
}

// GET /api/kontakt (ADMIN) - lista poruka
export async function GET(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const forbidden = requireRole(auth, ["ADMIN"]);
    if (forbidden) return forbidden;

    const data = await prisma.kontaktPoruka.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        ime: true,
        email: true,
        poruka: true,
        createdAt: true,
      },
    });

    return ok(data, 200);
  } catch (e: any) {
    console.error("KONTAKT GET ERROR:", e);
    return fail("Greška na serveru.", 500, "SERVER_ERROR");
  }
}
