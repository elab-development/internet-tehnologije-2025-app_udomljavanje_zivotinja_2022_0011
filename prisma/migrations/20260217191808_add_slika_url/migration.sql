/*
  Warnings:

  - The values [NEUSPEŠNA] on the enum `Notifikacija_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `notifikacija` MODIFY `status` ENUM('DRAFT', 'POSLATA', 'NEUSPESNA') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `zivotinja` ADD COLUMN `slikaUrl` VARCHAR(191) NULL;
