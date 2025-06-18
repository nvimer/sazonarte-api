import { Router } from "express";
import categoriesRouter from "../menus/categories/category.route";
import itemsRouter from "./items/item.route";

const router = Router();

router.use("/categories", categoriesRouter);
router.use("/items", itemsRouter);

export default router;
