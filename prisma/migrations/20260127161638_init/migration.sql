-- CreateTable
CREATE TABLE `Korisnik` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ime` VARCHAR(191) NOT NULL,
    `prezime` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `lozinka` VARCHAR(191) NOT NULL,
    `uloga` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Korisnik_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Zivotinja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ime` VARCHAR(191) NOT NULL,
    `vrsta` VARCHAR(191) NOT NULL,
    `starost` INTEGER NOT NULL,
    `pol` VARCHAR(191) NOT NULL,
    `lokacija` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `opis` VARCHAR(191) NOT NULL,
    `postavljeno` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `korisnikId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ZahtevZaUsvajanje` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kontakt` VARCHAR(191) NOT NULL,
    `motivacija` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `vremePodnosenjaZahteva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `komentarVolontera` VARCHAR(191) NULL,
    `korisnikId` INTEGER NOT NULL,
    `zivotinjaId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ZahtevZaVolontera` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `iskustvo` VARCHAR(191) NOT NULL,
    `motivacija` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `vremePodnosenjaZahteva` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `korisnikId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notifikacija` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `naMail` VARCHAR(191) NOT NULL,
    `naslov` VARCHAR(191) NOT NULL,
    `tekst` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `vremeSlanja` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `zahtevId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Zivotinja` ADD CONSTRAINT `Zivotinja_korisnikId_fkey` FOREIGN KEY (`korisnikId`) REFERENCES `Korisnik`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ZahtevZaUsvajanje` ADD CONSTRAINT `ZahtevZaUsvajanje_korisnikId_fkey` FOREIGN KEY (`korisnikId`) REFERENCES `Korisnik`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ZahtevZaUsvajanje` ADD CONSTRAINT `ZahtevZaUsvajanje_zivotinjaId_fkey` FOREIGN KEY (`zivotinjaId`) REFERENCES `Zivotinja`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ZahtevZaVolontera` ADD CONSTRAINT `ZahtevZaVolontera_korisnikId_fkey` FOREIGN KEY (`korisnikId`) REFERENCES `Korisnik`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifikacija` ADD CONSTRAINT `Notifikacija_zahtevId_fkey` FOREIGN KEY (`zahtevId`) REFERENCES `ZahtevZaUsvajanje`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
