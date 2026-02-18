import { Router } from "express";
import { userController } from "../controllers";

const router = Router();

router.get("/", userController.allUsers);
router.post("/:id", userController.getAUser);

export default router;
