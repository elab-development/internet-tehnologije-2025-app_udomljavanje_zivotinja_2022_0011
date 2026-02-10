export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { hashLozinka } from "@/lib/auth";

// POST /api/auth/register
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ime = String(body?.ime ?? "").trim();
    const prezime = String(body?.prezime ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const lozinka = String(body?.lozinka ?? "");

    // YYYY-MM-DD
    const datumRodjenjaRaw = String(body?.datumRodjenja ?? "").trim();

    if (!ime || !prezime || !email || !lozinka) {
      return fail(
        "Nedostaju obavezna polja (ime, prezime, email, lozinka).",
        400,
        "VALIDATION"
      );
    }

   
    if (!datumRodjenjaRaw) {
      return fail("Nedostaje datum rođenja.", 400, "VALIDATION");
    }

    if (!email.includes("@")) {
      return fail("Neispravan email.", 400, "VALIDATION");
    }

    const datumRodjenja = new Date(datumRodjenjaRaw);
    if (Number.isNaN(datumRodjenja.getTime())) {
      return fail("Neispravan datum rođenja.", 400, "VALIDATION");
    }

    const postoji = await prisma.korisnik.findUnique({ where: { email } });
    if (postoji) {
      return fail("Korisnik sa tim email-om već postoji.", 409, "EMAIL_TAKEN");
    }

    const hashed = await hashLozinka(lozinka);

    const user = await prisma.korisnik.create({
      data: {
        ime,
        prezime,
        email,
        lozinka: hashed,
        datumRodjenja, 
      },
      select: {
        id: true,
        ime: true,
        prezime: true,
        email: true,
        role: true,
        datumRodjenja: true,
        createdAt: true,
      },
    });

    return ok(user, 201);
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return fail("Greška pri registraciji.", 500, "SERVER_ERROR");
  }
}
