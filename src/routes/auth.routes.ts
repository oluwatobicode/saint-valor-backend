import { Router } from "express";
import { authController } from "../controllers";
import { authMiddleware } from "../middleware/auth.middlware";
import rateLimit from "express-rate-limit";

const router = Router();

// Rate limiter: max 5 requests per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "You have made too many attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post("/signup", authLimiter, authController.signup);
router.post("/login", authLimiter, authController.login);
router.post("/verify-email", authLimiter, authController.verifyEmail);
router.post("/resend-otp", authLimiter, authController.resendOtp);

// Protected routes (require login)
router.get("/me", authMiddleware, authController.getMe);
router.put("/profile", authMiddleware, authController.updateProfile);
router.post("/logout", authMiddleware, authController.logout);

export default router;
