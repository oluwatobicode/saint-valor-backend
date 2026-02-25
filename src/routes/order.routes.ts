import { Router } from "express";
import { orderController } from "../controllers";
import { authMiddleware } from "../middleware/auth.middlware";

const router = Router();

// All order routes require authentication

router.post("/initialize", authMiddleware, orderController.initializeOrder);
router.post("/verify/:reference", authMiddleware, orderController.verifyOrder);

// Order retrieval
router.get("/", authMiddleware, orderController.getAllOrders);
router.get("/me", authMiddleware, orderController.getUserOrders);
router.get("/:id", authMiddleware, orderController.getOrderById);

export default router;
