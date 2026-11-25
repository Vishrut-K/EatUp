import { Cart } from "../models/Cart.js";
import { Order } from "../models/Order.js";
import { Restaurant } from "../models/Restaurant.js";
import { calculateCartTotals } from "../services/billingService.js";

export function generateOrderNumber() {
  return "EAT-" + Math.floor(100000 + Math.random() * 900000);
}

export async function createSoloOrder(req, res) {
  const { name, phone, address, paymentMethod } = req.body || {};
  const cleanName = (name || "").trim();
  const cleanPhone = (phone || "").trim();
  const cleanAddress = (address || "").trim();

  if (!cleanName || !cleanPhone || !cleanAddress) {
    return res.status(400).json({ success: false, message: "Please fill in all delivery details." });
  }

  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Your cart is empty." });
  }

  const restaurant = await Restaurant.findOne({ legacyId: cart.restaurantId }).lean();
  if (!restaurant) {
    return res.status(400).json({ success: false, message: "Selected restaurant is no longer available." });
  }

  // Re-verify authoritative prices from DB menu
  const verifiedItems = [];
  for (const cartItem of cart.items) {
    const dish = restaurant.menu.find((m) => m.dishId === cartItem.dishId);
    if (!dish) continue;
    verifiedItems.push({
      dishId: dish.dishId,
      name: dish.name,
      price: dish.price,
      isVeg: dish.isVeg,
      image: dish.image,
      qty: cartItem.qty,
      ownerUserId: req.user._id,
      ownerName: req.user.name
    });
  }

  if (verifiedItems.length === 0) {
    return res.status(400).json({ success: false, message: "No valid menu items in cart." });
  }

  const totals = calculateCartTotals(verifiedItems);

  let orderNumber = generateOrderNumber();
  while (await Order.exists({ orderNumber })) {
    orderNumber = generateOrderNumber();
  }

  const order = await Order.create({
    orderNumber,
    orderType: "solo",
    placedByUserId: req.user._id,
    placedByName: req.user.name,
    placedByEmail: req.user.email,
    restaurantId: restaurant.legacyId,
    restaurantName: restaurant.name,
    items: verifiedItems,
    totals,
    participantShares: [
      {
        userId: req.user._id,
        userName: req.user.name,
        itemCount: totals.itemCount,
        itemsSubtotal: totals.subtotal,
        deliveryShare: totals.deliveryFee,
        platformShare: totals.platformFee,
        gstShare: totals.gst,
        totalOwed: totals.grandTotal,
        paymentResponsibilityStatus: "settled"
      }
    ],
    recipientName: cleanName,
    deliveryPhone: cleanPhone,
    deliveryAddress: cleanAddress,
    paymentMethod: paymentMethod || "Cash on Delivery (Demo)",
    status: "Order Placed"
  });

  // Clear user's active cart
  cart.restaurantId = null;
  cart.restaurantName = null;
  cart.items = [];
  await cart.save();

  return res.status(201).json({ success: true, order });
}

export async function getMyOrders(req, res) {
  const userId = req.user._id;
  const orders = await Order.find({
    $or: [{ placedByUserId: userId }, { "participantShares.userId": userId }]
  })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({ success: true, orders });
}

export async function getOrderByNumber(req, res) {
  const { orderNumber } = req.params;
  const userId = req.user._id.toString();
  const order = await Order.findOne({ orderNumber }).lean();
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  const isOwner = order.placedByUserId.toString() === userId;
  const isParticipant = order.participantShares?.some((s) => s.userId.toString() === userId);
  if (!isOwner && !isParticipant) {
    return res.status(403).json({ success: false, message: "Access denied to this order." });
  }

  return res.json({ success: true, order });
}

export async function reorderToCart(req, res) {
  const { orderNumber } = req.params;
  const order = await Order.findOne({ orderNumber }).lean();
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  const userId = req.user._id.toString();
  const isOwner = order.placedByUserId.toString() === userId;
  const isParticipant = order.participantShares?.some((s) => s.userId.toString() === userId);
  if (!isOwner && !isParticipant) {
    return res.status(403).json({ success: false, message: "Access denied." });
  }

  const restaurant = await Restaurant.findOne({ legacyId: order.restaurantId }).lean();
  if (!restaurant) {
    return res.status(404).json({ success: false, message: "Restaurant no longer available." });
  }

  // For group orders, reorder the requesting user's own items (or all items if solo)
  const sourceItems =
    order.orderType === "group"
      ? order.items.filter((i) => i.ownerUserId.toString() === userId)
      : order.items;

  const itemsToLoad = (sourceItems.length > 0 ? sourceItems : order.items)
    .map((item) => {
      const dish = restaurant.menu.find((m) => m.dishId === item.dishId);
      if (!dish) return null;
      return {
        dishId: dish.dishId,
        name: dish.name,
        price: dish.price,
        isVeg: dish.isVeg,
        image: dish.image,
        qty: item.qty
      };
    })
    .filter(Boolean);

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    cart = new Cart({ userId: req.user._id });
  }
  cart.restaurantId = restaurant.legacyId;
  cart.restaurantName = restaurant.name;
  cart.items = itemsToLoad;
  await cart.save();

  return res.json({
    success: true,
    cart: {
      restaurantId: cart.restaurantId,
      restaurantName: cart.restaurantName,
      items: cart.items.map((i) => ({ ...i.toObject(), id: i.dishId })),
      totals: calculateCartTotals(cart.items)
    }
  });
}

export async function updateParticipantSettlement(req, res) {
  const { orderNumber } = req.params;
  const { targetUserId, status } = req.body || {};
  if (!["unpaid", "settled"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid settlement status." });
  }

  const order = await Order.findOne({ orderNumber });
  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found." });
  }

  const requesterId = req.user._id.toString();
  const isCreator = order.placedByUserId.toString() === requesterId;
  const shareUserId = targetUserId || requesterId;

  if (!isCreator && shareUserId !== requesterId) {
    return res.status(403).json({
      success: false,
      message: "Only the room creator or the participant can update this payment status."
    });
  }

  const share = order.participantShares.find((s) => s.userId.toString() === shareUserId);
  if (!share) {
    return res.status(404).json({ success: false, message: "Participant share not found." });
  }

  share.paymentResponsibilityStatus = status;
  await order.save();

  return res.json({ success: true, order });
}
