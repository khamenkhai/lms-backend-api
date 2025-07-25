/*
  Warnings:

  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "quizz_answers" DROP CONSTRAINT "quizz_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "user_quiz_answers" DROP CONSTRAINT "user_quiz_answers_question_id_fkey";

-- DropTable
DROP TABLE "questions";

-- CreateTable
CREATE TABLE "quizz_questions" (
    "id" SERIAL NOT NULL,
    "quiz_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "type" "QuizzAnswerType",

    CONSTRAINT "quizz_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "quizz_questions" ADD CONSTRAINT "quizz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz_answers" ADD CONSTRAINT "quizz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quizz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quiz_answers" ADD CONSTRAINT "user_quiz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quizz_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
