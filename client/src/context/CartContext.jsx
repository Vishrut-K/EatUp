import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { cartApi } from "../api/cartApi";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { calculateCartTotals } from "../utils/billing";

const GUEST_CART_KEY = "eatup_guest_cart";
const EMPTY_CART = {
  restaurantId: null,
  restaurantName: null,
  items: [],
  totals: calculateCartTotals([])
};

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return {
      restaurantId: parsed.restaurantId || null,
      restaurantName: parsed.restaurantName || null,
      items,
      totals: calculateCartTotals(items)
    };
  } catch {
    return EMPTY_CART;
  }
}

function writeGuestCart(cart) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch {
    // Ignore storage quota errors
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user, authLoading } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState(EMPTY_CART);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingConflict, setPendingConflict] = useState(null);

  const syncCartWithSession = useCallback(async () => {
    if (authLoading) return;
    if (!user) {
      setCart(readGuestCart());
      return;
    }

    const guest = readGuestCart();
    try {
      if (guest.items.length > 0 && guest.restaurantId) {
        try {
          const merged = await cartApi.merge({
            restaurantId: guest.restaurantId,
            items: guest.items,
            replace: false
          });
          localStorage.removeItem(GUEST_CART_KEY);
          setCart(merged.cart);
          return;
        } catch (err) {
          if (err?.response?.status === 409) {
            // Keep existing server cart and clear stale guest conflict or leave server cart intact
            const res = await cartApi.get();
            setCart(res.cart);
            localStorage.removeItem(GUEST_CART_KEY);
            return;
          }
        }
      }
      const res = await cartApi.get();
      setCart(res.cart);
    } catch {
      setCart(EMPTY_CART);
    }
  }, [user, authLoading]);

  useEffect(() => {
    syncCartWithSession();
  }, [syncCartWithSession]);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const addItem = useCallback(
    async (restaurant, dish, replace = false) => {
      const dishId = dish.id || dish.dishId;
      if (!user) {
        const current = readGuestCart();
        if (current.items.length > 0 && current.restaurantId !== restaurant.id && !replace) {
          setPendingConflict({
            restaurant,
            dish,
            existingRestaurant: current.restaurantName,
            newRestaurant: restaurant.name
          });
          return { conflict: true };
        }

        const baseItems = replace ? [] : [...current.items];
        const idx = baseItems.findIndex((i) => i.dishId === dishId || i.id === dishId);
        if (idx > -1) {
          baseItems[idx] = { ...baseItems[idx], qty: baseItems[idx].qty + 1 };
        } else {
          baseItems.push({
            id: dishId,
            dishId,
            name: dish.name,
            price: dish.price,
            isVeg: dish.isVeg,
            image: dish.image,
            qty: 1
          });
        }
        const nextCart = {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          items: baseItems,
          totals: calculateCartTotals(baseItems)
        };
        writeGuestCart(nextCart);
        setCart(nextCart);
        showToast(`Added "${dish.name}" to cart!`, "🛒");
        return { success: true };
      }

      try {
        const res = await cartApi.addItem({
          restaurantId: restaurant.id,
          dishId,
          replace
        });
        setCart(res.cart);
        showToast(
          replace
            ? `Fresh cart started from ${restaurant.name}!`
            : `Added "${dish.name}" to cart!`,
          replace ? "🥘" : "🛒"
        );
        return { success: true };
      } catch (err) {
        if (err?.response?.status === 409 && err?.response?.data?.conflict) {
          setPendingConflict({
            restaurant,
            dish,
            existingRestaurant: err.response.data.existingRestaurant,
            newRestaurant: err.response.data.newRestaurant
          });
          return { conflict: true };
        }
        showToast(err?.response?.data?.message || "Could not add item to cart.", "⚠️");
        return { success: false };
      }
    },
    [user, showToast]
  );

  const updateQty = useCallback(
    async (dishId, delta) => {
      if (!user) {
        const current = readGuestCart();
        const items = [...current.items];
        const idx = items.findIndex((i) => i.dishId === dishId || i.id === dishId);
        if (idx === -1) return;
        const nextQty = items[idx].qty + delta;
        if (nextQty <= 0) {
          items.splice(idx, 1);
        } else {
          items[idx] = { ...items[idx], qty: nextQty };
        }
        const nextCart =
          items.length === 0
            ? EMPTY_CART
            : {
                restaurantId: current.restaurantId,
                restaurantName: current.restaurantName,
                items,
                totals: calculateCartTotals(items)
              };
        writeGuestCart(nextCart);
        setCart(nextCart);
        return;
      }

      try {
        const res = await cartApi.updateQty(dishId, { delta });
        setCart(res.cart);
      } catch (err) {
        showToast(err?.response?.data?.message || "Failed to update quantity.", "⚠️");
      }
    },
    [user, showToast]
  );

  const clearCart = useCallback(async () => {
    if (!user) {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart(EMPTY_CART);
      return;
    }
    try {
      const res = await cartApi.clear();
      setCart(res.cart);
    } catch {
      setCart(EMPTY_CART);
    }
  }, [user]);

  const resolveConflictReplace = useCallback(async () => {
    if (!pendingConflict) return;
    const { restaurant, dish } = pendingConflict;
    setPendingConflict(null);
    await addItem(restaurant, dish, true);
  }, [pendingConflict, addItem]);

  const cancelConflict = useCallback(() => {
    setPendingConflict(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        totals: cart.totals || calculateCartTotals(cart.items),
        drawerOpen,
        openDrawer,
        closeDrawer,
        addItem,
        updateQty,
        clearCart,
        setCartDirect: setCart,
        refreshCart: syncCartWithSession,
        pendingConflict,
        resolveConflictReplace,
        cancelConflict
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
