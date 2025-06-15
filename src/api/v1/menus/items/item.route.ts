import { Router } from "express";
import itemController from "./item.controller";
import { validate } from "../../../../middlewares/validation.middleware";
import { createItemSchema } from "./item.validator";

const router = Router();

router.post("/", validate(createItemSchema), itemController.postItem);

export default router;
