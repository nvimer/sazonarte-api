import { Router } from "express";
import userController from "../users/user.controller";

const router = Router();

router.patch("/:id", userController.updateUser);

export default router;
