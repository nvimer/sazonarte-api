import { Request, Response, NextFunction } from "express";
import permissionService from "./permission.service";
import {
  CreatePermissionInput,
  createPermissionSchema,
  permissionIdSchema,
  UpdatePermissionInput,
  updatePermissionSchema,
} from "./permission.validator";
import { HttpStatus } from "../../../utils/httpStatus.enum";

class PermissionController {
  // async getPermission(){
  //
  // }

  async postPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const data: CreatePermissionInput = createPermissionSchema.parse(
        req.body,
      );
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

  async patchPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = permissionIdSchema.parse(req.params);
      const data: UpdatePermissionInput = updatePermissionSchema.parse(
        req.body,
      );

      const updatedPermission = await permissionService.updatePermission(
        id,
        data,
      );
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Permission updated successfully",
        data: updatedPermission,
      });
    } catch (error) {
      next(error);
    }
  }

  async deletePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = permissionIdSchema.parse(req.params);

      await permissionService.deletePermission(id);
      res.status(HttpStatus.OK).json({
        success: true,
        message: "Permission deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PermissionController();
