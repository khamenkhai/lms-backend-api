/*
  Warnings:

  - You are about to drop the column `moduleId` on the `user_module_progress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `user_module_progress` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,module_id]` on the table `user_module_progress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `module_id` to the `user_module_progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_module_progress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_module_progress" DROP CONSTRAINT "user_module_progress_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "user_module_progress" DROP CONSTRAINT "user_module_progress_userId_fkey";

-- DropIndex
DROP INDEX "user_module_progress_userId_moduleId_key";

-- AlterTable
ALTER TABLE "user_module_progress" DROP COLUMN "moduleId",
DROP COLUMN "userId",
ADD COLUMN     "module_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_module_progress_user_id_module_id_key" ON "user_module_progress"("user_id", "module_id");

-- AddForeignKey
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
