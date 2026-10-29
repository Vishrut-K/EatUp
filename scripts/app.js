/**
 * EatUp - Main Application Controller
 * Handles SPA navigation, UI rendering, event listeners, cart operations,
 * search/filters, authentication modal, checkout, and order history.
 */

import { CATEGORIES, RESTAURANTS, FALLBACK_FOOD_IMG } from "./data.js";
import {
  initStorage,
  getSession,
  loginUser,
  registerUser,
  clearSession,
  getDemoCredentials,
  getCart,
  clearCart,
  addToCart,
  updateCartItemQty,
  getCartTotals,
  getOrders,
  placeOrder
} from "./storage.js";

// Helper for element selection by ID
const $ = (id) => document.getElementById(id);

/* ==========================================================================
   APP STATE
   ========================================================================== */
const state = {
  currentView: "landing",
  activeRestaurantId: null,
  activeCategory: "all",
  searchQuery: "",
  menuSearchQuery: "",
  filterVegOnly: false,
  filterHighRating: false,
  filterFastDelivery: false,
  sortOption: "relevance",
  menuVegOnly: false,
  pendingConflictItem: null
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
function init() {
  initStorage();
  updateAuthUI();
  updateCartBadge();
  setupEventListeners();

  renderLandingCategories();
  renderLandingFeatured();
  renderExploreCategories();

  handleRouting();
  window.addEventListener("hashchange", handleRouting);

  window.addEventListener("eatup-cart-updated", () => {
    updateCartBadge();
    if ($("cart-drawer").classList.contains("open")) renderCartDrawer();
    if (state.currentView === "restaurant") renderRestaurantMenu();
  });

  window.addEventListener("scroll", () => {
    $("app-header").classList.toggle("scrolled", window.scrollY > 20);
  });
}

/* ==========================================================================
   ROUTING & VIEW SWITCHING
   ========================================================================== */
function handleRouting() {
  const hash = window.location.hash || "#landing";
  const [route, param] = hash.split("/");

  document.querySelectorAll(".view-section").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));

  if (route === "#explore") {
    state.currentView = "explore";
    $("view-explore").classList.add("active");
    $("nav-link-explore").classList.add("active");
    renderExploreRestaurants();
  } else if (route === "#restaurant" && param) {
    state.currentView = "restaurant";
    state.activeRestaurantId = param;
    $("view-restaurant").classList.add("active");
    renderRestaurantDetail(param);
  } else if (route === "#checkout") {
    const cart = getCart();
    if (!cart.items || cart.items.length === 0) {
      showToast("Your cart is empty! Add items first.");
      window.location.hash = "#explore";
      return;
    }
    state.currentView = "checkout";
    $("view-checkout").classList.add("active");
    renderCheckout();
  } else if (route === "#orders") {
    state.currentView = "orders";
    $("view-orders").classList.add("active");
    $("nav-link-orders").classList.add("active");
    renderOrders();
  } else if (route === "#confirmation") {
    state.currentView = "confirmation";
    $("view-confirmation").classList.add("active");
  } else {
    state.currentView = "landing";
    $("view-landing").classList.add("active");
    $("nav-link-home").classList.add("active");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================================================
   TOAST NOTIFICATIONS & HTML ESCAPING
   ========================================================================== */
export function showToast(message, icon = "✨") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  $("toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   AUTHENTICATION UI & MODAL
   ========================================================================== */
function updateAuthUI() {
  const session = getSession();
  const navAuthBtn = $("nav-auth-btn");
  const navUserMenu = $("nav-user-menu");

  if (session) {
    navAuthBtn.style.display = "none";
    navUserMenu.style.display = "block";
    $("user-display-name").textContent = session.name.split(" ")[0];
    $("user-avatar-initial").textContent = session.name.charAt(0).toUpperCase();
    if ($("checkout-name")) $("checkout-name").value = session.name;
  } else {
    navAuthBtn.style.display = "block";
    navUserMenu.style.display = "none";
    $("user-dropdown-menu").classList.remove("open");
  }
}

function toggleAuthModal(open, mode = "login") {
  $("auth-modal-backdrop").classList.toggle("open", open);
  if (open) switchAuthTab(mode);
  setAuthAlert("");
}

function switchAuthTab(mode) {
  setAuthAlert("");
  const isLogin = mode === "login";
  $("tab-login-btn").classList.toggle("active", isLogin);
  $("tab-signup-btn").classList.toggle("active", !isLogin);
  $("form-login").style.display = isLogin ? "block" : "none";
  $("form-signup").style.display = isLogin ? "none" : "block";
}

function setAuthAlert(msg, type = "error") {
  const alert = $("auth-form-alert");
  if (!msg) {
    alert.style.display = "none";
    alert.textContent = "";
    alert.className = "form-alert";
    return;
  }
  alert.style.display = "block";
  alert.className = `form-alert ${type}`;
  alert.textContent = msg;
}

/* ==========================================================================
   LANDING PAGE RENDERING
   ========================================================================== */
function renderLandingCategories() {
  $("landing-categories-carousel").innerHTML = CATEGORIES
    .filter(c => c.id !== "all")
    .map(c => `
      <div class="category-pill" data-category="${c.id}">
        <span class="cat-icon">${c.icon}</span>
        <span class="cat-name">${c.name}</span>
      </div>
    `).join("");
}

function renderLandingFeatured() {
  const featured = RESTAURANTS.filter(r => r.featured);
  $("landing-featured-grid").innerHTML = featured.map(createRestaurantCardHTML).join("");
}

/* ==========================================================================
   EXPLORE PAGE RENDERING & FILTERS
   ========================================================================== */
function renderExploreCategories() {
  $("explore-category-chips").innerHTML = CATEGORIES.map(c => `
    <button class="filter-chip ${c.id === state.activeCategory ? "active" : ""}" data-cat-chip="${c.id}">
      <span>${c.icon}</span>
      <span>${c.name}</span>
    </button>
  `).join("");
}

function filterAndSortRestaurants() {
  let list = [...RESTAURANTS];

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.cuisine.some(c => c.toLowerCase().includes(q)) ||
      r.menu.some(m => m.name.toLowerCase().includes(q))
    );
  }

  if (state.activeCategory !== "all") {
    list = list.filter(r =>
      r.cuisine.some(c => c.toLowerCase().replace(/\s+/g, "-") === state.activeCategory) ||
      r.menu.some(m => m.category === state.activeCategory)
    );
  }

  if (state.filterVegOnly) {
    list = list.filter(r => r.menu.some(m => m.isVeg));
  }
  if (state.filterHighRating) {
    list = list.filter(r => r.rating >= 4.5);
  }
  if (state.filterFastDelivery) {
    list = list.filter(r => r.deliveryTimeMinutes <= 25);
  }

  if (state.sortOption === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  } else if (state.sortOption === "deliveryTime") {
    list.sort((a, b) => a.deliveryTimeMinutes - b.deliveryTimeMinutes);
  } else if (state.sortOption === "costAsc") {
    list.sort((a, b) => a.costNumeric - b.costNumeric);
  }

  return list;
}

