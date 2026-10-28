/**
 * EatUp - LocalStorage Storage Utilities
 * Handles demo authentication persistence, cart state, and order history.
 * Designed specifically for frontend-only college evaluation.
 */

const STORAGE_KEYS = {
  USERS: "eatup_users",
  SESSION: "eatup_session",
  CART: "eatup_cart",
  ORDERS: "eatup_orders"
};

// Default seed data for immediate demonstration by evaluators
const DEFAULT_DEMO_USER = {
  id: "user-demo-001",
  name: "Alex Morgan",
  email: "demo@eatup.com",
  password: "password123",
  createdAt: "2026-10-28T12:00:00.000Z"
};

// Safe JSON helper with fallback
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`[EatUp Storage] Error reading key "${key}". Resetting to fallback.`, err);
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[EatUp Storage] Error writing key "${key}".`, err);
    return false;
  }
}

/**
 * Initialize storage with seeded demo data if empty
 */
export function initStorage() {
  const users = safeGet(STORAGE_KEYS.USERS, []);
  if (!users.some(u => u.email.toLowerCase() === DEFAULT_DEMO_USER.email.toLowerCase())) {
    users.push(DEFAULT_DEMO_USER);
    safeSet(STORAGE_KEYS.USERS, users);
  }
}

/* ==========================================================================
   USER & SESSION MANAGEMENT (Demo Auth)
   ========================================================================== */

export function getUsers() {
  return safeGet(STORAGE_KEYS.USERS, []);
}

export function findUserByEmail(email) {
  if (!email) return null;
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
}

export function registerUser(name, email, password) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  
  if (!cleanName || !cleanEmail || !password) {
    return { success: false, message: "All fields are required." };
  }
  
  // Basic email pattern validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, message: "Please provide a valid email address." };
  }
  
  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters long." };
  }
  
  const users = getUsers();
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, message: "An account with this email already exists." };
  }
  
  const newUser = {
    id: "user-" + Date.now(),
    name: cleanName,
    email: cleanEmail,
    password: password, // College demo only: Plaintext for local simulation
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  safeSet(STORAGE_KEYS.USERS, users);
  
  return { success: true, user: newUser };
}

export function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, message: "No account found with this email." };
  }
  if (user.password !== password) {
    return { success: false, message: "Incorrect password. Please try again." };
  }
  
  // Create session object (omit password)
  const session = {
    id: user.id,
    name: user.name,
    email: user.email,
    loggedInAt: new Date().toISOString()
  };
  
  safeSet(STORAGE_KEYS.SESSION, session);
  return { success: true, session };
}

export function getSession() {
  return safeGet(STORAGE_KEYS.SESSION, null);
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function getDemoCredentials() {
  return {
    email: DEFAULT_DEMO_USER.email,
    password: DEFAULT_DEMO_USER.password
  };
}

/* ==========================================================================
   CART MANAGEMENT
   Cart schema:
   {
     restaurantId: "rest-1",
     restaurantName: "Royal Biryani House",
     items: [
       { id: "rb-101", name: "Hyderabadi Dum Biryani", price: 320, isVeg: false, image: "...", qty: 2 }
     ]
   }
   ========================================================================== */

export function getCart() {
  return safeGet(STORAGE_KEYS.CART, {
    restaurantId: null,
    restaurantName: null,
    items: []
  });
}

export function saveCart(cart) {
  safeSet(STORAGE_KEYS.CART, cart);
  // Dispatch custom storage event for in-page reactivity
  window.dispatchEvent(new CustomEvent("eatup-cart-updated", { detail: cart }));
}

export function clearCart() {
  const emptyCart = {
    restaurantId: null,
    restaurantName: null,
    items: []
  };
  saveCart(emptyCart);
  return emptyCart;
}

/**
 * Add an item to cart.
 * If the cart contains items from a different restaurant, returns conflict status.
 */
export function addToCart(restaurant, item) {
  const cart = getCart();
  
  // Conflict check: cart belongs to another restaurant with existing items
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
  
  const existingItemIndex = cart.items.findIndex(i => i.id === item.id);
  if (existingItemIndex > -1) {
    cart.items[existingItemIndex].qty += 1;
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
  const index = cart.items.findIndex(i => i.id === itemId);
  if (index === -1) return cart;
  
  const newQty = cart.items[index].qty + change;
  if (newQty <= 0) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index].qty = newQty;
  }
  
  if (cart.items.length === 0) {
    cart.restaurantId = null;
    cart.restaurantName = null;
  }
  
  saveCart(cart);
  return cart;
}

export function getCartTotals() {
  const cart = getCart();
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItemCount = cart.items.reduce((sum, item) => sum + item.qty, 0);
  
  // Delivery fee is ₹40, or free if subtotal > ₹400
  const deliveryFee = subtotal > 0 ? (subtotal >= 400 ? 0 : 40) : 0;
  // Small platform fee
  const platformFee = subtotal > 0 ? 5 : 0;
  // GST calculation (5%)
  const gst = subtotal > 0 ? Math.round(subtotal * 0.05) : 0;
  // Grand total
  const grandTotal = subtotal + deliveryFee + platformFee + gst;
  
  return {
    itemCount: totalItemCount,
    subtotal,
    deliveryFee,
    platformFee,
    gst,
    grandTotal
  };
}

/* ==========================================================================
   ORDER HISTORY
   ========================================================================== */

export function getOrders() {
  const session = getSession();
  const allOrders = safeGet(STORAGE_KEYS.ORDERS, []);
  if (!session) return [];
  // Return orders filtered for current user, newest first
  return allOrders
    .filter(order => order.userId === session.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function placeOrder(orderData) {
  const session = getSession();
  if (!session) {
    return { success: false, message: "You must be logged in to place an order." };
  }
  
  const cart = getCart();
  if (!cart.items || cart.items.length === 0) {
    return { success: false, message: "Your cart is empty." };
  }
  
  const totals = getCartTotals();
  const newOrder = {
    orderId: "EAT-" + Math.floor(100000 + Math.random() * 900000),
    userId: session.id,
    userName: session.name,
    userEmail: session.email,
    restaurantId: cart.restaurantId,
    restaurantName: cart.restaurantName,
    items: [...cart.items],
    totals: totals,
    deliveryAddress: orderData.address.trim(),
    deliveryPhone: orderData.phone ? orderData.phone.trim() : "9876543210",
    paymentMethod: orderData.paymentMethod || "Cash on Delivery",
    status: "Order Placed", // Simulated order progression status
    createdAt: new Date().toISOString()
  };
  
  const allOrders = safeGet(STORAGE_KEYS.ORDERS, []);
  allOrders.push(newOrder);
  safeSet(STORAGE_KEYS.ORDERS, allOrders);
  
  // Clear the active cart
  clearCart();
  
  return { success: true, order: newOrder };
}
