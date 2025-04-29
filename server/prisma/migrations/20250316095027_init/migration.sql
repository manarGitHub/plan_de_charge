/*
  Warnings:

  - You are about to drop the column `devisId` on the `task` table. All the data in the column will be lost.
  - You are about to drop the `devis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userdevis` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_devisId_fkey`;

-- DropForeignKey
ALTER TABLE `userdevis` DROP FOREIGN KEY `UserDevis_devisId_fkey`;

-- DropForeignKey
ALTER TABLE `userdevis` DROP FOREIGN KEY `UserDevis_userId_fkey`;

-- DropIndex
DROP INDEX `Task_devisId_fkey` ON `task`;

-- AlterTable
ALTER TABLE `task` DROP COLUMN `devisId`;

-- DropTable
DROP TABLE `devis`;

-- DropTable
DROP TABLE `userdevis`;
