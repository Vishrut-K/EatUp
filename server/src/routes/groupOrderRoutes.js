import { Router } from "express";
import {
  addRoomItem,
  createRoom,
  finalizeRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  toggleRoomLock,
  updateRoomItem
} from "../controllers/groupOrderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.post("/", createRoom);
router.get("/:roomCode", getRoom);
router.post("/:roomCode/join", joinRoom);
router.post("/:roomCode/leave", leaveRoom);
router.post("/:roomCode/items", addRoomItem);
router.patch("/:roomCode/items/:dishId", updateRoomItem);
router.patch("/:roomCode/lock", toggleRoomLock);
router.post("/:roomCode/finalize", finalizeRoom);

export default router;
