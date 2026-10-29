/**
 * EatUp - LocalStorage Storage Utilities
 * Handles demo authentication persistence, cart state, and order history.
 */

const KEYS = {
  USERS: 'eatup_users',
  SESSION: 'eatup_session',
  CART: 'eatup_cart',
  ORDERS: 'eatup_orders'
};

const DEMO_USER = {
  id: 'user-demo-001',
  name: 'Alex Morgan',
  email: 'demo@eatup.com',
  password: 'password123',
  createdAt: '2026-10-28T12:00:00.000Z'
};

const get = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

const set = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    return false;
  }
};

export function initStorage() {
  const users = getUsers();
  if (!users.some(u => u.email.toLowerCase() === DEMO_USER.email.toLowerCase())) {
    users.push(DEMO_USER);
    set(KEYS.USERS, users);
  }
}

// User & Auth Management
export const getUsers = () => get(KEYS.USERS, []);

export const findUserByEmail = (email) => {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  return getUsers().find(u => u.email.toLowerCase() === clean) || null;
};

export function registerUser(name, email, password) {
  const cleanName = (name || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanName || !cleanEmail || !password) {
    return { success: false, message: 'All fields are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, message: 'Please provide a valid email address.' };
  }
  if (password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const user = {
    id: 'user-' + Date.now(),
    name: cleanName,
    email: cleanEmail,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  set(KEYS.USERS, users);
  return { success: true, user };
}

export function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) return { success: false, message: 'No account found with this email.' };
  if (user.password !== password) return { success: false, message: 'Incorrect password. Please try again.' };

  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    loggedInAt: new Date().toISOString()
  };
  set(KEYS.SESSION, session);
  return { success: true, session };
}

export const getSession = () => get(KEYS.SESSION, null);
export const clearSession = () => localStorage.removeItem(KEYS.SESSION);
export const getDemoCredentials = () => ({ email: DEMO_USER.email, password: DEMO_USER.password });

// Cart Management
const EMPTY_CART = { restaurantId: null, restaurantName: null, items: [] };

export const getCart = () => get(KEYS.CART, { ...EMPTY_CART, items: [] });

export function saveCart(cart) {
  set(KEYS.CART, cart);
  window.dispatchEvent(new CustomEvent('eatup-cart-updated', { detail: cart }));
}

export function clearCart() {
  const empty = { ...EMPTY_CART, items: [] };
  saveCart(empty);
  return empty;
}

export function addToCart(restaurant, item) {
  const cart = getCart();

  if (cart.items.length > 0 && cart.restaurantId !== restaurant.id) {
    return {
      success: false,
      conflict: true,
      existingRestaurant: cart.restaurantName,
      newRestaurant: restaurant.name
    };
  }

  cart.restaurantId = restaurant.id;
  cart.restaurantName = restaurant.name;

  const existing = cart.items.find(i => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      isVeg: item.isVeg,
      image: item.image,
      qty: 1
    });
  }

  saveCart(cart);
  return { success: true, cart };
}

export function updateCartItemQty(itemId, change) {
  const cart = getCart();
  const idx = cart.items.findIndex(i => i.id === itemId);
  if (idx === -1) return cart;

  const newQty = cart.items[idx].qty + change;
  if (newQty <= 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].qty = newQty;
  }

  if (cart.items.length === 0) {
    cart.restaurantId = null;
    cart.restaurantName = null;
  }

  saveCart(cart);
  return cart;
}

export function getCartTotals() {
  const { items } = getCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const deliveryFee = subtotal > 0 ? (subtotal >= 400 ? 0 : 40) : 0;
  const platformFee = subtotal > 0 ? 5 : 0;
  const gst = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;

  return {
    itemCount,
    subtotal,
    deliveryFee,
    platformFee,
    gst,
    grandTotal: subtotal + deliveryFee + platformFee + gst
  };
}

// Orders Management
export function getOrders() {
  const session = getSession();
  if (!session) return [];
  return get(KEYS.ORDERS, [])
    .filter(o => o.userId === session.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function placeOrder(orderData) {
  const session = getSession();
  if (!session) return { success: false, message: 'You must be logged in to place an order.' };

  const cart = getCart();
  if (!cart.items || cart.items.length === 0) return { success: false, message: 'Your cart is empty.' };

  const newOrder = {
    orderId: 'EAT-' + Math.floor(100000 + Math.random() * 900000),
    userId: session.id,
    userName: session.name,
    userEmail: session.email,
    restaurantId: cart.restaurantId,
    restaurantName: cart.restaurantName,
    items: [...cart.items],
    totals: getCartTotals(),
    deliveryAddress: (orderData.address || '').trim(),
    deliveryPhone: (orderData.phone || '9876543210').trim(),
    paymentMethod: orderData.paymentMethod || 'Cash on Delivery',
    status: 'Order Placed',
    createdAt: new Date().toISOString()
  };

  const orders = get(KEYS.ORDERS, []);
  orders.push(newOrder);
  set(KEYS.ORDERS, orders);

  clearCart();
  return { success: true, order: newOrder };
}
