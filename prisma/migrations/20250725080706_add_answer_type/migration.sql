/*
  Warnings:

  - You are about to drop the `answers` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "QuizzAnswerType" AS ENUM ('TEXT', 'MULTIPLE_CHOICE', 'TRUE_FALSE');

-- DropForeignKey
ALTER TABLE "answers" DROP CONSTRAINT "answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "user_quiz_answers" DROP CONSTRAINT "user_quiz_answers_answer_id_fkey";

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "type" "QuizzAnswerType";

-- DropTable
DROP TABLE "answers";

-- CreateTable
CREATE TABLE "quizz_answers" (
    "id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "quizz_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "quizz_answers" ADD CONSTRAINT "quizz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_answers" ADD CONSTRAINT "user_quiz_answers_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "quizz_answers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
