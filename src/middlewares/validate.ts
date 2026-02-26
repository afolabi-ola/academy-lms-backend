import { NextFunction, Request, Response } from 'express';
import { z, ZodType } from 'zod';
import AppError from '../utils/appError';

type ValidatedRequestData = Partial<Pick<Request, 'body' | 'query' | 'params'>>;

/**
 * T represents the Zod schema you pass in.
 * z.infer<T> extracts the TypeScript type from that schema.
 */
export const validate =
  <T extends ZodType<ValidatedRequestData>>(schema: T) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // safeParseAsync is better for handling async refinements
      const result = await schema.safeParseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      console.log(result);
      if (!result.success) {
        // const formattedErrors = result.error.issues.map((issue) => {
        //   if (
        //     issue.code === 'invalid_type' &&
        //     issue.path.length === 1 &&
        //     ['body', 'query', 'params'].includes(issue.path[0] as string)
        //   ) {
        //     return `Request ${String(issue.path[0])} is required`;
        //   }

        //   return issue.message;
        // });
        const formattedErrors = result.error.issues.map((issue) => {
          if (
            issue.code === 'invalid_type' &&
            issue.path.length === 1 &&
            ['body', 'query', 'params'].includes(issue.path[0] as string)
          ) {
            return `Request ${String(issue.path[0])} is required`;
          }

          return {
            field: issue.path.join('.'),
            message: issue.message,
          };
        });

        return next(new AppError('Validation failed', 400, formattedErrors));
      }

      /**
       * Assign the validated data back to req.
       * Because of 'T extends ZodTypeAny', TypeScript now knows
       * exactly what fields exist in req.body, req.query, etc.
       */
      req.body = result.data.body ?? req.body;

      next();
    } catch (error) {
      next(error); // Pass unexpected errors to Express error handler
    }
  };
