import { Request, Response, NextFunction } from "express";
import { CustomError } from "../types/custom-errors";

// Middleware for not found routes (404)
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const error = new CustomError(
    `Route not found - ${req.originalUrl}`,
    404,
    "NOT_FOUND",
  );
  next(error);
};
