import { Router } from "express";
import {
  createSoloOrder,
  getMyOrders,
  getOrderByNumber,
  reorderToCart,
  updateParticipantSettlement
} from "../controllers/orderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getMyOrders);
router.post("/", createSoloOrder);
router.get("/:orderNumber", getOrderByNumber);
router.post("/:orderNumber/reorder", reorderToCart);
router.patch("/:orderNumber/settlement", updateParticipantSettlement);

export default router;
