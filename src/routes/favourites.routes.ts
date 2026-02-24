import { Router } from "express";
import { favouriteController } from "../controllers";
import { authMiddleware } from "../middleware/auth.middlware";

const router = Router();

// All favourite routes require login — userId comes from JWT
router.get("/", authMiddleware, favouriteController.getUserFavourites);
router.post("/", authMiddleware, favouriteController.addFavourite);
router.delete(
  "/:productId",
  authMiddleware,
  favouriteController.removeFavourite,
);

export default router;
