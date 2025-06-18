import { Router } from "express";
import categoryController from "./category.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { createMenuCategorySchema } from "./category.validator";
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

// router.get("/id", validate(idPermissionSchema), categoryController.getCategory);

export default router;
