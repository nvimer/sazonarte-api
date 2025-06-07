import { Router } from "express";
import tableController from "./table.controller";

const router = Router();

router.post("/", tableController.postTable);

export default router;
