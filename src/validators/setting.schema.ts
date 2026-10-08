import { ThemeMode } from './../generated/prisma/enums';
import z from 'zod';

export const updateSettingsSchema = z.object({
  body: z
    .object({
      appName: z.string().min(3, 'App name must be at least 3 characters long'),
      appDescription: z
        .string()
        .min(3, 'App description must be at least 3 characters long'),
      contactEmail: z.email('Contact email must be a valid email address'),
      timezone: z
        .string()
        .min(3, 'Timezone must be at least 3 characters long'),
      currency: z
        .string()
        .min(3, 'Currency must be at least 3 characters long'),
      logoText: z.string().optional(),
      primaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
        .optional(),
      secondaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
        .optional(),
      accentColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
        .optional(),
      backgroundColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
        .optional(),
      themeMode: z
        .enum(ThemeMode, {
          error: () => ({
            message: 'Theme mode must be either LIGHT, DARK or SYSTEM',
          }),
        })
        .optional(),
    })
    .partial(),
});
