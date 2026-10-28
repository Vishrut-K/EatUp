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
  pendingConflictItem: null // Temp item during restaurant conflict prompt
};

/* ==========================================================================
   DOM ELEMENTS
   ========================================================================== */
const el = {
  header: document.getElementById("app-header"),
  navLinks: {
    home: document.getElementById("nav-link-home"),
    explore: document.getElementById("nav-link-explore"),
    orders: document.getElementById("nav-link-orders")
  },
  headerCartBadge: document.getElementById("header-cart-badge"),
  navCartBtn: document.getElementById("nav-cart-btn"),
  navAuthBtn: document.getElementById("nav-auth-btn"),
  navUserMenu: document.getElementById("nav-user-menu"),
  userDisplayName: document.getElementById("user-display-name"),
  userAvatarInitial: document.getElementById("user-avatar-initial"),
  userBadgeTrigger: document.getElementById("user-badge-trigger"),
  userDropdownMenu: document.getElementById("user-dropdown-menu"),
  userMenuLogout: document.getElementById("user-menu-logout"),

  // Views
  views: {
    landing: document.getElementById("view-landing"),
    explore: document.getElementById("view-explore"),
    restaurant: document.getElementById("view-restaurant"),
    checkout: document.getElementById("view-checkout"),
    confirmation: document.getElementById("view-confirmation"),
    orders: document.getElementById("view-orders")
  },

  // Landing View Elements
  heroSearchInput: document.getElementById("hero-search-input"),
  heroSearchBtn: document.getElementById("hero-search-btn"),
  landingCategoriesCarousel: document.getElementById("landing-categories-carousel"),
  landingFeaturedGrid: document.getElementById("landing-featured-grid"),

  // Explore View Elements
  exploreSearchInput: document.getElementById("explore-search-input"),
  filterVegBtn: document.getElementById("filter-veg-btn"),
  filterRatingBtn: document.getElementById("filter-rating-btn"),
  filterFastBtn: document.getElementById("filter-fast-btn"),
  sortSelect: document.getElementById("sort-select"),
  exploreCategoryChips: document.getElementById("explore-category-chips"),
  exploreResultsCount: document.getElementById("explore-results-count"),
  exploreRestaurantsGrid: document.getElementById("explore-restaurants-grid"),
  exploreEmptyState: document.getElementById("explore-empty-state"),
  btnResetFilters: document.getElementById("btn-reset-filters"),

  // Restaurant Menu Elements
  restBackBtn: document.getElementById("rest-back-btn"),
  restaurantHeaderCard: document.getElementById("restaurant-header-card"),
  menuVegFilter: document.getElementById("menu-veg-filter"),
  menuAllFilter: document.getElementById("menu-all-filter"),
  menuSearchInput: document.getElementById("menu-search-input"),
  menuItemsList: document.getElementById("menu-items-list"),

  // Cart Drawer Elements
  cartDrawerBackdrop: document.getElementById("cart-drawer-backdrop"),
  cartDrawer: document.getElementById("cart-drawer"),
  cartDrawerClose: document.getElementById("cart-drawer-close"),
  cartDrawerBody: document.getElementById("cart-drawer-body"),
  btnDrawerCheckout: document.getElementById("btn-drawer-checkout"),
  drawerTotalAmount: document.getElementById("drawer-total-amount"),

  // Checkout View Elements
  checkoutBackBtn: document.getElementById("checkout-back-btn"),
  checkoutForm: document.getElementById("checkout-form"),
  checkoutName: document.getElementById("checkout-name"),
  checkoutPhone: document.getElementById("checkout-phone"),
  checkoutAddress: document.getElementById("checkout-address"),
  checkoutItemsSummary: document.getElementById("checkout-items-summary"),
  checkoutBillBreakdown: document.getElementById("checkout-bill-breakdown"),
  btnConfirmPlaceOrder: document.getElementById("btn-confirm-place-order"),

  // Confirmation View Elements
  confirmationContainer: document.getElementById("confirmation-container"),

  // Orders View Elements
  ordersListContainer: document.getElementById("orders-list-container"),
  ordersEmptyState: document.getElementById("orders-empty-state"),

  // Modals
  authModalBackdrop: document.getElementById("auth-modal-backdrop"),
  authModalClose: document.getElementById("auth-modal-close"),
  tabLoginBtn: document.getElementById("tab-login-btn"),
  tabSignupBtn: document.getElementById("tab-signup-btn"),
  btnDemoLoginFill: document.getElementById("btn-demo-login-fill"),
  authFormAlert: document.getElementById("auth-form-alert"),
  formLogin: document.getElementById("form-login"),
  loginEmail: document.getElementById("login-email"),
  loginPassword: document.getElementById("login-password"),
  formSignup: document.getElementById("form-signup"),
  signupName: document.getElementById("signup-name"),
  signupEmail: document.getElementById("signup-email"),
  signupPassword: document.getElementById("signup-password"),

  conflictModalBackdrop: document.getElementById("conflict-modal-backdrop"),
  conflictModalMsg: document.getElementById("conflict-modal-msg"),
  conflictBtnCancel: document.getElementById("conflict-btn-cancel"),
  conflictBtnConfirm: document.getElementById("conflict-btn-confirm"),

  toastContainer: document.getElementById("toast-container")
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
function init() {
  initStorage();
  updateAuthUI();
  updateCartBadge();
  setupEventListeners();

  // Populate static-driven containers
  renderLandingCategories();
  renderLandingFeatured();
  renderExploreCategories();

  // Handle URL hash routing
  handleRouting();
  window.addEventListener("hashchange", handleRouting);

  // Sync cart badge when storage updates
  window.addEventListener("eatup-cart-updated", () => {
    updateCartBadge();
    // If cart drawer is open, refresh its content
    if (el.cartDrawer.classList.contains("open")) {
      renderCartDrawer();
    }
    // If currently looking at restaurant menu, re-render quantities
    if (state.currentView === "restaurant") {
      renderRestaurantMenu();
    }
  });

  // Scroll header styling
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      el.header.classList.add("scrolled");
    } else {
      el.header.classList.remove("scrolled");
    }
  });
}

