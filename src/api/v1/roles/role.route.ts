import { Router } from "express";
import roleController from "./role.controller";

const router = Router();

router.post("/", roleController.postRole);

export default router;
