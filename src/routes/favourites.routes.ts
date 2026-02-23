import { Router } from "express";
import { favouriteController } from "../controllers";

const router = Router();

router.get("/:userId", favouriteController.getUserFavourites);
router.post("/", favouriteController.addFavourite);
router.delete("/:productId", favouriteController.removeFavourite);

export default router;
