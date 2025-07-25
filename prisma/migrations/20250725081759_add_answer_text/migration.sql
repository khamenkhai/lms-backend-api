/*
  Warnings:

  - Added the required column `answer_text` to the `quizz_answers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "quizz_answers" ADD COLUMN     "answer_text" TEXT NOT NULL;
