import { Router } from "express";
import { productController } from "../controllers";

const router = Router();

// creating a product
router.post("/", productController.createProduct);
router.post("/:id", productController.editProduct);

export default router;
