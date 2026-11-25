import {
  addItemToGroupRoom,
  createGroupRoom,
  finalizeGroupOrder,
  getGroupRoomState,
  joinGroupRoom,
  leaveGroupRoom,
  setGroupRoomLock,
  updateGroupItemQty
} from "../services/groupOrderService.js";

function emitRoomState(req, roomCode, groupOrder) {
  const io = req.app.get("io");
  if (io) {
    io.to(`room:${roomCode.toUpperCase()}`).emit("group:state", groupOrder);
  }
}

export async function createRoom(req, res) {
  const { restaurantId = null } = req.body || {};
  const groupOrder = await createGroupRoom({ user: req.user, restaurantId });
  return res.status(201).json({ success: true, groupOrder });
}

export async function getRoom(req, res) {
  const { roomCode } = req.params;
  const groupOrder = await getGroupRoomState(roomCode);
  return res.json({ success: true, groupOrder });
}

export async function joinRoom(req, res) {
  const { roomCode } = req.params;
  const groupOrder = await joinGroupRoom({ roomCode, user: req.user });
  emitRoomState(req, roomCode, groupOrder);
  return res.json({ success: true, groupOrder });
}

export async function leaveRoom(req, res) {
  const { roomCode } = req.params;
  const groupOrder = await leaveGroupRoom({ roomCode, user: req.user });
  emitRoomState(req, roomCode, groupOrder);
  return res.json({ success: true, groupOrder });
}

export async function addRoomItem(req, res) {
  const { roomCode } = req.params;
  const { restaurantId, dishId, replace = false } = req.body || {};
  if (!restaurantId || !dishId) {
    return res.status(400).json({ success: false, message: "restaurantId and dishId are required." });
  }
  const groupOrder = await addItemToGroupRoom({
    roomCode,
    user: req.user,
    restaurantId,
    dishId,
    replace
  });
  emitRoomState(req, roomCode, groupOrder);
  return res.json({ success: true, groupOrder });
}

export async function updateRoomItem(req, res) {
  const { roomCode, dishId } = req.params;
  const { delta } = req.body || {};
  const groupOrder = await updateGroupItemQty({
    roomCode,
    user: req.user,
    dishId,
    delta
  });
  emitRoomState(req, roomCode, groupOrder);
  return res.json({ success: true, groupOrder });
}

export async function toggleRoomLock(req, res) {
  const { roomCode } = req.params;
  const { locked } = req.body || {};
  const groupOrder = await setGroupRoomLock({
    roomCode,
    user: req.user,
    locked: Boolean(locked)
  });
  emitRoomState(req, roomCode, groupOrder);
  const io = req.app.get("io");
  if (io) {
    io.to(`room:${roomCode.toUpperCase()}`).emit("group:lock_changed", { status: groupOrder.status });
  }
  return res.json({ success: true, groupOrder });
}

export async function finalizeRoom(req, res) {
  const { roomCode } = req.params;
  const { name, phone, address, paymentMethod } = req.body || {};
  const { groupOrder, order } = await finalizeGroupOrder({
    roomCode,
    user: req.user,
    recipientName: name,
    phone,
    address,
    paymentMethod
  });

  const io = req.app.get("io");
  if (io) {
    io.to(`room:${roomCode.toUpperCase()}`).emit("group:state", groupOrder);
    io.to(`room:${roomCode.toUpperCase()}`).emit("group:finalized", {
      orderNumber: order.orderNumber,
      order
    });
  }

  return res.status(201).json({ success: true, groupOrder, order });
}
