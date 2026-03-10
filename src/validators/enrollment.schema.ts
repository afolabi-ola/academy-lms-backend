import z from 'zod';

export const createEnrollmentSchema = z.object({
  body: z.object({
    studentId: z
      .number('Student ID must be a number')
      .min(1, 'Student ID must be at least 1'),
    courseId: z
      .number('Course ID must be a number')
      .min(1, 'Course ID must be at least 1'),
  }),
});
