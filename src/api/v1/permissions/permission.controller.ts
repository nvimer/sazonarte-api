import { Request, Response } from "express";
import permissionService from "./permission.service";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import { asyncHandler } from "../../../utils/asyncHandler";
import {
  CreatePermissionInput,
  UpdatePermissionInput,
  PermissionSearchParams,
  BulkPermissionInput,
} from "./permission.validator";
import { PermissionServiceInterface } from "./interfaces/permission.service.interface";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  PaginationParams,
} from "../../../interfaces/pagination.interfaces";

/**
 * Permission Controller
 *
 * This controller is responsible for:
 * - Processing incoming HTTP requests for permission operations
 * - Permission CRUD operations (Create, Read, Update, Delete)
 * - Permission search and filtering
 * - Bulk permission operations
 * - Delegating business logic to permission service layer
 *
 * Permission operations include:
 * - Retrieving permissions with pagination
 * - Searching permissions with filters
 * - Getting individual permission details
 * - Creating new permissions
 * - Updating existing permissions
 * - Deleting permissions (soft delete)
 * - Bulk deletion operations
 *
 * Response Format:
 * - success: Boolean indicating operation success
 * - message: Descriptive message about the operation
 * - data: Permission data or array of permissions
 * - meta: Pagination metadata (for list operations)
 *
 * Security Features:
 * - Input validation and sanitization
 * - Role-based access control
 * - Audit trail maintenance
 */
class PermissionController {
  constructor(private permissionService: PermissionServiceInterface) {}

  /**
   * GET /permissions
   *
   * Retrieves a paginated list of all permissions in the system.
   * This endpoint supports pagination parameters for efficient
   * data retrieval and display.
   *
   * Query Parameters:
   * - page: Page number (optional, defaults to 1)
   * - limit: Number of items per page (optional, defaults to 10)
   *
   * Response:
   * - 200: Permissions retrieved successfully with pagination metadata
   * - 400: Invalid pagination parameters
   * - 500: Server error during retrieval
   *
   * Pagination Features:
   * - Configurable page size
   * - Page number tracking
   * - Metadata for client-side pagination
   * - Default values for missing parameters
   *
   * Use Cases:
   * - Permission management dashboard
   * - Role assignment interface
   * - Administrative permission overview
   * - Data export and reporting
   */
  getPermissions = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

    const params: PaginationParams = { page, limit };

