import { Request, Response, NextFunction } from "express";

type AsyncHandlerType<T> = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<T>;

export const asyncHandler =
  <T>(fn: AsyncHandlerType<T>) =>
    (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next))
        .then(() => {
          if (!res.headersSent) {
            next();
          }
        })
        .catch((error) => {
          next(error);
        });
    };
