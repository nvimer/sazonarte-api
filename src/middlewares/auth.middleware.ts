import passport from "passport";
import { HttpStatus } from "../utils/httpStatus.enum";
import { NextFunction, Request, Response } from "express";
import { AuthenticatedUser } from "../types/express";
import { CustomError } from "../types/custom-errors";

// Interface for info if generate error with token
export interface PassportAuthInfo {
  message?: string;
}

// Middleware of WJT authentication
export const authJwt = (req: Request, res: Response, next: NextFunction) => {
  // Passport jwt try authenticated the petition using "jwt" strategy
  // session in false because we not use sessions based in cookies
  passport.authenticate(
    "jwt",
    { session: false },
    (
      err: Error | null,
      user: AuthenticatedUser | false,
      info: PassportAuthInfo | undefined,
    ) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(
          new CustomError(
            info?.message || "Unauthorized. Please login and retry",
            HttpStatus.UNAUTHORIZED,
            "UNAUTHORIZED_ACCESS",
          ),
        );
      }
      // if authetication is ok, add user to req.user
      req.user = user;
      // passs to next Middleware
      next();
    },
  )(req, res, next);
};
