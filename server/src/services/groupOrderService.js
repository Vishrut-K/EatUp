import { randomInt } from "crypto";
import { GroupOrder } from "../models/GroupOrder.js";
import { Restaurant } from "../models/Restaurant.js";
import { Order } from "../models/Order.js";
import { calculateGroupBill } from "./billingService.js";
import { generateUniqueOrderNumber } from "../controllers/orderController.js";

const PHONE_REGEX = /^\d{10}$/;

// Per-room async mutex to prevent concurrent read-modify-write races
const roomLocks = new Map();

export async function withRoomLock(roomCode, fn) {
  const key = roomCode.toUpperCase();
  const prev = roomLocks.get(key) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  roomLocks.set(key, prev.then(() => current));

  await prev;
  try {
    return await fn();
  } finally {
    release();
    if (roomLocks.get(key) === current) {
      roomLocks.delete(key);
    }
  }
}

function createServiceError(message, statusCode = 400, extra = {}) {
  const err = new Error(message);
  err.statusCode = statusCode;
  Object.assign(err, extra);
  return err;
}

export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += chars.charAt(randomInt(chars.length));
  }
  return code;
}

async function generateUniqueRoomCode(maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i += 1) {
    const candidate = generateRoomCode();
    if (!(await GroupOrder.exists({ roomCode: candidate }))) {
      return candidate;
    }
  }
  throw createServiceError("Unable to generate a unique room code. Please try again.", 503);
}

