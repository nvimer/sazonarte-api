import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { asyncHandler } from "../utils/asyncHandler";

export const validate = (schema: AnyZodObject) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
