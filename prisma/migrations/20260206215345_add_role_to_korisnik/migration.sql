/*
  Warnings:

  - You are about to drop the column `uloga` on the `korisnik` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Korisnik` DROP COLUMN `uloga`,
    ADD COLUMN `role` ENUM('ADMIN', 'VOLONTER', 'UDOMITELJ') NOT NULL DEFAULT 'UDOMITELJ';
