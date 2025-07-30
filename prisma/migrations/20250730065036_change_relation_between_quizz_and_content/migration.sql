/*
  Warnings:

  - A unique constraint covering the columns `[content_id]` on the table `quizzes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "quizzes_content_id_key" ON "quizzes"("content_id");
