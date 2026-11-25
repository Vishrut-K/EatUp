import { Cart } from "../models/Cart.js";
import { Restaurant } from "../models/Restaurant.js";
import { calculateCartTotals } from "../services/billingService.js";

function serializeCart(cartDoc) {
  const items = (cartDoc?.items || []).map((item) => ({
    id: item.dishId,
    dishId: item.dishId,
    name: item.name,
    price: item.price,
    isVeg: item.isVeg,
    image: item.image,
    qty: item.qty
  }));
  return {
    restaurantId: cartDoc?.restaurantId || null,
    restaurantName: cartDoc?.restaurantName || null,
    items,
    totals: calculateCartTotals(items)
  };
}

async function findOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, restaurantId: null, restaurantName: null, items: [] });
  }
  return cart;
}

export async function getCart(req, res) {
  const cart = await findOrCreateCart(req.user._id);
  return res.json({ success: true, cart: serializeCart(cart) });
}

export async function addCartItem(req, res) {
  const { restaurantId, dishId, replace = false } = req.body || {};
  if (!restaurantId || !dishId) {
    return res.status(400).json({ success: false, message: "restaurantId and dishId are required." });
  }

  const restaurant = await Restaurant.findOne({ legacyId: restaurantId }).lean();
  if (!restaurant) {
    return res.status(404).json({ success: false, message: "Restaurant not found." });
  }

  const dish = restaurant.menu.find((m) => m.dishId === dishId);
  if (!dish) {
    return res.status(404).json({ success: false, message: "Menu item not found." });
  }

  const cart = await findOrCreateCart(req.user._id);

  if (cart.items.length > 0 && cart.restaurantId !== restaurant.legacyId) {
    if (!replace) {
      return res.status(409).json({
        success: false,
        conflict: true,
        existingRestaurant: cart.restaurantName,
        newRestaurant: restaurant.name,
        message: "Cart contains items from another restaurant."
      });
    }
    cart.items = [];
  }

  cart.restaurantId = restaurant.legacyId;
  cart.restaurantName = restaurant.name;

  const existing = cart.items.find((i) => i.dishId === dish.dishId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.items.push({
      dishId: dish.dishId,
      name: dish.name,
      price: dish.price,
      isVeg: dish.isVeg,
      image: dish.image,
      qty: 1
    });
  }

  await cart.save();
  return res.json({ success: true, cart: serializeCart(cart) });
}

export async function updateCartItemQty(req, res) {
  const { dishId } = req.params;
  const { delta, qty } = req.body || {};
  const cart = await findOrCreateCart(req.user._id);

  const idx = cart.items.findIndex((i) => i.dishId === dishId);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Item not found in cart." });
  }

  const nextQty = typeof qty === "number" ? qty : cart.items[idx].qty + Number(delta || 0);
  if (nextQty <= 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].qty = nextQty;
  }

  if (cart.items.length === 0) {
    cart.restaurantId = null;
    cart.restaurantName = null;
  }

  await cart.save();
  return res.json({ success: true, cart: serializeCart(cart) });
}

export async function clearCart(req, res) {
  const cart = await findOrCreateCart(req.user._id);
  cart.restaurantId = null;
  cart.restaurantName = null;
  cart.items = [];
  await cart.save();
  return res.json({ success: true, cart: serializeCart(cart) });
}

/**
 * Merge guest localStorage cart items into persisted DB cart upon login.
 */
export async function mergeGuestCart(req, res) {
  const { restaurantId, items = [], replace = false } = req.body || {};
  const cart = await findOrCreateCart(req.user._id);

  if (!restaurantId || !Array.isArray(items) || items.length === 0) {
    return res.json({ success: true, cart: serializeCart(cart) });
  }

  const restaurant = await Restaurant.findOne({ legacyId: restaurantId }).lean();
  if (!restaurant) {
    return res.json({ success: true, cart: serializeCart(cart) });
  }

  if (cart.items.length > 0 && cart.restaurantId !== restaurant.legacyId && !replace) {
    return res.status(409).json({
      success: false,
      conflict: true,
      existingRestaurant: cart.restaurantName,
      newRestaurant: restaurant.name,
      cart: serializeCart(cart)
    });
  }

  if (replace || cart.items.length === 0) {
    cart.items = [];
    cart.restaurantId = restaurant.legacyId;
    cart.restaurantName = restaurant.name;
  }

  for (const guestItem of items) {
    const dish = restaurant.menu.find((m) => m.dishId === (guestItem.dishId || guestItem.id));
    const qty = Math.max(1, Number(guestItem.qty) || 1);
    if (!dish) continue;
    const existing = cart.items.find((i) => i.dishId === dish.dishId);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.items.push({
        dishId: dish.dishId,
        name: dish.name,
        price: dish.price,
        isVeg: dish.isVeg,
        image: dish.image,
        qty
      });
    }
  }

  await cart.save();
  return res.json({ success: true, cart: serializeCart(cart) });
}
