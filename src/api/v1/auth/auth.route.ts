import { Router } from "express";
import authController from "./auth.controller";

const router = Router();

router.post("/", authController.postUser);

export default router;
