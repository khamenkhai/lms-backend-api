-- DropForeignKey
ALTER TABLE "quizz_answers" DROP CONSTRAINT "quizz_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "quizz_questions" DROP CONSTRAINT "quizz_questions_quiz_id_fkey";

-- AddForeignKey
ALTER TABLE "quizz_questions" ADD CONSTRAINT "quizz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz_answers" ADD CONSTRAINT "quizz_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quizz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
