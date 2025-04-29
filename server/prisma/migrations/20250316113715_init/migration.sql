/*
  Warnings:

  - You are about to drop the column `points` on the `task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `project` ADD COLUMN `pole` VARCHAR(191) NULL,
    ADD COLUMN `site` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `task` DROP COLUMN `points`,
    ADD COLUMN `workingDays` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `profile` VARCHAR(191) NULL;
