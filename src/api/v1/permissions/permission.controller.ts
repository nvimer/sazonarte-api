import { Request, Response, NextFunction } from "express";
import permissionService from "./permission.service";
import {
  CreatePermissionInput,
  createPermissionSchema,
} from "./permission.validator";
import { HttpStatus } from "../../../utils/httpStatus.enum";

class PermissionController {
  async postPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreatePermissionInput = createPermissionSchema.parse(
        req.body,
      );
      console.log(`My data: ${data}`);
      const newPermission = await permissionService.createPermission(data);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Permission created succesfully",
        data: newPermission,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PermissionController();
