import { Router } from "express";
import { authController } from "../controllers";
import { authMiddleware } from "../middleware/auth.middlware";

const router = Router();

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Protected routes (require login)
router.get("/me", authMiddleware, authController.getMe);
router.put("/profile", authMiddleware, authController.updateProfile);
router.post("/logout", authMiddleware, authController.logout);

export default router;
