import { PrismaClient, Role, StatusZivotinje } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  const admin = await prisma.korisnik.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      ime: "Admin",
      prezime: "Admin",
      email: "admin@test.com",
      lozinka: await bcrypt.hash("admin123", 10),
      role: Role.ADMIN,
    },
  });

  const volonter = await prisma.korisnik.upsert({
    where: { email: "volonter@test.com" },
    update: {},
    create: {
      ime: "Vera",
      prezime: "Volonter",
      email: "volonter@test.com",
      lozinka: await bcrypt.hash("volonter123", 10),
      role: Role.VOLONTER,
    },
  });

  const udomitelj = await prisma.korisnik.upsert({
    where: { email: "udomitelj@test.com" },
    update: {},
    create: {
      ime: "Uros",
      prezime: "Udomitelj",
      email: "udomitelj@test.com",
      lozinka: await bcrypt.hash("udomitelj123", 10),
      role: Role.UDOMITELJ,
    },
  });


  const brojZivotinja = await prisma.zivotinja.count();
  if (brojZivotinja > 0) {
    console.log(`Seed skipped: Zivotinja already has ${brojZivotinja} rows.`);
    return;
  }

  await prisma.zivotinja.createMany({
    data: [
      {
        ime: "Luna",
        vrsta: "Pas",
        starost: 2,
        pol: "Ž",
        lokacija: "Beograd",
        status: StatusZivotinje.AKTIVNA,
        opis: "Vesela i nežna, voli šetnje i društvo.",
        slikaUrl: "https://placehold.co/600x400?text=Luna",
        korisnikId: volonter.id,
      },
      {
        ime: "Maks",
        vrsta: "Pas",
        starost: 4,
        pol: "M",
        lokacija: "Novi Sad",
        status: StatusZivotinje.AKTIVNA,
        opis: "Miran i poslušan, idealan za porodicu.",
        slikaUrl: "https://placehold.co/600x400?text=Maks",
        korisnikId: volonter.id,
      },
      {
        ime: "Kiki",
        vrsta: "Mačka",
        starost: 1,
        pol: "Ž",
        lokacija: "Niš",
        status: StatusZivotinje.AKTIVNA,
        opis: "Razigrana mačka, voli da se mazi.",
        slikaUrl: "https://placehold.co/600x400?text=Kiki",
        korisnikId: volonter.id,
      },
      {
        ime: "Boni",
        vrsta: "Pas",
        starost: 6,
        pol: "M",
        lokacija: "Kragujevac",
        status: StatusZivotinje.PAUZIRANA,
        opis: "Stariji pas, treba mu mirniji dom.",
        slikaUrl: "https://placehold.co/600x400?text=Boni",
        korisnikId: volonter.id,
      },
      {
        ime: "Mia",
        vrsta: "Mačka",
        starost: 3,
        pol: "Ž",
        lokacija: "Beograd",
        status: StatusZivotinje.AKTIVNA,
        opis: "Mirna i uredna, naviknuta na stan.",
        slikaUrl: "https://placehold.co/600x400?text=Mia",
        korisnikId: volonter.id,
      },
      {
        ime: "Roki",
        vrsta: "Pas",
        starost: 5,
        pol: "M",
        lokacija: "Subotica",
        status: StatusZivotinje.UDOMLJENA,
        opis: "Već udomljen, primer statistike i mape.",
        slikaUrl: "https://placehold.co/600x400?text=Roki",
        korisnikId: volonter.id,
      },
    ],
  });

  console.log("Seed done");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });