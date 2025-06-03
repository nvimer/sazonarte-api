import { Router } from "express";
import permissionsRouter from "../v1/permissions/permission.route";
import rolesRouter from "../v1/roles/role.route";
import authRouter from "../v1/auth/auth.route";
import usersRouter from "../v1/users/user.route";

const router = Router();

router.use("/permissions", permissionsRouter);
router.use("/roles", rolesRouter);
router.use("/users", usersRouter);

export default router;