    const permissions = await this.permissionService.findAllPermissions(params);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Permissions fetched successfully",
      data: permissions,
    });
  });

  /**
   * GET /permissions/search
   *
   * Searches permissions with filtering and pagination capabilities.
   * This endpoint allows searching by name/description and filtering
   * by active status for efficient permission management.
   *
   * Query Parameters:
   * - page: Page number (optional, defaults to 1)
   * - limit: Number of items per page (optional, defaults to 10)
   * - search: Search term for name/description (optional)
   * - active: Filter by active status (true/false, optional)
   *
   * Response:
   * - 200: Filtered permissions retrieved successfully
   * - 400: Invalid search parameters
   * - 500: Server error during search
   *
   * Search Features:
   * - Text-based search in name and description
   * - Boolean filtering by active status
   * - Pagination support for large result sets
   * - Case-insensitive search
   *
   * Use Cases:
   * - Permission search interface
   * - Role assignment workflows
   * - Administrative filtering
   * - Permission discovery
   */
  searchPermissions = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;
    const search = req.query.search as string;

    // Create combined parameters object
    const params: PaginationParams & PermissionSearchParams = {
      page,
      limit,
      search,
    };

    const permissions = await this.permissionService.searchPermissions(params);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Permissions search completed successfully",
      data: permissions,
    });
  });

  /**
   * GET /permissions/:id
   *
   * Retrieves detailed information about a specific permission by its ID.
   * This endpoint provides complete permission information including
   * name, description, active status, and associated metadata.
   *
   * URL Parameters:
   * - id: Permission ID (integer, required)
   *
   * Response:
   * - 200: Permission details retrieved successfully
   * - 400: Invalid permission ID format
   * - 404: Permission not found
   * - 500: Server error during retrieval
   *
   * Permission Information:
   * - Permission ID and name
   * - Description and purpose
   * - Active status and availability
   * - Creation and modification timestamps
   * - Associated roles and users
   *
   * Use Cases:
   * - Individual permission details view
   * - Permission editing interface
   * - Role assignment verification
   * - Permission audit and review
   */
  getPermissionById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const permission = await this.permissionService.findPermissionById(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Permission fetched successfully",
      data: permission,
    });
  });

  /**
   * POST /permissions
   *
   * Creates a new permission in the system with the provided information.
   * This endpoint handles permission creation with validation and
   * ensures proper data structure and uniqueness.
   *
   * Request Body:
   * - name: Permission name/identifier (string, required, unique)
   * - description: Permission description (string, optional)
   * - active: Active status (boolean, optional, defaults to true)
   * - resource: Associated resource (string, optional)
   * - action: Associated action (string, optional)
   *
   * Response:
   * - 201: Permission created successfully
   * - 400: Invalid request data or validation errors
   * - 409: Permission with same name already exists
   * - 500: Server error during creation
   *
   * Validation:
   * - Permission name uniqueness
   * - Required fields validation
   * - Name format and length validation
   * - Resource and action validation
   *
   * Use Cases:
   * - System permission setup
   * - Adding new permissions to the system
   * - Permission management during system expansion
   * - Initial system configuration
   */
  postPermission = asyncHandler(async (req: Request, res: Response) => {
    const data: CreatePermissionInput = req.body;

    const newPermission = await this.permissionService.createPermission(data);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Permission created successfully",
      data: newPermission,
    });
  });

  /**
   * PATCH /permissions/:id
   *
   * Updates an existing permission with new information.
   * This endpoint allows modification of permission properties
   * while maintaining data integrity and validation.
   *
   * URL Parameters:
   * - id: Permission ID to update (integer, required)
   *
   * Request Body:
   * - name: Updated permission name (string, optional)
   * - description: Updated description (string, optional)
   * - active: Updated active status (boolean, optional)
   * - resource: Updated resource (string, optional)
   * - action: Updated action (string, optional)
   *
   * Response:
   * - 200: Permission updated successfully
   * - 400: Invalid request data or validation errors
   * - 404: Permission not found
   * - 409: Name conflict with existing permission
   * - 500: Server error during update
   *
   * Update Features:
   * - Partial updates supported
   * - Validation of updated fields
   * - Conflict detection for unique fields
   * - Timestamp updates for modification tracking
   *
   * Use Cases:
   * - Permission information updates
   * - Description modifications
   * - Status changes (activate/deactivate)
   * - Resource and action updates
   */
  patchPermission = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const data: UpdatePermissionInput = req.body;

    const updatedPermission = await this.permissionService.updatePermission(
      id,
      data,
    );
    res.status(HttpStatus.OK).json({
      success: true,
      message: "Permission updated successfully",
      data: updatedPermission,
    });
  });

  /**
   * DELETE /permissions/:id
   *
   * Performs a soft delete of a permission from the system.
   * This endpoint marks the permission as deleted without removing
   * the actual record from the database.
   *
   * Response:
   * - 200: Permission deleted successfully
   * - 400: Invalid permission ID format
   * - 404: Permission not found
   * - 409: Permission cannot be deleted (e.g., has active role assignments)
   * - 500: Server error during deletion
   *
   * Deletion Features:
   * - Soft delete implementation
   * - Checks for active role assignments
   * - Validates permission existence
   * - Preserves data for audit trails
   *
   * Use Cases:
   * - Permission removal from system
   * - System cleanup and maintenance
   * - Permission deprecation
   * - Audit trail maintenance
   */
  deletePermission = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    const deletedPermission = await this.permissionService.deletePermission(id);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `Permission with ID ${id} has been deleted successfully`,
      data: {
        id: deletedPermission.id,
        name: deletedPermission.name,
      },
    });
  });

  /**
   * DELETE /permissions/bulk
   *
   * Performs bulk deletion of multiple permissions.
   * This endpoint allows efficient removal of multiple permissions
   * in a single operation with proper validation.
   *
   * Request Body:
   * - ids: Array of permission IDs to delete (number[], required)
   *
   * Response:
   * - 200: Bulk deletion completed successfully
   * - 400: Invalid request data or validation errors
   * - 404: One or more permissions not found
   * - 409: Some permissions cannot be deleted
   * - 500: Server error during bulk deletion
   *
   * Bulk Deletion Features:
   * - Multiple permission deletion in single operation
   * - Validation of all permission IDs
   * - Transaction-based operation for consistency
   * - Detailed error reporting for failed deletions
   *
   * Use Cases:
   * - Mass permission cleanup
   * - System maintenance operations
   * - Permission deprecation workflows
   * - Administrative bulk operations
   */
  bulkDeletePermissions = asyncHandler(async (req: Request, res: Response) => {
    const data: BulkPermissionInput = req.body;

    const deletedCount =
      await this.permissionService.bulkDeletePermissions(data);
    res.status(HttpStatus.OK).json({
      success: true,
      message: `${deletedCount} permissions have been deleted successfully`,
      data: {
        deletedCount,
        ids: data.ids,
      },
    });
  });
}

export default new PermissionController(permissionService);
