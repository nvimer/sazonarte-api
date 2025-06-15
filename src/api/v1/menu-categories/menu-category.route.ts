import { Router } from "express";
import menuCategoryController from "./menu-category.controller";
import { validate } from "../../../middlewares/validation.middleware";
import { createMenuCategorySchema } from "./menu-category.validator";

const router = Router();

router.post(
  "/",
  validate(createMenuCategorySchema),
  menuCategoryController.postMenuCategory,
);

export default router;
