import { Router } from "express";
import { orderController } from "../controllers";
import { authMiddleware } from "../middleware/auth.middlware";

const router = Router();

// Payment flow (protected)
router.post("/initialize", authMiddleware, orderController.initializeOrder);
router.post("/verify/:reference", authMiddleware, orderController.verifyOrder);

// Existing (protected)
router.post("/", authMiddleware, orderController.createOrder);
router.get("/", authMiddleware, orderController.getAllOrders);
router.get("/me", authMiddleware, orderController.getUserOrders);
router.get("/:id", authMiddleware, orderController.getOrderById);

export default router;
