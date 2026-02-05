/*
  Warnings:

  - Added the required column `updatedAt` to the `Korisnik` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notifikacija` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ZahtevZaUsvajanje` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ZahtevZaVolontera` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Zivotinja` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `korisnik` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `notifikacija` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `zahtevzausvajanje` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `zahtevzavolontera` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `zivotinja` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
