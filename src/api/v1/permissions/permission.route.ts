import { Router } from "express";
import permissionController from "./permission.controller";

const router = Router();

router.post("/", permissionController.postPermission);

export default router;
