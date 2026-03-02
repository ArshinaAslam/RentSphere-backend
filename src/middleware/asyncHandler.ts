import type { NextFunction, Request, Response } from "express";

type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

export const asyncHandler = (fn: AsyncFn) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
