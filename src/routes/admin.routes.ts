import { Router } from "express";
import { adminController } from "../controllers";
import { authMiddleware } from "../middleware/auth.middlware";
import { adminMiddleware } from "../middleware/admin.middlware";
import {
  uploadSingle,
  uploadProductImages,
} from "../middleware/upload.middlware";

const router = Router();

// All admin routes require login + admin role
router.use(authMiddleware, adminMiddleware);

// ── Category Management ──
router.get("/categories", adminController.getAllCategories);
router.post("/categories", adminController.createCategory);
router.put("/categories/:id", adminController.updateCategory);
router.delete("/categories/:id", adminController.deleteCategory);

// ── Collection Management (with image upload) ──
router.get("/collections", adminController.getAllCollections);
router.post("/collections", uploadSingle, adminController.createCollection);
router.put("/collections/:id", uploadSingle, adminController.updateCollection);
router.delete("/collections/:id", adminController.deleteCollection);

// ── Product Management (with image upload) ──
router.get("/products", adminController.getAdminProducts);
router.post("/products", uploadProductImages, adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);

// ── Order Management ──
router.get("/orders", adminController.getAdminOrders);
router.get("/orders/:id", adminController.getAdminOrder);
router.put("/orders/:id/status", adminController.updateOrderStatus);

// ── Dashboard ──
router.get("/dashboard/stats", adminController.getDashboardStats);

// ── User Management ──
router.get("/users", adminController.getAdminUsers);
router.get("/users/:id", adminController.getAdminUserDetail);

export default router;
