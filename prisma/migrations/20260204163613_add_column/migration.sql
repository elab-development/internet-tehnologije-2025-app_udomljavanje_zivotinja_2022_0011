/*
  Warnings:

  - Added the required column `updatedAt` to the `Korisnik` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notifikacija` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ZahtevZaUsvajanje` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ZahtevZaVolontera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Zivotinja` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Korisnik` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Notifikacija` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ZahtevZaUsvajanje` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ZahtevZaVolontera` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Zivotinja` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
