import { z } from 'zod';

export const createFaqSchema = z.object({
  body: z.object({
    question: z
      .string('Question is required')
      .min(3, 'Question must be at least 3 characters long'),
    answer: z
      .string('Answer is required')
      .min(3, 'Answer must be at least 3 characters long'),
    isActive: z.boolean().optional(),
  }),
});

export const updateFaqSchema = z.object({
  body: createFaqSchema.shape.body.partial(),
});
