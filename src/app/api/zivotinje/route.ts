export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAuth, requireRole } from "@/lib/guard";

function parseIntSafe(v: string | null) {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

// GET 
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const status = (searchParams.get("status") ?? "").trim();
    const vrsta = (searchParams.get("vrsta") ?? "").trim();
    const pol = (searchParams.get("pol") ?? "").trim();
    const lokacija = (searchParams.get("lokacija") ?? "").trim();
    const q = (searchParams.get("q") ?? "").trim();

    const minStarost = parseIntSafe(searchParams.get("minStarost"));
    const maxStarost = parseIntSafe(searchParams.get("maxStarost"));

    const where: any = {};

    if (status) where.status = status; // AKTIVNA/UDOMLJENA/PAUZIRANA
    if (vrsta) where.vrsta = { equals: vrsta, mode: "insensitive" };
    if (pol) where.pol = { equals: pol, mode: "insensitive" };
    if (lokacija) where.lokacija = { contains: lokacija, mode: "insensitive" };
    if (q) where.ime = { contains: q, mode: "insensitive" };

    if (minStarost != null || maxStarost != null) {
      where.starost = {};
      if (minStarost != null) where.starost.gte = minStarost;
      if (maxStarost != null) where.starost.lte = maxStarost;
    }

    const data = await prisma.zivotinja.findMany({
      where,
      orderBy: { postavljeno: "desc" },
      select: {
        id: true,
        ime: true,
        vrsta: true,
        starost: true,
        pol: true,
        lokacija: true,
        status: true,
      },
    });

    return ok(data, 200);
  } catch (e) {
    console.error("GET ZIVOTINJE ERROR:", e);
    return fail("Greška pri učitavanju životinja.", 500, "SERVER_ERROR");
  }
}

// POST (VOLONTER/ADMIN)
export async function POST(req: Request) {
  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const roleResp = requireRole(auth, ["VOLONTER", "ADMIN"]);
    if (roleResp) return roleResp;

    const body = await req.json().catch(() => ({}));

    const ime = String(body?.ime ?? "").trim();
    const vrsta = String(body?.vrsta ?? "").trim();
    const pol = String(body?.pol ?? "").trim();
    const lokacija = String(body?.lokacija ?? "").trim();
    const opis = String(body?.opis ?? "").trim();
    const starost = Number(body?.starost);

    if (!ime || !vrsta || !pol || !lokacija || !opis || !Number.isFinite(starost)) {
      return fail("Nedostaju obavezna polja.", 400, "VALIDATION");
    }

    const created = await prisma.zivotinja.create({
      data: {
        ime,
        vrsta,
        pol,
        lokacija,
        opis,
        starost,
        status: "AKTIVNA",
        korisnikId: auth.userId,
      },
    });

    return ok(created, 201);
  } catch (e) {
    console.error("POST ZIVOTINJA ERROR:", e);
    return fail("Greška pri dodavanju životinje.", 500, "SERVER_ERROR");
  }
}
