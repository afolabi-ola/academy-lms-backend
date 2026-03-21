import z from 'zod';

const createCourseSchema = z.object({
  body: z.object({
    title: z
      .string('Title is required')
      .min(3, 'Title must be at least 3 characters long'),
    description: z
      .string('Description is required')
      .min(10, 'Description must be at least 10 characters long'),
    duration: z
      .string('Duration is required')
      .min(1, 'Duration must be at least 1 character long'),
    isActive: z.boolean().optional(),
    fee: z
      .number('Fee is required and must be a number')
      .positive('Fee must be a positive number')
      .min(1, 'Fee must be at least 1'),
  }),
});

const updateCourseSchema = z.object({
  body: createCourseSchema.shape.body.partial(),
});

export { createCourseSchema, updateCourseSchema };
