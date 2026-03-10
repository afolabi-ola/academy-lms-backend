import z from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    amountReceived: z
      .number('Amount received must be a number')
      .min(1, 'Amount received must be at least 1'),
    enrollmentId: z
      .number('Enrollment ID must be a number')
      .min(1, 'Enrollment ID must be at least 1'),
  }),
});
