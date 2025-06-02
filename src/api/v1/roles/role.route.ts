import { Router } from "express";
import roleController from "./role.controller";
import { validate } from "../../../middlewares/validation.middleware";

const router = Router();

router.get("/", roleController.getRoles);
router.post("/", roleController.postRole);
export default router;
