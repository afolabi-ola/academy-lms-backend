import z from 'zod';

const createSliderSchema = z.object({
  body: z.object({
    title: z
      .string('Title is required')
      .min(3, 'Title must be at least 3 characters long'),
    description: z
      .string('Description is required')
      .min(10, 'Description must be at least 10 characters long'),
    isActive: z.boolean().optional(),
  }),
});

const updateSliderSchema = z.object({
  body: createSliderSchema.shape.body.partial(),
});

export { createSliderSchema, updateSliderSchema };
