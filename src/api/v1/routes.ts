import { Router } from "express";
import authRouter from "../v1/auth/auth.route";
import permissionsRouter from "../v1/permissions/permission.route";
import rolesRouter from "../v1/roles/role.route";
const router = Router();

router.use("/permissions", permissionsRouter);
router.use("/roles", rolesRouter);
router.use("/users", authRouter);

export default router;
