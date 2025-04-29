/*
  Warnings:

  - You are about to drop the `productionrate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `productionrate` DROP FOREIGN KEY `ProductionRate_userId_fkey`;

-- DropTable
DROP TABLE `productionrate`;

-- CreateTable
CREATE TABLE `MonthlyProductionRate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `availableDays` INTEGER NOT NULL,
    `workingDays` INTEGER NOT NULL,
    `productionRate` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MonthlyProductionRate_userId_month_key`(`userId`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MonthlyProductionRate` ADD CONSTRAINT `MonthlyProductionRate_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
