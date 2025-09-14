/*
  Warnings:

  - You are about to drop the column `name` on the `enrollments` table. All the data in the column will be lost.
  - You are about to drop the column `progress_percentage` on the `enrollments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "enrollments" DROP COLUMN "name",
DROP COLUMN "progress_percentage";
