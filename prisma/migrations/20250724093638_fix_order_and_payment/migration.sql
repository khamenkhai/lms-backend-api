/*
  Warnings:

  - You are about to alter the column `progress_percentage` on the `enrollments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - A unique constraint covering the columns `[order_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "enrollments" ALTER COLUMN "progress_percentage" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");
