import { Router } from "express";
import categoriesRouter from "../menus/categories/category.route";
const router = Router();

router.use("/categories", categoriesRouter);

export default router;
