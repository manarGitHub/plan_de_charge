-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_authorUserId_fkey`;

-- DropIndex
DROP INDEX `Task_authorUserId_fkey` ON `task`;

-- AlterTable
ALTER TABLE `task` MODIFY `authorUserId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Availability` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `weekStart` DATETIME(3) NOT NULL,
    `daysAvailable` INTEGER NOT NULL,

    UNIQUE INDEX `Availability_userId_weekStart_key`(`userId`, `weekStart`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Availability` ADD CONSTRAINT `Availability_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_authorUserId_fkey` FOREIGN KEY (`authorUserId`) REFERENCES `User`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;