function renderExploreRestaurants() {
  const filtered = filterAndSortRestaurants();
  const grid = $("explore-restaurants-grid");
  const empty = $("explore-empty-state");
  const count = $("explore-results-count");

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.style.display = "block";
    count.textContent = "0 restaurants found";
  } else {
    empty.style.display = "none";
    count.textContent = `Showing ${filtered.length} restaurant${filtered.length > 1 ? "s" : ""} in Delhi NCR`;
    grid.innerHTML = filtered.map(createRestaurantCardHTML).join("");
  }
}

function createRestaurantCardHTML(r) {
  return `
    <div class="restaurant-card" data-restaurant-id="${r.id}">
      <div class="rest-img-wrapper">
        <img 
          src="${r.image}" 
          alt="${escapeHtml(r.name)}" 
          class="rest-img" 
          loading="lazy"
          onerror="this.onerror=null;this.src='${FALLBACK_FOOD_IMG}'"
        >
        ${r.discountBadge ? `
          <div class="rest-discount-badge">
            <span>🏷️</span>
            <span>${escapeHtml(r.discountBadge)}</span>
          </div>
        ` : ""}
      </div>
      <div class="rest-info">
        <div class="rest-title-row">
          <h3 class="rest-name">${escapeHtml(r.name)}</h3>
          <span class="rating-badge">★ ${r.rating}</span>
        </div>
        <p class="rest-cuisines">${r.cuisine.join(", ")}</p>
        <div class="rest-meta">
          <span class="rest-meta-item">⏱️ ${r.deliveryTime}</span>
          <span class="rest-meta-item">💳 ${r.priceForTwo}</span>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   RESTAURANT DETAILS & MENU RENDERING
   ========================================================================== */
function renderRestaurantDetail(restaurantId) {
  const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
  if (!restaurant) {
    showToast("Restaurant not found.");
    window.location.hash = "#explore";
    return;
  }

  $("restaurant-header-card").innerHTML = `
    <div class="rest-header-details">
      <h1>${escapeHtml(restaurant.name)}</h1>
      <p class="rest-header-cuisines">${restaurant.cuisine.join(", ")}</p>
      <p class="rest-header-address">📍 ${escapeHtml(restaurant.address)}</p>
      <div class="rest-header-pills">
        <div class="header-stat-pill">⏱️ ${restaurant.deliveryTime}</div>
        <div class="header-stat-pill">💳 ${restaurant.priceForTwo}</div>
        ${restaurant.discountBadge ? `<div class="header-stat-pill" style="color: var(--primary);">🏷️ ${escapeHtml(restaurant.discountBadge)}</div>` : ""}
      </div>
    </div>
    <div class="rest-rating-box">
      <div class="rest-rating-number">★ ${restaurant.rating}</div>
      <div class="rest-rating-sub">${restaurant.ratingCount} reviews</div>
    </div>
  `;

  renderRestaurantMenu();
}

function renderRestaurantMenu() {
  const restaurant = RESTAURANTS.find(r => r.id === state.activeRestaurantId);
  if (!restaurant) return;

  const cart = getCart();
  let menu = [...restaurant.menu];

  if (state.menuVegOnly) menu = menu.filter(m => m.isVeg);
  if (state.menuSearchQuery.trim()) {
    const q = state.menuSearchQuery.toLowerCase().trim();
    menu = menu.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }

  const list = $("menu-items-list");
  if (menu.length === 0) {
    list.innerHTML = `
      <div class="empty-state" style="margin: 20px 0;">
        <div class="empty-icon">🥗</div>
        <h3 class="empty-title">No dishes found</h3>
        <p class="empty-subtitle">No menu items match your search or dietary filter.</p>
      </div>
    `;
    return;
  }

  const isCartFromThisRest = cart.restaurantId === restaurant.id;

  list.innerHTML = menu.map(item => {
    const cartItem = isCartFromThisRest ? cart.items.find(i => i.id === item.id) : null;
    const qty = cartItem ? cartItem.qty : 0;

    return `
      <div class="menu-item-card" data-dish-id="${item.id}">
        <div>
          <div>
            <span class="diet-badge ${item.isVeg ? "veg" : "non-veg"}" title="${item.isVeg ? "Vegetarian" : "Non-Vegetarian"}"></span>
            ${item.bestseller ? `<span class="bestseller-tag">★ Bestseller</span>` : ""}
          </div>
          <h3 class="item-name">${escapeHtml(item.name)}</h3>
          <div class="item-price">₹${item.price}</div>
          <p class="item-desc">${escapeHtml(item.description)}</p>
        </div>
        
        <div class="item-media-action">
          <img 
            src="${item.image}" 
            alt="${escapeHtml(item.name)}" 
            class="item-img" 
            loading="lazy"
            onerror="this.onerror=null;this.src='${FALLBACK_FOOD_IMG}'"
          >
          <div class="add-btn-wrapper">
            ${qty > 0 ? `
              <div class="qty-stepper">
                <button class="qty-btn" data-action="decrease-menu" data-item-id="${item.id}">−</button>
                <span class="qty-val">${qty}</span>
                <button class="qty-btn" data-action="increase-menu" data-item-id="${item.id}">+</button>
              </div>
            ` : `
              <button class="btn-add-item" data-action="add-menu" data-item-id="${item.id}">+ ADD</button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ==========================================================================
   CART OPERATIONS & DRAWER
   ========================================================================== */
function updateCartBadge() {
  $("header-cart-badge").textContent = getCartTotals().itemCount;
}

function toggleCartDrawer(open) {
  if (open) renderCartDrawer();
  $("cart-drawer-backdrop").classList.toggle("open", open);
  $("cart-drawer").classList.toggle("open", open);
}

function renderBillDetailsHTML(totals) {
  return `
    <div class="bill-row">
      <span>Item Subtotal</span>
      <span>₹${totals.subtotal}</span>
    </div>
    <div class="bill-row">
      <span>Delivery Partner Fee</span>
      <span>${totals.deliveryFee === 0 ? `<span class="free-tag">FREE</span>` : `₹${totals.deliveryFee}`}</span>
    </div>
    <div class="bill-row">
      <span>Platform Fee</span>
      <span>₹${totals.platformFee}</span>
    </div>
    <div class="bill-row">
      <span>Government Taxes & GST (5%)</span>
      <span>₹${totals.gst}</span>
    </div>
    <div class="bill-row total">
      <span>To Pay</span>
      <span>₹${totals.grandTotal}</span>
    </div>
  `;
}

function renderCartDrawer() {
  const cart = getCart();
  const totals = getCartTotals();
  const body = $("cart-drawer-body");
  const checkoutBtn = $("btn-drawer-checkout");

  $("drawer-total-amount").textContent = `₹${totals.grandTotal}`;

  if (!cart.items || cart.items.length === 0) {
    body.innerHTML = `
      <div class="empty-state" style="border: none; padding: 40px 10px;">
        <div class="empty-icon">🛒</div>
        <h3 class="empty-title">Your cart is empty</h3>
        <p class="empty-subtitle">Good food is always just around the corner. Add your favorite dishes from our menus!</p>
        <button class="btn-primary" id="btn-cart-browse">Browse Restaurants</button>
      </div>
    `;
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = "0.5";
    checkoutBtn.style.cursor = "not-allowed";
    return;
  }

  checkoutBtn.disabled = false;
  checkoutBtn.style.opacity = "1";
  checkoutBtn.style.cursor = "pointer";

  const itemsHTML = cart.items.map(item => `
    <div class="cart-item-row" data-cart-row-id="${item.id}">
      <span class="diet-badge ${item.isVeg ? "veg" : "non-veg"}"></span>
      <div class="cart-item-title-grp">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-price">₹${item.price} each</div>
      </div>
      <div class="qty-stepper">
        <button class="qty-btn" data-cart-action="decrease" data-cart-id="${item.id}">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" data-cart-action="increase" data-cart-id="${item.id}">+</button>
      </div>
      <div style="font-weight: 800; font-size: 0.95rem; min-width: 50px; text-align: right;">
        ₹${item.price * item.qty}
      </div>
    </div>
  `).join("");

  const freeDeliveryMsg = totals.subtotal < 400
    ? `<div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.82rem; color: #1E40AF; margin-bottom: 16px;">
        💡 Add items worth <strong>₹${400 - totals.subtotal}</strong> more for <strong>FREE Delivery!</strong>
       </div>`
    : `<div style="background: var(--veg-bg); border: 1px solid #BBF7D0; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.82rem; color: var(--veg-green); margin-bottom: 16px;">
        🎉 You've unlocked <strong>FREE Delivery!</strong>
       </div>`;

  body.innerHTML = `
    <div class="cart-restaurant-banner">
      <div>
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Ordering from</div>
        <div class="cart-rest-name">${escapeHtml(cart.restaurantName)}</div>
      </div>
      <button class="btn-clear-cart" id="btn-clear-cart-action">Clear Cart</button>
    </div>
    <div class="cart-items-list">${itemsHTML}</div>
    ${freeDeliveryMsg}
    <div class="cart-bill-details">${renderBillDetailsHTML(totals)}</div>
  `;
}

function handleAddToCartRequest(restaurant, item) {
  const result = addToCart(restaurant, item);

  if (result.conflict) {
    state.pendingConflictItem = { restaurant, item };
    $("conflict-modal-msg").innerHTML = `
      Your cart contains delicious food from <strong>${escapeHtml(result.existingRestaurant)}</strong>.<br><br>
      Would you like to discard those and start a fresh order from <strong>${escapeHtml(result.newRestaurant)}</strong>?
    `;
    $("conflict-modal-backdrop").classList.add("open");
  } else {
    showToast(`Added "${item.name}" to cart!`, "🛒");
  }
}

/* ==========================================================================
   CHECKOUT RENDERING & ORDER SUBMISSION
   ========================================================================== */
function renderCheckout() {
  const cart = getCart();
  const totals = getCartTotals();
  const session = getSession();

  if (session && $("checkout-name")) $("checkout-name").value = session.name;

  $("checkout-items-summary").innerHTML = `
    <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 12px; color: var(--primary);">
      From: ${escapeHtml(cart.restaurantName)} (${totals.itemCount} items)
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      ${cart.items.map(item => `
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
          <span>${item.qty} × ${escapeHtml(item.name)}</span>
          <span style="font-weight: 700;">₹${item.price * item.qty}</span>
        </div>
      `).join("")}
    </div>
  `;

  $("checkout-bill-breakdown").innerHTML = renderBillDetailsHTML(totals);
}

function handlePlaceOrder() {
  if (!getSession()) {
    showToast("Please sign in to place your order.");
    toggleAuthModal(true, "login");
    return;
  }

  const name = $("checkout-name").value.trim();
  const phone = $("checkout-phone").value.trim();
  const address = $("checkout-address").value.trim();

  if (!name || !phone || !address) {
    showToast("Please fill in all delivery details.");
    return;
  }

  const paymentMethodInput = document.querySelector('input[name="payment-method"]:checked');
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : "Cash on Delivery";

  const result = placeOrder({ name, phone, address, paymentMethod });
  if (result.success) {
    renderConfirmation(result.order);
    window.location.hash = "#confirmation";
    showToast("Order placed successfully! 🎉");
  } else {
    showToast(result.message || "Failed to place order.");
  }
}

/* ==========================================================================
   CONFIRMATION SCREEN RENDERING
   ========================================================================== */
function renderConfirmation(order) {
  $("confirmation-container").innerHTML = `
    <div class="success-badge-anim">✓</div>
    <h1 class="confirmation-title">Order Placed Successfully!</h1>
    <p class="confirmation-subtitle">
      Thank you for ordering with EatUp! Your meal from <strong>${escapeHtml(order.restaurantName)}</strong> is being prepared fresh.
    </p>

    <div class="order-receipt-box">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 10px; margin-bottom: 12px;">
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">ORDER ID</div>
          <div style="font-weight: 800; font-size: 1.1rem; color: var(--primary);">${order.orderId}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700;">ESTIMATED ARRIVAL</div>
          <div style="font-weight: 800; font-size: 1.1rem; color: var(--star-green);">30-35 mins</div>
        </div>
      </div>

      <div style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 12px;">
        <strong>Delivering to:</strong> ${escapeHtml(order.deliveryAddress)}
      </div>

      <div style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 14px;">
        <strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod)}
      </div>

      <div style="border-top: 1px dashed var(--border-light); padding-top: 10px;">
        <div style="font-weight: 700; font-size: 0.9rem; margin-bottom: 6px;">Items Ordered:</div>
        ${order.items.map(i => `
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
            <span>${i.qty} × ${escapeHtml(i.name)}</span>
            <span style="font-weight: 700;">₹${i.price * i.qty}</span>
          </div>
        `).join("")}
        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 1rem; border-top: 1px solid var(--border-light); padding-top: 8px; margin-top: 8px;">
          <span>Total Paid</span>
          <span>₹${order.totals.grandTotal}</span>
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
      <a href="#orders" class="btn-primary">View in My Orders</a>
      <a href="#explore" class="btn-outline">Order Something Else</a>
    </div>
  `;
}

/* ==========================================================================
   MY ORDERS VIEW
   ========================================================================== */
function renderOrders() {
  const container = $("orders-list-container");
  const empty = $("orders-empty-state");

  if (!getSession()) {
    container.innerHTML = `
      <div class="empty-state" style="max-width: 600px; margin: 40px auto;">
        <div class="empty-icon">🔐</div>
        <h3 class="empty-title">Please Sign In</h3>
        <p class="empty-subtitle">You must be signed in to view your order history.</p>
        <button class="btn-primary" id="btn-orders-login">Sign In Now</button>
      </div>
    `;
    empty.style.display = "none";
    $("btn-orders-login")?.addEventListener("click", () => toggleAuthModal(true, "login"));
    return;
  }

  const orders = getOrders();
  if (orders.length === 0) {
    container.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  container.innerHTML = orders.map(o => {
    const dateFormatted = new Date(o.createdAt).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });
    const itemsSummary = o.items.map(i => `${i.qty}x ${escapeHtml(i.name)}`).join(", ");

    return `
      <div class="order-history-card">
        <div class="order-card-header">
          <div>
            <span class="order-id-badge">Order #${o.orderId}</span>
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 10px;">${dateFormatted}</span>
          </div>
          <span class="order-status-pill">${o.status}</span>
        </div>

        <div style="font-weight: 800; font-size: 1.15rem; margin-bottom: 6px;">
          ${escapeHtml(o.restaurantName)}
        </div>

        <div class="order-items-snippet">${itemsSummary}</div>

        <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
          📍 Delivered to: ${escapeHtml(o.deliveryAddress)}
        </div>

        <div class="order-card-footer">
          <div class="order-total-amount">Total Paid: ₹${o.totals.grandTotal}</div>
          <button class="btn-outline" data-reorder-id="${o.orderId}" style="font-size: 0.85rem; padding: 6px 16px;">
            Reorder Dishes
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function handleReorder(orderId) {
  const order = getOrders().find(o => o.orderId === orderId);
  if (!order) return;

  const restaurant = RESTAURANTS.find(r => r.id === order.restaurantId);
  if (!restaurant) {
    showToast("Restaurant no longer available.");
    return;
  }

  clearCart();
  order.items.forEach(item => {
    addToCart(restaurant, item);
    if (item.qty > 1) updateCartItemQty(item.id, item.qty - 1);
  });

  showToast(`Loaded ${order.items.length} items from ${restaurant.name} into cart!`, "🛍️");
  toggleCartDrawer(true);
}

