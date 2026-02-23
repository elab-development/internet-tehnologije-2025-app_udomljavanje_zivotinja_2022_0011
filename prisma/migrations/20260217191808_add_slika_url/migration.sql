/*
  Warnings:

  - The values [NEUSPEŠNA] on the enum `Notifikacija_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Notifikacija` MODIFY `status` ENUM('DRAFT', 'POSLATA', 'NEUSPESNA') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `Zivotinja` ADD COLUMN `slikaUrl` VARCHAR(191) NULL;
