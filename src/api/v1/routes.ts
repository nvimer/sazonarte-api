import { Router } from "express";
import permissionsRouter from "../v1/permissions/permission.routes";
import rolesRouter from "../v1/roles/role.route";
import authRouter from "../v1/auth/auth.route";
import usersRouter from "../v1/users/user.route";
import tablesRouter from "../v1/tables/table.route";
import menusRouter from "../v1/menus/menus.route";
import profilesRouter from "../v1/profiles/profile.route";
/**
 * Main API Router for v1 endpoints.
 *
 * This router serves as the entry point for all API v1 routes and
 * organizes them into logical modules:
 *
 * - /permissions - Permission entity management (CRUD operations)
 * - /roles - Role management and role-permission assignments
 * - /auth - Authentication and authorization endpoints
 * - /users - User management and user-role assignments
 * - /tables - Table management for restaurant operations
 * - /menus - Menu and menu item management
 *
 * Each module has its own router with specific endpoints and validation.
 * This structure provides clear separation of concerns and makes the
 * API easy to navigate and maintain.
 */
const router = Router();

/**
 * Permission Management Routes
 *
 * Handles CRUD operations for permission entities:
 * - GET /permissions - List all permissions
 * - POST /permissions - Create new permission
 * - GET /permissions/:id - Get permission by ID
 * - PATCH /permissions/:id - Update permission
 * - DELETE /permissions/:id - Delete permission
 */
router.use("/permissions", permissionsRouter);

/**
 * Role Management Routes
 *
 * Handles role management and role-permission assignments:
 * - GET /roles - List all roles
 * - POST /roles - Create new role
 * - GET /roles/:id - Get role by ID
 * - PATCH /roles/:id - Update role
 * - DELETE /roles/:id - Delete role
 * - GET /roles/permissions - Get roles with permissions
 * - POST /roles/permissions/:id/assign - Assign permissions to role
 * - DELETE /roles/permissions/:id/remove - Remove permissions from role
 */
router.use("/roles", rolesRouter);

/**
 * Authentication Routes
 *
 * Handles user authentication and authorization:
 * - POST /auth/login - User login
 * - POST /auth/register - User registration
 * - POST /auth/logout - User logout
 * - POST /auth/refresh - Refresh access token
 * - POST /auth/forgot-password - Request password reset
 * - POST /auth/reset-password - Reset password
 */
router.use("/auth", authRouter);

/**
 * User Management Routes
 *
 * Handles user management and user-role assignments:
 * - GET /users - List all users
 * - GET /users/:id - Get user by ID
 * - GET /users/email/:email - Get user by email
 * - POST /users/register - Register new user
 * - PATCH /users/:id - Update user
 * - GET /users/:id/roles-permissions - Get user with roles and permissions
 */
router.use("/users", usersRouter);

/**
 * Table Management Routes
 *
 * Handles restaurant table management:
 * - GET /tables - List all tables
 * - POST /tables - Create new table
 * - GET /tables/:id - Get table by ID
 * - PATCH /tables/:id - Update table
 * - DELETE /tables/:id - Delete table
 */
router.use("/tables", tablesRouter);

/**
 * Menu Management Routes
 *
 * Handles menu and menu item management:
 * - GET /menus/categories - List menu categories
 * - POST /menus/categories - Create menu category
 * - GET /menus/categories/:id - Get category by ID
 * - PATCH /menus/categories/:id - Update category
 * - DELETE /menus/categories/:id - Delete category
 * - GET /menus/items - List menu items
 * - POST /menus/items - Create menu item
 * - GET /menus/items/:id - Get item by ID
 * - PATCH /menus/items/:id - Update item
 * - DELETE /menus/items/:id - Delete item
 */
router.use("/menus", menusRouter);

/**
 * Profiles Management Routes
 *
 * Handles user and profile item management:
 * - GET /profiles - List profiles
 * - GET /profiles/:id - Get profile by ID
 * - PATCH /profiles/:id - Update profile by ID
 * - DELETE /profiles/:id - Delete profile by ID
 */
router.use("/profiles", profilesRouter);
export default router;
