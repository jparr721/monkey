import { Request, Response, NextFunction } from 'express';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const unroll = (fn: any): any => (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<any> =>
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));

export default unroll;
