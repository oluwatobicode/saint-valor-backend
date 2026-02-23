import { Router } from "express";
import { productController } from "../controllers";

const router = Router();

// Products (paginated with filters)
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);

export default router;
