import { z } from "zod";

export const ModuleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  position: z.number().int().nonnegative("Position must be a non-negative integer"),
  course_id: z.number().int().positive("Course ID must be a positive integer"),
});

export const createOrderSchema = z.object({
  course_id: z.number().int("Course ID must be an integer"),
  status: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  payment_method_id: z.string().optional(),
  provider_transaction_id: z.string().optional(),
});

export const ContentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content_url: z.string().url("Must be a valid URL"),
  content_type: z.enum(["VIDEO", "ARTICLE", "QUIZ"]),
  duration: z.string().regex(/^\d{1,2}:\d{2}$/, "Duration must be in mm:ss or hh:mm format"),
  position: z.number().int().min(1),
  module_id: z.number().int().min(1)
});


export const EnrollmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  completed_at: z.string().datetime().optional().nullable(),
  access_expires_at: z.string().datetime().optional().nullable(),
  progress_percentage: z.number().int().min(0).max(100),
  user_id: z.number().int().positive(),
  course_id: z.number().int().positive(),
});

