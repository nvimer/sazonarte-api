import { Request, Response, NextFunction } from "express";
import { RoleName } from "@prisma/client";
import userService from "../api/v1/users/user.service";

export const roleMiddleware = (allowedRoles: RoleName[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const authenticatedUser =
        await userService.findUserWithRolesAndPermissions(req.user.id);

      const hasAllowedRole = authenticatedUser.roles.some((userRole) =>
        allowedRoles.includes(userRole.role.name),
      );

      if (!hasAllowedRole) {
        res.status(403).json({ message: "Forbidden" });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
