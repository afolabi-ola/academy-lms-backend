import z from 'zod';

const CreateCourseSchema = z.object({
  body: z.object({
    image: z.string('Image is required'),
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
  }),
});

const UpdateCourseSchema = z.object({
  body: CreateCourseSchema.shape.body.partial(),
});

export { CreateCourseSchema, UpdateCourseSchema };
