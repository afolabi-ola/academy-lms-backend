import z from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string('Name is required')
      .min(3, 'Name must be at least 3 characters'),
    email: z.email('Email must be a valid email address'),
    password: z
      .string('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Email must be a valid email address'),
    password: z
      .string('Password is required')
      .min(8, 'Password must be at least 8 characters'),
  }),
});
