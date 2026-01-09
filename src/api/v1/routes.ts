import { Router } from "express";
import permissionsRouter from "../v1/permissions/permission.routes";
import rolesRouter from "../v1/roles/role.route";
import authRouter from "../v1/auth/auth.route";
import usersRouter from "../v1/users/user.route";
import tablesRouter from "../v1/tables/table.route";
import menusRouter from "../v1/menus/menus.route";
import profilesRouter from "../v1/profiles/profile.route";
import ordersRouter from "../v1/orders/order.route";

/**
 * Main API Router for v1 endpoints.
 */
const router = Router();

/**
 * Permission Management Routes
 */
router.use("/permissions", permissionsRouter);

/**
 * Role Management Routes
 */
router.use("/roles", rolesRouter);

/**
 * Authentication Routes
 */
router.use("/auth", authRouter);

/**
 * User Management Routes
 */
router.use("/users", usersRouter);

/**
 * Table Management Routes
 */
router.use("/tables", tablesRouter);

/**
 * Menu Management Routes
 */
router.use("/menu", menusRouter);

/**
 * Profiles Management Routes
 */
router.use("/profile", profilesRouter);

/**
 * Orders Management Routes
 */
router.use("/orders", ordersRouter);

export default router;
