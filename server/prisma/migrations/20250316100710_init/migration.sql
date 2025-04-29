-- AlterTable
ALTER TABLE `task` ADD COLUMN `devisId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Devis` (
    `id` VARCHAR(191) NOT NULL,
    `numero_dac` VARCHAR(191) NULL,
    `libelle` VARCHAR(191) NULL,
    `version` INTEGER NULL,
    `date_emission` DATE NULL,
    `pole` VARCHAR(191) NULL,
    `application` VARCHAR(191) NULL,
    `date_debut` DATE NULL,
    `date_fin` DATE NULL,
    `charge_hj` DECIMAL(10, 2) NULL,
    `montant` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `statut` VARCHAR(191) NULL,
    `statut_realisation` VARCHAR(191) NULL,
    `jour_homme_consomme` INTEGER NULL,
    `ecart` DECIMAL(6, 2) NULL,
    `hommeJourActive` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserDevis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `devisId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserDevis` ADD CONSTRAINT `UserDevis_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDevis` ADD CONSTRAINT `UserDevis_devisId_fkey` FOREIGN KEY (`devisId`) REFERENCES `Devis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_devisId_fkey` FOREIGN KEY (`devisId`) REFERENCES `Devis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
