/*
  Warnings:

  - You are about to drop the `user_module_progress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_module_progress" DROP CONSTRAINT "user_module_progress_module_id_fkey";

-- DropForeignKey
ALTER TABLE "user_module_progress" DROP CONSTRAINT "user_module_progress_user_id_fkey";

-- DropTable
DROP TABLE "user_module_progress";
