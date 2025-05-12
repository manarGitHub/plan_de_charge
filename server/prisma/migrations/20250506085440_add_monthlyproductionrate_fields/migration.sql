/*
  Warnings:

  - Added the required column `occupationRate` to the `MonthlyProductionRate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unbilledDays` to the `MonthlyProductionRate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `monthlyproductionrate` ADD COLUMN `occupationRate` DOUBLE NOT NULL,
    ADD COLUMN `unbilledDays` INTEGER NOT NULL;
