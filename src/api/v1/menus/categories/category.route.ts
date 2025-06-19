import { Router } from "express";
import categoryController from "./category.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import {
  categoryIdSchema,
  createMenuCategorySchema,
  updateMenuCategorySchema,
} from "./category.validator";
import { paginationQuerySchema } from "../../../../utils/pagination.schema";
import { idPermissionSchema } from "../../permissions/permission.validator";

const router = Router();

router.get(
  "/",
  validate(paginationQuerySchema),
  categoryController.getCategories,
);

router.post(
  "/",
  validate(createMenuCategorySchema),
  categoryController.postCategory,
);

router.get(
  "/:id",
  validate(idPermissionSchema),
  categoryController.getCategory,
);

router.patch(
  "/:id",
  validate(categoryIdSchema),
  validate(updateMenuCategorySchema),
  categoryController.patchCategory,
);

export default router;