/* ==========================================================================
   EVENT LISTENERS SETUP
   ========================================================================== */
function setupEventListeners() {
  // Navigation & Drawer
  $("nav-cart-btn").addEventListener("click", () => toggleCartDrawer(true));
  $("cart-drawer-close").addEventListener("click", () => toggleCartDrawer(false));
  $("cart-drawer-backdrop").addEventListener("click", () => toggleCartDrawer(false));

  // User Profile Dropdown
  $("user-badge-trigger")?.addEventListener("click", (e) => {
    e.stopPropagation();
    $("user-dropdown-menu").classList.toggle("open");
  });

  document.addEventListener("click", () => {
    $("user-dropdown-menu")?.classList.remove("open");
  });

  $("user-menu-logout").addEventListener("click", () => {
    clearSession();
    updateAuthUI();
    showToast("Signed out successfully.");
    window.location.hash = "#landing";
  });

  // Auth Modal
  $("nav-auth-btn").addEventListener("click", () => toggleAuthModal(true, "login"));
  $("auth-modal-close").addEventListener("click", () => toggleAuthModal(false));
  $("auth-modal-backdrop").addEventListener("click", (e) => {
    if (e.target === $("auth-modal-backdrop")) toggleAuthModal(false);
  });

  $("tab-login-btn").addEventListener("click", () => switchAuthTab("login"));
  $("tab-signup-btn").addEventListener("click", () => switchAuthTab("signup"));

  $("btn-demo-login-fill").addEventListener("click", () => {
    const creds = getDemoCredentials();
    $("login-email").value = creds.email;
    $("login-password").value = creds.password;
    setAuthAlert("Demo credentials filled! Click 'Sign In' below.", "success");
  });

  $("form-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const result = loginUser($("login-email").value.trim(), $("login-password").value);
    if (result.success) {
      updateAuthUI();
      toggleAuthModal(false);
      showToast(`Welcome back, ${result.session.name}! 👋`);
    } else {
      setAuthAlert(result.message, "error");
    }
  });

  $("form-signup").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("signup-name").value.trim();
    const email = $("signup-email").value.trim();
    const password = $("signup-password").value;
    const result = registerUser(name, email, password);

    if (result.success) {
      loginUser(email, password);
      updateAuthUI();
      toggleAuthModal(false);
      showToast(`Account created! Welcome to EatUp, ${name}! 🎉`);
    } else {
      setAuthAlert(result.message, "error");
    }
  });

  // Hero Search
  const performHeroSearch = () => {
    const q = $("hero-search-input").value.trim();
    state.searchQuery = q;
    $("explore-search-input").value = q;
    window.location.hash = "#explore";
  };
  $("hero-search-btn").addEventListener("click", performHeroSearch);
  $("hero-search-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") performHeroSearch();
  });

  // Category Carousel Clicks (Landing)
  $("landing-categories-carousel").addEventListener("click", (e) => {
    const card = e.target.closest(".category-pill");
    if (!card) return;
    state.activeCategory = card.dataset.category;
    renderExploreCategories();
    window.location.hash = "#explore";
  });

  // Explore Filter Controls
  $("explore-search-input").addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderExploreRestaurants();
  });

  const toggleFilter = (btnId, stateProp) => {
    state[stateProp] = !state[stateProp];
    $(btnId).classList.toggle("active", state[stateProp]);
    renderExploreRestaurants();
  };

  $("filter-veg-btn").addEventListener("click", () => toggleFilter("filter-veg-btn", "filterVegOnly"));
  $("filter-rating-btn").addEventListener("click", () => toggleFilter("filter-rating-btn", "filterHighRating"));
  $("filter-fast-btn").addEventListener("click", () => toggleFilter("filter-fast-btn", "filterFastDelivery"));

  $("sort-select").addEventListener("change", (e) => {
    state.sortOption = e.target.value;
    renderExploreRestaurants();
  });

  $("explore-category-chips").addEventListener("click", (e) => {
    const chip = e.target.closest("[data-cat-chip]");
    if (!chip) return;
    state.activeCategory = chip.dataset.catChip;
    renderExploreCategories();
    renderExploreRestaurants();
  });

  $("btn-reset-filters").addEventListener("click", () => {
    state.searchQuery = "";
    state.activeCategory = "all";
    state.filterVegOnly = false;
    state.filterHighRating = false;
    state.filterFastDelivery = false;
    state.sortOption = "relevance";

    $("explore-search-input").value = "";
    $("filter-veg-btn").classList.remove("active");
    $("filter-rating-btn").classList.remove("active");
    $("filter-fast-btn").classList.remove("active");
    $("sort-select").value = "relevance";

    renderExploreCategories();
    renderExploreRestaurants();
  });

  // Restaurant Card Clicks
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".restaurant-card");
    if (card && card.dataset.restaurantId) {
      window.location.hash = `#restaurant/${card.dataset.restaurantId}`;
    }
  });

  // Restaurant Menu Controls
  $("rest-back-btn").addEventListener("click", () => {
    window.location.hash = "#explore";
  });

  $("menu-veg-filter").addEventListener("click", () => {
    state.menuVegOnly = true;
    $("menu-veg-filter").classList.add("active");
    $("menu-all-filter").classList.remove("active");
    renderRestaurantMenu();
  });

  $("menu-all-filter").addEventListener("click", () => {
    state.menuVegOnly = false;
    $("menu-all-filter").classList.add("active");
    $("menu-veg-filter").classList.remove("active");
    renderRestaurantMenu();
  });

  $("menu-search-input").addEventListener("input", (e) => {
    state.menuSearchQuery = e.target.value;
    renderRestaurantMenu();
  });

  // Menu Add & Stepper clicks
  $("menu-items-list").addEventListener("click", (e) => {
    const addBtn = e.target.closest('[data-action="add-menu"]');
    const incBtn = e.target.closest('[data-action="increase-menu"]');
    const decBtn = e.target.closest('[data-action="decrease-menu"]');

    const restaurant = RESTAURANTS.find(r => r.id === state.activeRestaurantId);
    if (!restaurant) return;

    if (addBtn) {
      const dish = restaurant.menu.find(m => m.id === addBtn.dataset.itemId);
      if (dish) handleAddToCartRequest(restaurant, dish);
    } else if (incBtn) {
      updateCartItemQty(incBtn.dataset.itemId, 1);
    } else if (decBtn) {
      updateCartItemQty(decBtn.dataset.itemId, -1);
    }
  });

  // Cart Drawer Item Actions
  $("cart-drawer-body").addEventListener("click", (e) => {
    const incBtn = e.target.closest('[data-cart-action="increase"]');
    const decBtn = e.target.closest('[data-cart-action="decrease"]');
    const clearBtn = e.target.closest("#btn-clear-cart-action");
    const browseBtn = e.target.closest("#btn-cart-browse");

    if (incBtn) {
      updateCartItemQty(incBtn.dataset.cartId, 1);
    } else if (decBtn) {
      updateCartItemQty(decBtn.dataset.cartId, -1);
    } else if (clearBtn) {
      clearCart();
      showToast("Cart cleared.");
    } else if (browseBtn) {
      toggleCartDrawer(false);
      window.location.hash = "#explore";
    }
  });

  // Proceed to Checkout
  $("btn-drawer-checkout").addEventListener("click", () => {
    const cart = getCart();
    if (!cart.items || cart.items.length === 0) return;

    toggleCartDrawer(false);
    if (!getSession()) {
      showToast("Please sign in to proceed with checkout.");
      toggleAuthModal(true, "login");
      return;
    }
    window.location.hash = "#checkout";
  });

  // Checkout Actions
  $("checkout-back-btn").addEventListener("click", () => {
    window.location.hash = state.activeRestaurantId ? `#restaurant/${state.activeRestaurantId}` : "#explore";
  });

  $("btn-confirm-place-order").addEventListener("click", handlePlaceOrder);

  // Orders Reorder
  $("orders-list-container").addEventListener("click", (e) => {
    const reorderBtn = e.target.closest("[data-reorder-id]");
    if (reorderBtn) handleReorder(reorderBtn.dataset.reorderId);
  });

  // Conflict Modal
  $("conflict-btn-cancel").addEventListener("click", () => {
    state.pendingConflictItem = null;
    $("conflict-modal-backdrop").classList.remove("open");
  });

  $("conflict-btn-confirm").addEventListener("click", () => {
    if (state.pendingConflictItem) {
      clearCart();
      const { restaurant, item } = state.pendingConflictItem;
      addToCart(restaurant, item);
      state.pendingConflictItem = null;
      $("conflict-modal-backdrop").classList.remove("open");
      showToast(`Fresh cart started from ${restaurant.name}!`, "🥘");
    }
  });
}

// Start Application
document.addEventListener("DOMContentLoaded", init);
