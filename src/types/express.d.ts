import { Permission, Role, User } from "@prisma/client";
import { Pick } from "@prisma/client/runtime/library";

// configure values for req.user types

export type PermissionWithRelations = {
  permission: Permission;
};

export type RoleWithPermissions = Role & {
  permissions: PermissionWithRelations[];
};

export type AutheticatedUser = Pick<User, "id", "email"> & {
  roles: RoleWithPermissions[];
};

declare namespace Express {
  export interface Request {
    user: AutheticatedUser;
  }
}
