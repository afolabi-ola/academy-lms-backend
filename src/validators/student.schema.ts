import z from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    surname: z
      .string('Surname is required')
      .toLowerCase()
      .min(3, 'Surname must be at least 3 characters long'),
    firstname: z
      .string('Firstname is required')
      .min(3, 'Firstname must be at least 3 characters long'),
    otherName: z
      .string('Other name is required')
      .min(3, 'Other name must be at least 3 characters long'),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: 'Date of birth must be a valid date string',
    }),
    email: z.email('Email must be a valid email address'),
    phone: z
      .string('Phone number is required')
      .min(11, 'Phone number must be at least 11 characters long')
      .max(14, 'Phone number must be at most 14 characters long'),
    address: z
      .string('Address is required')
      .min(3, 'Address must be at least 3 characters long'),
    photo: z.string().optional(),
    parentName: z
      .string('Parent name is required')
      .min(3, 'Parent name must be at least 3 characters long'),
    parentsPhone: z
      .string('Parents phone number is required')
      .min(11, 'Parents phone number must be at least 11 characters long')
      .max(14, 'Parents phone number must be at most 14 characters long'),
    parentsAddress: z
      .string('Parents address is required')
      .min(3, 'Parents address must be at least 3 characters long'),
  }),
});

export const updateStudentSchema = z.object({
  body: createStudentSchema.shape.body.partial(),
});
