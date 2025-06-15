import { Router } from "express";
import categoryController from "./category.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { createMenuCategorySchema } from "./category.validator";

const router = Router();

router.post(
  "/",
  validate(createMenuCategorySchema),
  categoryController.postCategory,
);

export default router;
