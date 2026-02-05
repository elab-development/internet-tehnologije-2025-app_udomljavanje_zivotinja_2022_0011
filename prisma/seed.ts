import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.korisnik.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      ime: "Admin",
      prezime: "Admin",
      email: "admin@test.com",
      lozinka: "admin123",
      role: Role.ADMIN,
    },
  });

  await prisma.korisnik.upsert({
    where: { email: "volonter@test.com" },
    update: {},
    create: {
      ime: "Vera",
      prezime: "Volonter",
      email: "volonter@test.com",
      lozinka: "volonter123",
      role: Role.VOLONTER,
    },
  });

  await prisma.korisnik.upsert({
    where: { email: "udomitelj@test.com" },
    update: {},
    create: {
      ime: "Uros",
      prezime: "Udomitelj",
      email: "udomitelj@test.com",
      lozinka: "udomitelj123",
      role: Role.UDOMITELJ,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
