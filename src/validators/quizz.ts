import { z } from "zod";

export const quizzAnswerTypeEnum = z.enum(["TEXT", "MULTIPLE_CHOICE", "TRUE_FALSE"]);

export const answerSchema = z.object({
  answer_text: z.string().min(1, "Answer text cannot be empty"),
});

export const questionSchema = z.object({
  question_text: z.string().min(1, "Question text cannot be empty"),
  type: quizzAnswerTypeEnum,
  answers: z.array(answerSchema).min(1, "At least one answer is required"),
});

export const addQuestionsWithAnswersSchema = z.object({
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});


export const createQuizSchema = z.object({
  content_id: z.number({
    required_error: "content_id is required",
    invalid_type_error: "content_id must be a number",
  }),
  title: z.string().min(1, "title is required"),
});


export const answerUpdateSchema = z.object({
  id: z.number().optional(), // for existing answer updates
  answer_text: z.string().min(1, "Answer text cannot be empty").optional(),
});

export const questionUpdateSchema = z.object({
  id: z.number().optional(), // for existing question updates
  question_text: z.string().min(1, "Question text cannot be empty").optional(),
  type: quizzAnswerTypeEnum.optional(),
  answers: z.array(answerUpdateSchema).optional(),
});

export const updateQuestionsWithAnswersSchema = z.object({
  questions: z.array(questionUpdateSchema).min(1, "At least one question is required"),
});