/* ==========================================================================
   ROUTING & VIEW SWITCHING
   ========================================================================== */
function handleRouting() {
  const hash = window.location.hash || "#landing";
  const [route, param] = hash.split("/");

  // Deactivate all views
  Object.values(el.views).forEach(v => v.classList.remove("active"));
  Object.values(el.navLinks).forEach(l => l.classList.remove("active"));

  if (route === "#explore") {
    state.currentView = "explore";
    el.views.explore.classList.add("active");
    el.navLinks.explore.classList.add("active");
    renderExploreRestaurants();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (route === "#restaurant" && param) {
    state.currentView = "restaurant";
    state.activeRestaurantId = param;
    el.views.restaurant.classList.add("active");
    renderRestaurantDetail(param);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (route === "#checkout") {
    const cart = getCart();
    if (!cart.items || cart.items.length === 0) {
      showToast("Your cart is empty! Add items first.");
      window.location.hash = "#explore";
      return;
    }
    state.currentView = "checkout";
    el.views.checkout.classList.add("active");
    renderCheckout();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (route === "#orders") {
    state.currentView = "orders";
    el.views.orders.classList.add("active");
    el.navLinks.orders.classList.add("active");
    renderOrders();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (route === "#confirmation") {
    state.currentView = "confirmation";
    el.views.confirmation.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    // Default to Landing view
    state.currentView = "landing";
    el.views.landing.classList.add("active");
    el.navLinks.home.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
export function showToast(message, icon = "✨") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;
  el.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
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
   AUTHENTICATION UI & LOGIC
   ========================================================================== */
function updateAuthUI() {
  const session = getSession();
  if (session) {
    el.navAuthBtn.style.display = "none";
    el.navUserMenu.style.display = "block";
    el.userDisplayName.textContent = session.name.split(" ")[0];
    el.userAvatarInitial.textContent = session.name.charAt(0).toUpperCase();
    if (el.checkoutName) el.checkoutName.value = session.name;
  } else {
    el.navAuthBtn.style.display = "block";
    el.navUserMenu.style.display = "none";
    el.userDropdownMenu.classList.remove("open");
  }
}

function openAuthModal(mode = "login") {
  el.authModalBackdrop.classList.add("open");
  switchAuthTab(mode);
}

function closeAuthModal() {
  el.authModalBackdrop.classList.remove("open");
  setAuthAlert("", "");
}

function switchAuthTab(mode) {
  setAuthAlert("", "");
  if (mode === "login") {
    el.tabLoginBtn.classList.add("active");
    el.tabSignupBtn.classList.remove("active");
    el.formLogin.style.display = "block";
    el.formSignup.style.display = "none";
  } else {
    el.tabLoginBtn.classList.remove("active");
    el.tabSignupBtn.classList.add("active");
    el.formLogin.style.display = "none";
    el.formSignup.style.display = "block";
  }
}

function setAuthAlert(msg, type = "error") {
  if (!msg) {
    el.authFormAlert.style.display = "none";
    el.authFormAlert.textContent = "";
    el.authFormAlert.className = "form-alert";
    return;
  }
  el.authFormAlert.style.display = "block";
  el.authFormAlert.className = `form-alert ${type}`;
  el.authFormAlert.textContent = msg;
}

/* ==========================================================================
   LANDING PAGE RENDERING
   ========================================================================== */
function renderLandingCategories() {
  el.landingCategoriesCarousel.innerHTML = CATEGORIES.filter(c => c.id !== "all").map(c => `
    <div class="category-pill" data-category="${c.id}">
      <span class="cat-icon">${c.icon}</span>
      <span class="cat-name">${c.name}</span>
    </div>
  `).join("");
}

function renderLandingFeatured() {
  const featured = RESTAURANTS.filter(r => r.featured);
  el.landingFeaturedGrid.innerHTML = featured.map(r => createRestaurantCardHTML(r)).join("");
}

/* ==========================================================================
   EXPLORE PAGE RENDERING & FILTERS
   ========================================================================== */
function renderExploreCategories() {
  el.exploreCategoryChips.innerHTML = CATEGORIES.map(c => `
    <button class="filter-chip ${c.id === state.activeCategory ? "active" : ""}" data-cat-chip="${c.id}">
      <span>${c.icon}</span>
      <span>${c.name}</span>
    </button>
  `).join("");
}

function filterAndSortRestaurants() {
  let list = [...RESTAURANTS];

  // 1. Text Search Filter (name, cuisines, or matching dish in menu)
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(r => {
      const matchName = r.name.toLowerCase().includes(q);
      const matchCuisine = r.cuisine.some(c => c.toLowerCase().includes(q));
      const matchMenu = r.menu.some(m => m.name.toLowerCase().includes(q));
      return matchName || matchCuisine || matchMenu;
    });
  }

  // 2. Category Filter
  if (state.activeCategory !== "all") {
    list = list.filter(r => {
      // Check if cuisine matches category OR if restaurant has dishes in this category
      const matchCuisine = r.cuisine.some(c => c.toLowerCase().replace(/\s+/g, "-") === state.activeCategory);
      const matchDish = r.menu.some(m => m.category === state.activeCategory);
      return matchCuisine || matchDish;
    });
  }

  // 3. Pure Veg Filter (restaurant has at least 1 veg item or only veg)
  if (state.filterVegOnly) {
    list = list.filter(r => r.menu.some(m => m.isVeg));
  }

  // 4. Rating 4.5+ Filter
  if (state.filterHighRating) {
    list = list.filter(r => r.rating >= 4.5);
  }

  // 5. Fast Delivery Filter (< 25 min)
  if (state.filterFastDelivery) {
    list = list.filter(r => r.deliveryTimeMinutes <= 25);
  }

  // 6. Sort
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

  if (filtered.length === 0) {
    el.exploreRestaurantsGrid.innerHTML = "";
    el.exploreEmptyState.style.display = "block";
    el.exploreResultsCount.textContent = "0 restaurants found";
  } else {
    el.exploreEmptyState.style.display = "none";
    el.exploreResultsCount.textContent = `Showing ${filtered.length} restaurant${filtered.length > 1 ? "s" : ""} in Bengaluru`;
    el.exploreRestaurantsGrid.innerHTML = filtered.map(r => createRestaurantCardHTML(r)).join("");
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

  // Header Banner
  el.restaurantHeaderCard.innerHTML = `
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

  // Veg filter
  if (state.menuVegOnly) {
    menu = menu.filter(m => m.isVeg);
  }

  // Menu Search
  if (state.menuSearchQuery.trim()) {
    const q = state.menuSearchQuery.toLowerCase().trim();
    menu = menu.filter(m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }

  if (menu.length === 0) {
    el.menuItemsList.innerHTML = `
      <div class="empty-state" style="margin: 20px 0;">
        <div class="empty-icon">🥗</div>
        <h3 class="empty-title">No dishes found</h3>
        <p class="empty-subtitle">No menu items match your search or dietary filter.</p>
      </div>
    `;
    return;
  }

  el.menuItemsList.innerHTML = menu.map(item => {
    // Check if this item is in the cart from this restaurant
    const isThisRestInCart = cart.restaurantId === restaurant.id;
    const cartItem = isThisRestInCart ? cart.items.find(i => i.id === item.id) : null;
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
  const totals = getCartTotals();
  el.headerCartBadge.textContent = totals.itemCount;
}

function openCartDrawer() {
  renderCartDrawer();
  el.cartDrawerBackdrop.classList.add("open");
  el.cartDrawer.classList.add("open");
}

function closeCartDrawer() {
  el.cartDrawerBackdrop.classList.remove("open");
  el.cartDrawer.classList.remove("open");
}

function renderCartDrawer() {
  const cart = getCart();
  const totals = getCartTotals();

  el.drawerTotalAmount.textContent = `₹${totals.grandTotal}`;

  if (!cart.items || cart.items.length === 0) {
    el.cartDrawerBody.innerHTML = `
      <div class="empty-state" style="border: none; padding: 40px 10px;">
        <div class="empty-icon">🛒</div>
        <h3 class="empty-title">Your cart is empty</h3>
        <p class="empty-subtitle">Good food is always just around the corner. Add your favorite dishes from our menus!</p>
        <button class="btn-primary" id="btn-cart-browse">Browse Restaurants</button>
      </div>
    `;
    el.btnDrawerCheckout.disabled = true;
    el.btnDrawerCheckout.style.opacity = "0.5";
    el.btnDrawerCheckout.style.cursor = "not-allowed";
    return;
  }

  el.btnDrawerCheckout.disabled = false;
  el.btnDrawerCheckout.style.opacity = "1";
  el.btnDrawerCheckout.style.cursor = "pointer";

  // Items List
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

  el.cartDrawerBody.innerHTML = `
    <div class="cart-restaurant-banner">
      <div>
        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700;">Ordering from</div>
        <div class="cart-rest-name">${escapeHtml(cart.restaurantName)}</div>
      </div>
      <button class="btn-clear-cart" id="btn-clear-cart-action">Clear Cart</button>
    </div>

    <div class="cart-items-list">
      ${itemsHTML}
    </div>

    <!-- Free Delivery Prompt -->
    ${totals.subtotal < 400 ? `
      <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.82rem; color: #1E40AF; margin-bottom: 16px;">
        💡 Add items worth <strong>₹${400 - totals.subtotal}</strong> more for <strong>FREE Delivery!</strong>
      </div>
    ` : `
      <div style="background: var(--veg-bg); border: 1px solid #BBF7D0; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.82rem; color: var(--veg-green); margin-bottom: 16px;">
        🎉 You've unlocked <strong>FREE Delivery!</strong>
      </div>
    `}

    <!-- Bill Details -->
    <div class="cart-bill-details">
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
    </div>
  `;
}

function handleAddToCartRequest(restaurant, item) {
  const result = addToCart(restaurant, item);

  if (result.conflict) {
    state.pendingConflictItem = { restaurant, item };
    el.conflictModalMsg.innerHTML = `
      Your cart contains delicious food from <strong>${escapeHtml(result.existingRestaurant)}</strong>.<br><br>
      Would you like to discard those and start a fresh order from <strong>${escapeHtml(result.newRestaurant)}</strong>?
    `;
    el.conflictModalBackdrop.classList.add("open");
  } else {
    showToast(`Added "${item.name}" to cart!`, "🛒");
  }
}

/* ==========================================================================
   CHECKOUT RENDERING & SUBMISSION
   ========================================================================== */
function renderCheckout() {
  const cart = getCart();
  const totals = getCartTotals();
  const session = getSession();

  if (session && el.checkoutName) {
    el.checkoutName.value = session.name;
  }

  // Summary items list
  el.checkoutItemsSummary.innerHTML = `
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

  // Bill breakdown
  el.checkoutBillBreakdown.innerHTML = `
    <div class="bill-row">
      <span>Item Subtotal</span>
      <span>₹${totals.subtotal}</span>
    </div>
    <div class="bill-row">
      <span>Delivery Fee</span>
      <span>${totals.deliveryFee === 0 ? `<span class="free-tag">FREE</span>` : `₹${totals.deliveryFee}`}</span>
    </div>
    <div class="bill-row">
      <span>Platform Fee</span>
      <span>₹${totals.platformFee}</span>
    </div>
    <div class="bill-row">
      <span>GST (5%)</span>
      <span>₹${totals.gst}</span>
    </div>
    <div class="bill-row total">
      <span>Total to Pay</span>
      <span>₹${totals.grandTotal}</span>
    </div>
  `;
}

function handlePlaceOrder() {
  const session = getSession();
  if (!session) {
    showToast("Please sign in to place your order.");
    openAuthModal("login");
    return;
  }

  const name = el.checkoutName.value.trim();
  const phone = el.checkoutPhone.value.trim();
  const address = el.checkoutAddress.value.trim();

  if (!name || !phone || !address) {
    showToast("Please fill in all delivery details.");
    return;
  }

  const paymentMethodInput = document.querySelector('input[name="payment-method"]:checked');
  const paymentMethod = paymentMethodInput ? paymentMethodInput.value : "Cash on Delivery";

  const result = placeOrder({
    name,
    phone,
    address,
    paymentMethod
  });

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
  el.confirmationContainer.innerHTML = `
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
  const session = getSession();
  if (!session) {
    el.ordersListContainer.innerHTML = `
      <div class="empty-state" style="max-width: 600px; margin: 40px auto;">
        <div class="empty-icon">🔐</div>
        <h3 class="empty-title">Please Sign In</h3>
        <p class="empty-subtitle">You must be signed in to view your order history.</p>
        <button class="btn-primary" id="btn-orders-login">Sign In Now</button>
      </div>
    `;
    el.ordersEmptyState.style.display = "none";
    document.getElementById("btn-orders-login")?.addEventListener("click", () => openAuthModal("login"));
    return;
  }

  const orders = getOrders();
  if (orders.length === 0) {
    el.ordersListContainer.innerHTML = "";
    el.ordersEmptyState.style.display = "block";
    return;
  }

  el.ordersEmptyState.style.display = "none";
  el.ordersListContainer.innerHTML = orders.map(o => {
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

        <div class="order-items-snippet">
          ${itemsSummary}
        </div>

        <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">
          📍 Delivered to: ${escapeHtml(o.deliveryAddress)}
        </div>

        <div class="order-card-footer">
          <div class="order-total-amount">
            Total Paid: ₹${o.totals.grandTotal}
          </div>
          <button class="btn-outline" data-reorder-id="${o.orderId}" style="font-size: 0.85rem; padding: 6px 16px;">
            Reorder Dishes
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function handleReorder(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const restaurant = RESTAURANTS.find(r => r.id === order.restaurantId);
  if (!restaurant) {
    showToast("Restaurant no longer available.");
    return;
  }

  // Clear current cart and load items from this previous order
  clearCart();
  order.items.forEach(item => {
    addToCart(restaurant, item);
    // adjust qty if greater than 1
    if (item.qty > 1) {
      updateCartItemQty(item.id, item.qty - 1);
    }
  });

  showToast(`Loaded ${order.items.length} items from ${restaurant.name} into cart!`, "🛍️");
  openCartDrawer();
}

/* ==========================================================================
   EVENT LISTENERS SETUP
   ========================================================================== */
function setupEventListeners() {
  // Navigation & Drawer Triggers
  el.navCartBtn.addEventListener("click", openCartDrawer);
  el.cartDrawerClose.addEventListener("click", closeCartDrawer);
  el.cartDrawerBackdrop.addEventListener("click", closeCartDrawer);

  // User Profile Dropdown
  el.userBadgeTrigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    el.userDropdownMenu.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    el.userDropdownMenu?.classList.remove("open");
  });

  el.userMenuLogout.addEventListener("click", () => {
    clearSession();
    updateAuthUI();
    showToast("Signed out successfully.");
    window.location.hash = "#landing";
  });

  // Auth Modal Triggers
  el.navAuthBtn.addEventListener("click", () => openAuthModal("login"));
  el.authModalClose.addEventListener("click", closeAuthModal);
  el.authModalBackdrop.addEventListener("click", (e) => {
    if (e.target === el.authModalBackdrop) closeAuthModal();
  });

  el.tabLoginBtn.addEventListener("click", () => switchAuthTab("login"));
  el.tabSignupBtn.addEventListener("click", () => switchAuthTab("signup"));

  // 1-Click Demo Fill
  el.btnDemoLoginFill.addEventListener("click", () => {
    const creds = getDemoCredentials();
    el.loginEmail.value = creds.email;
    el.loginPassword.value = creds.password;
    setAuthAlert("Demo credentials filled! Click 'Sign In' below.", "success");
  });

  // Login Form Submit
  el.formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = el.loginEmail.value.trim();
    const password = el.loginPassword.value;
    const result = loginUser(email, password);

    if (result.success) {
      updateAuthUI();
      closeAuthModal();
      showToast(`Welcome back, ${result.session.name}! 👋`);
    } else {
      setAuthAlert(result.message, "error");
    }
  });

  // Signup Form Submit
  el.formSignup.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = el.signupName.value.trim();
    const email = el.signupEmail.value.trim();
    const password = el.signupPassword.value;
    const result = registerUser(name, email, password);

    if (result.success) {
      // Auto login
      loginUser(email, password);
      updateAuthUI();
      closeAuthModal();
      showToast(`Account created! Welcome to EatUp, ${name}! 🎉`);
    } else {
      setAuthAlert(result.message, "error");
    }
  });

  // Hero Search
  el.heroSearchBtn.addEventListener("click", () => {
    const q = el.heroSearchInput.value.trim();
    state.searchQuery = q;
    el.exploreSearchInput.value = q;
    window.location.hash = "#explore";
  });

  el.heroSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      el.heroSearchBtn.click();
    }
  });

  // Category Carousel Clicks (Landing)
  el.landingCategoriesCarousel.addEventListener("click", (e) => {
    const card = e.target.closest(".category-pill");
    if (!card) return;
    const cat = card.dataset.category;
    state.activeCategory = cat;
    renderExploreCategories();
    window.location.hash = "#explore";
  });

  // Explore Filter Controls
  el.exploreSearchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderExploreRestaurants();
  });

  el.filterVegBtn.addEventListener("click", () => {
    state.filterVegOnly = !state.filterVegOnly;
    el.filterVegBtn.classList.toggle("active", state.filterVegOnly);
    renderExploreRestaurants();
  });

  el.filterRatingBtn.addEventListener("click", () => {
    state.filterHighRating = !state.filterHighRating;
    el.filterRatingBtn.classList.toggle("active", state.filterHighRating);
    renderExploreRestaurants();
  });

  el.filterFastBtn.addEventListener("click", () => {
    state.filterFastDelivery = !state.filterFastDelivery;
    el.filterFastBtn.classList.toggle("active", state.filterFastDelivery);
    renderExploreRestaurants();
  });

  el.sortSelect.addEventListener("change", (e) => {
    state.sortOption = e.target.value;
    renderExploreRestaurants();
  });

  el.exploreCategoryChips.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-cat-chip]");
    if (!chip) return;
    state.activeCategory = chip.dataset.catChip;
    renderExploreCategories();
    renderExploreRestaurants();
  });

  el.btnResetFilters.addEventListener("click", () => {
    state.searchQuery = "";
    state.activeCategory = "all";
    state.filterVegOnly = false;
    state.filterHighRating = false;
    state.filterFastDelivery = false;
    state.sortOption = "relevance";

    el.exploreSearchInput.value = "";
    el.filterVegBtn.classList.remove("active");
    el.filterRatingBtn.classList.remove("active");
    el.filterFastBtn.classList.remove("active");
    el.sortSelect.value = "relevance";

    renderExploreCategories();
    renderExploreRestaurants();
  });

  // Click on Restaurant Card (Landing or Explore)
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".restaurant-card");
    if (card && card.dataset.restaurantId) {
      window.location.hash = `#restaurant/${card.dataset.restaurantId}`;
    }
  });

  // Restaurant Menu Controls
  el.restBackBtn.addEventListener("click", () => {
    window.location.hash = "#explore";
  });

  el.menuVegFilter.addEventListener("click", () => {
    state.menuVegOnly = true;
    el.menuVegFilter.classList.add("active");
    el.menuAllFilter.classList.remove("active");
    renderRestaurantMenu();
  });

  el.menuAllFilter.addEventListener("click", () => {
    state.menuVegOnly = false;
    el.menuAllFilter.classList.add("active");
    el.menuVegFilter.classList.remove("active");
    renderRestaurantMenu();
  });

  el.menuSearchInput.addEventListener("input", (e) => {
    state.menuSearchQuery = e.target.value;
    renderRestaurantMenu();
  });

  // Menu Add & Stepper clicks
  el.menuItemsList.addEventListener("click", (e) => {
    const addBtn = e.target.closest('[data-action="add-menu"]');
    const incBtn = e.target.closest('[data-action="increase-menu"]');
    const decBtn = e.target.closest('[data-action="decrease-menu"]');

    const restaurant = RESTAURANTS.find(r => r.id === state.activeRestaurantId);
    if (!restaurant) return;

    if (addBtn) {
      const dishId = addBtn.dataset.itemId;
      const dish = restaurant.menu.find(m => m.id === dishId);
      if (dish) handleAddToCartRequest(restaurant, dish);
    } else if (incBtn) {
      const dishId = incBtn.dataset.itemId;
      updateCartItemQty(dishId, 1);
    } else if (decBtn) {
      const dishId = decBtn.dataset.itemId;
      updateCartItemQty(dishId, -1);
    }
  });

  // Cart Drawer Item Actions
  el.cartDrawerBody.addEventListener("click", (e) => {
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
      closeCartDrawer();
      window.location.hash = "#explore";
    }
  });

  // Proceed to Checkout from Drawer
  el.btnDrawerCheckout.addEventListener("click", () => {
    const cart = getCart();
    if (!cart.items || cart.items.length === 0) return;

    closeCartDrawer();

    const session = getSession();
    if (!session) {
      showToast("Please sign in to proceed with checkout.");
      openAuthModal("login");
      return;
    }

    window.location.hash = "#checkout";
  });

  // Checkout View Actions
  el.checkoutBackBtn.addEventListener("click", () => {
    if (state.activeRestaurantId) {
      window.location.hash = `#restaurant/${state.activeRestaurantId}`;
    } else {
      window.location.hash = "#explore";
    }
  });

  el.btnConfirmPlaceOrder.addEventListener("click", handlePlaceOrder);

  // Orders View Actions (Reorder)
  el.ordersListContainer.addEventListener("click", (e) => {
    const reorderBtn = e.target.closest("[data-reorder-id]");
    if (reorderBtn) {
      handleReorder(reorderBtn.dataset.reorderId);
    }
  });

  // Conflict Modal Actions
  el.conflictBtnCancel.addEventListener("click", () => {
    state.pendingConflictItem = null;
    el.conflictModalBackdrop.classList.remove("open");
  });

  el.conflictBtnConfirm.addEventListener("click", () => {
    if (state.pendingConflictItem) {
      clearCart();
      const { restaurant, item } = state.pendingConflictItem;
      addToCart(restaurant, item);
      state.pendingConflictItem = null;
      el.conflictModalBackdrop.classList.remove("open");
      showToast(`Fresh cart started from ${restaurant.name}!`, "🥘");
    }
  });
}

// Kick off application
document.addEventListener("DOMContentLoaded", init);
