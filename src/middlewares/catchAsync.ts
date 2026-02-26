// import { catchAsync } from './catchAsync';
// export const catchAsync: <T extends (...args: any[]) => Promise<any>>(
//   fn: T,
// ) => (...args: Parameters<T>) => Promise<ReturnType<T>> = (fn) => {
//   return (...args) => {
//     return fn(...args).catch((err) => {
//       console.error(err);
//     });
//   };

// };
import { NextFunction, Request, Response } from 'express';

const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
