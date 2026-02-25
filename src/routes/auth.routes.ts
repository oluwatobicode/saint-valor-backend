import { Router } from "express";
import { authController } from "../controllers";
import { authMiddleware } from "../middleware/auth.middlware";
import rateLimit from "express-rate-limit";

const router = Router();

// app rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "You have made too many login attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post("/signup", authController.signup);
router.post("/login", authLimiter, authController.login);

// Protected routes (require login)
router.get("/me", authMiddleware, authController.getMe);
router.put("/profile", authMiddleware, authController.updateProfile);
router.post("/logout", authMiddleware, authController.logout);

export default router;
