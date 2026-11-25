import { Router } from "express";
import {
  addCartItem,
  clearCart,
  getCart,
  mergeGuestCart,
  updateCartItemQty
} from "../controllers/cartController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getCart);
router.post("/items", addCartItem);
router.patch("/items/:dishId", updateCartItemQty);
router.delete("/", clearCart);
router.post("/merge", mergeGuestCart);

export default router;
