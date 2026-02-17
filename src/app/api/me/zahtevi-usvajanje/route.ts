export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth } from "@/lib/guard";

export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const data = await prisma.zahtevZaUsvajanje.findMany({
      where: { korisnikId: auth.userId },
      orderBy: { vremePodnosenjaZahteva: "desc" },
      include: {
        zivotinja: {
          select: {
            id: true,
            ime: true,
            vrsta: true,
            starost: true,
            pol: true,
            lokacija: true,
            status: true,
            slikaUrl: true,
          },
        },
      },
    });

    return ok(data, 200);
  } catch (e: any) {
    console.error("GET /api/me/zahtevi-usvajanje ERROR:", e);
    return fail("Greška pri učitavanju zahteva.", 500, "SERVER_ERROR");
  }
}
