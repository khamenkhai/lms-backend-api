/*
  Warnings:

  - The primary key for the `certificates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `certificates` table. All the data in the column will be lost.
  - The primary key for the `content_progresses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `content_progresses` table. All the data in the column will be lost.
  - The primary key for the `user_carts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user_carts` table. All the data in the column will be lost.
  - The primary key for the `user_module_progress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user_module_progress` table. All the data in the column will be lost.
  - The primary key for the `wishlists` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `wishlists` table. All the data in the column will be lost.
  - You are about to drop the `UserOTP` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "certificates_user_id_course_id_key";

-- DropIndex
DROP INDEX "content_progresses_user_id_content_id_key";

-- DropIndex
DROP INDEX "user_carts_user_id_course_id_key";

-- DropIndex
DROP INDEX "user_module_progress_user_id_module_id_key";

-- DropIndex
DROP INDEX "wishlists_user_id_course_id_key";

-- AlterTable
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("user_id", "course_id");

-- AlterTable
ALTER TABLE "content_progresses" DROP CONSTRAINT "content_progresses_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "content_progresses_pkey" PRIMARY KEY ("user_id", "content_id");

-- AlterTable
ALTER TABLE "user_carts" DROP CONSTRAINT "user_carts_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "user_carts_pkey" PRIMARY KEY ("user_id", "course_id");

-- AlterTable
ALTER TABLE "user_module_progress" DROP CONSTRAINT "user_module_progress_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "user_module_progress_pkey" PRIMARY KEY ("user_id", "module_id");

-- AlterTable
ALTER TABLE "wishlists" DROP CONSTRAINT "wishlists_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "wishlists_pkey" PRIMARY KEY ("user_id", "course_id");

-- DropTable
DROP TABLE "UserOTP";

-- CreateTable
CREATE TABLE "user_opts" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_opts_pkey" PRIMARY KEY ("id")
);
