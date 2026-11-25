import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { DietBadge } from "../common/DietBadge";
import { QtyStepper } from "../common/QtyStepper";

export function CartDrawer() {
  const { user, openAuthModal } = useAuth();
  const { cart, totals, drawerOpen, closeDrawer, updateQty, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!cart.items || cart.items.length === 0) return;
    closeDrawer();
    if (!user) {
      showToast("Please sign in to proceed with checkout.", "🔐");
      openAuthModal("login");
      return;
    }
    navigate("/checkout");
  };

  const handleBrowse = () => {
    closeDrawer();
    navigate("/explore");
  };

  return (
    <>
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xs transition-all duration-200 ${
          drawerOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[1001] flex w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#E5EBE7] px-6 py-5">
          <h3 className="text-xl font-extrabold text-[#111827]">Your Food Cart</h3>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-[#8E9BAE] transition hover:bg-[#F7FAF8] hover:text-[#111827]"
          >
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!cart.items || cart.items.length === 0 ? (
            <div className="px-2 py-10 text-center">
              <div className="mb-4 text-5xl">🛒</div>
              <h3 className="mb-2 text-xl font-extrabold text-[#111827]">Your cart is empty</h3>
              <p className="mx-auto mb-5 max-w-[320px] text-sm text-[#4B5563]">
                Good food is always just around the corner. Add your favorite dishes from our menus!
              </p>
              <button
                type="button"
                onClick={handleBrowse}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-95"
              >
                Browse Restaurants
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between rounded-xl bg-[#EBF7F1] px-4 py-3">
                <div>
                  <div className="text-[0.72rem] font-bold uppercase text-[#4B5563]">Ordering from</div>
                  <div className="text-[0.95rem] font-extrabold text-[#0D7A53]">{cart.restaurantName}</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await clearCart();
                    showToast("Cart cleared.");
                  }}
                  className="text-xs font-bold text-[#B91C1C] underline"
                >
                  Clear Cart
                </button>
              </div>

              <div className="mb-6 flex flex-col gap-4">
                {cart.items.map((item) => {
                  const id = item.dishId || item.id;
                  return (
                    <div key={id} className="flex items-center justify-between gap-3">
                      <DietBadge isVeg={item.isVeg} />
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-bold text-[#111827]">{item.name}</div>
                        <div className="text-xs text-[#4B5563]">₹{item.price} each</div>
                      </div>
                      <QtyStepper
                        qty={item.qty}
                        onDecrease={() => updateQty(id, -1)}
                        onIncrease={() => updateQty(id, 1)}
                      />
                      <div className="min-w-[52px] text-right text-sm font-extrabold text-[#111827]">
                        ₹{item.price * item.qty}
                      </div>
                    </div>
                  );
                })}
              </div>

              {totals.subtotal < 400 ? (
                <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2.5 text-[0.82rem] text-blue-800">
                  💡 Add items worth <strong>₹{400 - totals.subtotal}</strong> more for{" "}
                  <strong>FREE Delivery!</strong>
                </div>
              ) : (
                <div className="mb-4 rounded-lg border border-green-200 bg-[#DCFCE7] px-3.5 py-2.5 text-[0.82rem] text-[#15803D]">
                  🎉 You&apos;ve unlocked <strong>FREE Delivery!</strong>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-[#E5EBE7] bg-[#F7FAF8] p-4">
                <div className="mb-2 flex justify-between text-sm text-[#4B5563]">
                  <span>Item Subtotal</span>
                  <span>₹{totals.subtotal}</span>
                </div>
                <div className="mb-2 flex justify-between text-sm text-[#4B5563]">
                  <span>Delivery Partner Fee</span>
                  <span>
                    {totals.deliveryFee === 0 ? (
                      <span className="font-extrabold text-[#0D7A53]">FREE</span>
                    ) : (
                      `₹${totals.deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="mb-2 flex justify-between text-sm text-[#4B5563]">
                  <span>Platform Fee</span>
                  <span>₹{totals.platformFee}</span>
                </div>
                <div className="mb-2 flex justify-between text-sm text-[#4B5563]">
                  <span>Government Taxes &amp; GST (5%)</span>
                  <span>₹{totals.gst}</span>
                </div>
                <div className="mt-2.5 flex justify-between border-t border-dashed border-[#E5EBE7] pt-2.5 text-base font-extrabold text-[#111827]">
                  <span>To Pay</span>
                  <span>₹{totals.grandTotal}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-[#E5EBE7] bg-white px-6 py-5">
          <button
            type="button"
            disabled={!cart.items || cart.items.length === 0}
            onClick={handleCheckout}
            className="flex w-full items-center justify-between rounded-xl bg-gradient-to-br from-[#0D7A53] to-[#149666] px-4 py-3.5 text-base font-extrabold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Proceed to Checkout</span>
            <span>₹{totals.grandTotal}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