export function serializeGroupOrder(doc) {
  const creatorIdStr = doc.creatorId.toString();
  const { combinedTotals, participantBills } = calculateGroupBill(
    doc.items,
    doc.participants,
    creatorIdStr
  );

  return {
    id: doc._id.toString(),
    roomCode: doc.roomCode,
    status: doc.status,
    creatorId: creatorIdStr,
    creatorName: doc.creatorName,
    restaurantId: doc.restaurantId,
    restaurantName: doc.restaurantName,
    finalOrderNumber: doc.finalOrderNumber,
    participants: doc.participants.map((p) => ({
      userId: p.userId.toString(),
      name: p.name,
      joinedAt: p.joinedAt,
      isOnline: p.isOnline,
      isCreator: p.userId.toString() === creatorIdStr
    })),
    items: doc.items.map((item) => ({
      dishId: item.dishId,
      name: item.name,
      price: item.price,
      isVeg: item.isVeg,
      image: item.image,
      qty: item.qty,
      addedBy: {
        userId: item.addedBy.userId.toString(),
        name: item.addedBy.name
      }
    })),
    combinedTotals,
    participantBills,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export async function createGroupRoom({ user, restaurantId = null }) {
  let restaurantName = null;
  let validRestaurantId = null;

  if (restaurantId) {
    const rest = await Restaurant.findOne({ legacyId: restaurantId }).lean();
    if (!rest) {
      throw createServiceError("Selected restaurant not found.", 404);
    }
    validRestaurantId = rest.legacyId;
    restaurantName = rest.name;
  }

  const roomCode = await generateUniqueRoomCode();

  const room = await GroupOrder.create({
    roomCode,
    creatorId: user._id,
    creatorName: user.name,
    restaurantId: validRestaurantId,
    restaurantName,
    status: "open",
    participants: [{ userId: user._id, name: user.name, isOnline: true }],
    items: []
  });

  return serializeGroupOrder(room);
}

export async function getGroupRoomState(roomCode) {
  const room = await GroupOrder.findOne({ roomCode: roomCode.toUpperCase().trim() });
  if (!room) {
    throw createServiceError("Group order room not found.", 404);
  }
  return serializeGroupOrder(room);
}

export async function joinGroupRoom({ roomCode, user }) {
  return withRoomLock(roomCode, async () => {
    const room = await GroupOrder.findOne({ roomCode: roomCode.toUpperCase().trim() });
    if (!room) {
      throw createServiceError("Group order room not found. Check your room code.", 404);
    }

    const userIdStr = user._id.toString();
    const existingParticipant = room.participants.find((p) => p.userId.toString() === userIdStr);

    if (!existingParticipant) {
      if (room.status === "finalized" || room.status === "cancelled") {
        throw createServiceError("This group order has already ended.", 400);
      }
      if (room.status === "locked") {
        throw createServiceError("This group order is currently locked for checkout.", 400);
      }
      room.participants.push({ userId: user._id, name: user.name, isOnline: true });
    } else {
      existingParticipant.isOnline = true;
    }

    await room.save();
    return serializeGroupOrder(room);
  });
}

export async function leaveGroupRoom({ roomCode, user }) {
  return withRoomLock(roomCode, async () => {
    const room = await GroupOrder.findOne({ roomCode: roomCode.toUpperCase().trim() });
    if (!room) {
      throw createServiceError("Group order room not found.", 404);
    }

    if (room.status === "finalized" || room.status === "cancelled") {
      return serializeGroupOrder(room);
    }

    const userIdStr = user._id.toString();
    // Remove participant's items and participant entry
    room.items = room.items.filter((item) => item.addedBy.userId.toString() !== userIdStr);
    room.participants = room.participants.filter((p) => p.userId.toString() !== userIdStr);

    if (room.items.length === 0) {
      room.restaurantId = null;
      room.restaurantName = null;
    }

    if (room.participants.length === 0) {
      room.status = "cancelled";
    } else if (room.creatorId.toString() === userIdStr) {
      // Transfer host role to the earliest remaining participant
      const nextHost = room.participants[0];
      room.creatorId = nextHost.userId;
      room.creatorName = nextHost.name;
    }

    await room.save();
    return serializeGroupOrder(room);
  });
}

export async function addItemToGroupRoom({ roomCode, user, restaurantId, dishId, replace = false }) {
  return withRoomLock(roomCode, async () => {
    const room = await GroupOrder.findOne({ roomCode: roomCode.toUpperCase().trim() });
    if (!room) {
      throw createServiceError("Group order room not found.", 404);
    }
    if (room.status !== "open") {
      throw createServiceError(
        room.status === "locked"
          ? "The host locked this group cart for checkout."
          : "This group order is already finalized.",
        400
      );
    }

    const userIdStr = user._id.toString();
    const isParticipant = room.participants.some((p) => p.userId.toString() === userIdStr);
    if (!isParticipant) {
      room.participants.push({ userId: user._id, name: user.name, isOnline: true });
    }

    const restaurant = await Restaurant.findOne({ legacyId: restaurantId }).lean();
    if (!restaurant) {
      throw createServiceError("Restaurant not found.", 404);
    }
    const dish = restaurant.menu.find((m) => m.dishId === dishId);
    if (!dish) {
      throw createServiceError("Dish not found.", 404);
    }

    const hasDifferentRestaurant =
      room.restaurantId && room.restaurantId !== restaurant.legacyId && room.items.length > 0;

    if (hasDifferentRestaurant) {
      if (!replace) {
        throw createServiceError(
          `This group order is currently from ${room.restaurantName}.`,
          409,
          {
            conflict: true,
            isCreator: room.creatorId.toString() === userIdStr,
            existingRestaurant: room.restaurantName,
            newRestaurant: restaurant.name
          }
        );
      }
      if (room.creatorId.toString() !== userIdStr) {
        throw createServiceError(
          `Only the room creator (${room.creatorName}) can switch restaurants for the group.`,
          403
        );
      }
      room.items = [];
    }

    room.restaurantId = restaurant.legacyId;
    room.restaurantName = restaurant.name;

    const existing = room.items.find(
      (i) => i.dishId === dish.dishId && i.addedBy.userId.toString() === userIdStr
    );
    if (existing) {
      existing.qty += 1;
      existing.updatedAt = new Date();
    } else {
      room.items.push({
        dishId: dish.dishId,
        name: dish.name,
        price: dish.price,
        isVeg: dish.isVeg,
        image: dish.image,
        qty: 1,
        addedBy: { userId: user._id, name: user.name },
        updatedAt: new Date()
      });
    }

    await room.save();
    return serializeGroupOrder(room);
  });
}

export async function updateGroupItemQty({ roomCode, user, dishId, delta }) {
  return withRoomLock(roomCode, async () => {
    const room = await GroupOrder.findOne({ roomCode: roomCode.toUpperCase().trim() });
    if (!room) {
      throw createServiceError("Group order room not found.", 404);
    }
    if (room.status !== "open") {
      throw createServiceError("This group cart is locked or finalized.", 400);
    }

    const userIdStr = user._id.toString();
    const idx = room.items.findIndex(
      (i) => i.dishId === dishId && i.addedBy.userId.toString() === userIdStr
    );
    if (idx === -1) {
      throw createServiceError("You can only modify quantities of your own items.", 404);
    }

    const nextQty = room.items[idx].qty + Number(delta || 0);
    if (nextQty <= 0) {
      room.items.splice(idx, 1);
    } else {
      room.items[idx].qty = nextQty;
      room.items[idx].updatedAt = new Date();
    }

    if (room.items.length === 0) {
      room.restaurantId = null;
      room.restaurantName = null;
    }

    await room.save();
    return serializeGroupOrder(room);
  });
}

export async function setGroupRoomLock({ roomCode, user, locked }) {
  return withRoomLock(roomCode, async () => {
    const room = await GroupOrder.findOne({ roomCode: roomCode.toUpperCase().trim() });
    if (!room) {
      throw createServiceError("Group order room not found.", 404);
    }
    if (room.creatorId.toString() !== user._id.toString()) {
      throw createServiceError("Only the room creator can lock or unlock the order.", 403);
    }
    if (room.status === "finalized" || room.status === "cancelled") {
      throw createServiceError("Cannot modify a finalized or cancelled room.", 400);
    }

    room.status = locked ? "locked" : "open";
    await room.save();
    return serializeGroupOrder(room);
  });
}

export async function finalizeGroupOrder({ roomCode, user, recipientName, phone, address, paymentMethod }) {
  return withRoomLock(roomCode, async () => {
    const room = await GroupOrder.findOne({ roomCode: roomCode.toUpperCase().trim() });
    if (!room) {
      throw createServiceError("Group order room not found.", 404);
    }
    if (room.creatorId.toString() !== user._id.toString()) {
      throw createServiceError("Only the room creator can finalize the combined order.", 403);
    }
    if (room.status === "finalized") {
      throw createServiceError("This group order has already been finalized.", 400);
    }
    if (!room.items || room.items.length === 0 || !room.restaurantId) {
      throw createServiceError("Add at least one item before placing the group order.", 400);
    }

    const cleanName = (recipientName || "").trim();
    const cleanPhone = (phone || "").trim();
    const cleanAddress = (address || "").trim();
    if (!cleanName || !cleanPhone || !cleanAddress) {
      throw createServiceError("Please fill in all delivery details.", 400);
    }
    if (!PHONE_REGEX.test(cleanPhone)) {
      throw createServiceError("Please enter a valid 10-digit phone number.", 400);
    }

    const restaurant = await Restaurant.findOne({ legacyId: room.restaurantId }).lean();
    if (!restaurant) {
      throw createServiceError("Restaurant not found.", 404);
    }

    // Re-sync authoritative dish prices before finalizing
    const verifiedItems = room.items.map((item) => {
      const dish = restaurant.menu.find((m) => m.dishId === item.dishId);
      return {
        dishId: item.dishId,
        name: dish ? dish.name : item.name,
        price: dish ? dish.price : item.price,
        isVeg: dish ? dish.isVeg : item.isVeg,
        image: dish ? dish.image : item.image,
        qty: item.qty,
        addedBy: item.addedBy
      };
    });

    const { combinedTotals, participantBills } = calculateGroupBill(
      verifiedItems,
      room.participants,
      room.creatorId.toString()
    );

    const orderNumber = await generateUniqueOrderNumber();

    const order = await Order.create({
      orderNumber,
      orderType: "group",
      groupOrderId: room._id,
      roomCode: room.roomCode,
      placedByUserId: user._id,
      placedByName: user.name,
      placedByEmail: user.email,
      restaurantId: restaurant.legacyId,
      restaurantName: restaurant.name,
      items: verifiedItems.map((i) => ({
        dishId: i.dishId,
        name: i.name,
        price: i.price,
        isVeg: i.isVeg,
        image: i.image,
        qty: i.qty,
        ownerUserId: i.addedBy.userId,
        ownerName: i.addedBy.name
      })),
      totals: combinedTotals,
      participantShares: participantBills
        .filter((b) => b.itemCount > 0)
        .map((b) => ({
          userId: b.userId,
          userName: b.userName,
          itemCount: b.itemCount,
          itemsSubtotal: b.itemsSubtotal,
          deliveryShare: b.deliveryShare,
          platformShare: b.platformShare,
          gstShare: b.gstShare,
          totalOwed: b.totalOwed,
          paymentResponsibilityStatus: "unpaid"
        })),
      recipientName: cleanName,
      deliveryPhone: cleanPhone,
      deliveryAddress: cleanAddress,
      paymentMethod: paymentMethod || "Cash on Delivery (Demo)",
      status: "Order Placed"
    });

    room.status = "finalized";
    room.finalOrderNumber = order.orderNumber;
    await room.save();

    return {
      groupOrder: serializeGroupOrder(room),
      order
    };
  });
}

export async function setParticipantOnlineStatus(roomCode, userId, isOnline) {
  return withRoomLock(roomCode, async () => {
    const room = await GroupOrder.findOne({ roomCode: roomCode.toUpperCase().trim() });
    if (!room) return null;
    const p = room.participants.find((part) => part.userId.toString() === userId.toString());
    if (!p) return serializeGroupOrder(room);
    p.isOnline = isOnline;
    await room.save();
    return serializeGroupOrder(room);
  });
}
