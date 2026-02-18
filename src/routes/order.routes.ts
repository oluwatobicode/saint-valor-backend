import { Router } from "express";
import { orderController } from "../controllers";

const router = Router();

router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/user/:userId", orderController.getUserOrders);

export default router;
