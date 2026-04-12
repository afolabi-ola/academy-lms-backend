import z from 'zod';

const rangeValues = ['today', 'week', 'month', 'year', 'custom'] as const;

export const getDashboardSchema = z.object({
  query: z
    .object({
      range: z.enum(rangeValues).optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .superRefine((query, ctx) => {
      const hasFrom = Boolean(query.from);
      const hasTo = Boolean(query.to);

      if (query.range === 'custom' && (!hasFrom || !hasTo)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['from'],
          message: '`from` and `to` are required when range is custom',
        });
        return;
      }

      if (!hasFrom && !hasTo) {
        return;
      }

      if (hasFrom !== hasTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['from'],
          message: '`from` and `to` must be provided together',
        });
        return;
      }

      const fromDate = new Date(query.from as string);
      const toDate = new Date(query.to as string);

      if (Number.isNaN(fromDate.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['from'],
          message: '`from` must be a valid date string',
        });
      }

      if (Number.isNaN(toDate.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['to'],
          message: '`to` must be a valid date string',
        });
      }

      if (
        !Number.isNaN(fromDate.getTime()) &&
        !Number.isNaN(toDate.getTime()) &&
        fromDate > toDate
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['from'],
          message: '`from` cannot be later than `to`',
        });
      }
    }),
});
