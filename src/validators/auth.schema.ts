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

export const updateUserSchema = z.object({
  body: z.object({
    name: z
      .string('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .optional(),
    email: z.email('Email must be a valid email address').optional(),
    role: z.enum(['SUB_ADMIN', 'ADMIN']).optional(), // Note: SUPER_ADMIN role is not included here for security reasons
    active: z.boolean().optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .optional(),
    email: z.email('Email must be a valid email address').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string('Current password is required')
      .min(8, 'Current password must be at least 8 characters'),
    newPassword: z
      .string('New password is required')
      .min(8, 'New password must be at least 8 characters'),
  }),
});