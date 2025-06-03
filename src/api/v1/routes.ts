import { Router } from "express";
import permissionsRouter from "../v1/permissions/permission.route";
import rolesRouter from "../v1/roles/role.route";
import authRouter from "../v1/auth/auth.route";
import usersRouter from "../v1/users/user.route";
import profilesRouter from "../v1/profiles/profile.route";

const router = Router();

router.use("/permissions", permissionsRouter);
router.use("/roles", rolesRouter);
router.use("/users", usersRouter);
router.use("/profile", profilesRouter);
router.use("/auth", authRouter);

export default router;
