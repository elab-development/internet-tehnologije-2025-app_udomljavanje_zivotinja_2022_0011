/*
  Warnings:

  - You are about to alter the column `status` on the `notifikacija` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to alter the column `status` on the `zahtevzausvajanje` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `status` on the `zahtevzavolontera` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `status` on the `zivotinja` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Notifikacija` MODIFY `status` ENUM('DRAFT', 'POSLATA', 'NEUSPEŠNA') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `ZahtevZaUsvajanje` MODIFY `status` ENUM('NA_CEKANJU', 'ODOBREN', 'ODBIJEN', 'OTKAZAN') NOT NULL DEFAULT 'NA_CEKANJU';

-- AlterTable
ALTER TABLE `ZahtevZaVolontera` MODIFY `status` ENUM('NA_CEKANJU', 'ODOBREN', 'ODBIJEN', 'OTKAZAN') NOT NULL DEFAULT 'NA_CEKANJU';

-- AlterTable
ALTER TABLE `Zivotinja` MODIFY `status` ENUM('AKTIVNA', 'UDOMLJENA', 'PAUZIRANA') NOT NULL DEFAULT 'AKTIVNA';
