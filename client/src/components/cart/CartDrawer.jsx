import { useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
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
      showToast("Please sign in to proceed with checkout.");
      openAuthModal("login");
      return;
    }
    navigate("/checkout");
  };

  const handleBrowse = () => {
    closeDrawer();
    navigate("/explore");
  };

  const freeDeliveryProgress = Math.min(100, Math.round((totals.subtotal / 400) * 100));

  return (
    <>
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 z-[1000] bg-[#1C1917]/60 backdrop-blur-xs transition-all duration-200 ${
          drawerOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[1001] flex w-full max-w-[440px] flex-col border-l border-[#EAE3D9] bg-[#FAF7F2] shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#EAE3D9] bg-white px-6 py-5">
          <div>
            <span className="block text-[10px] font-bold tracking-[0.16em] text-[#C83E2B] uppercase">
              Personal Order
            </span>
            <h3 className="font-editorial text-2xl text-[#1C1917]">Your Food Tray</h3>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE3D9] bg-[#FAF7F2] text-[#57534E] transition hover:border-[#1C1917] hover:text-[#1C1917]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!cart.items || cart.items.length === 0 ? (
            <div className="px-2 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#EAE3D9] bg-white text-[#C83E2B]">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="font-editorial mb-2 text-3xl text-[#1C1917]">Your tray is empty</h3>
              <p className="mx-auto mb-6 max-w-[300px] text-sm leading-relaxed text-[#57534E]">
                Good food is always just around the corner. Explore curated kitchens to start your order.
              </p>
              <button
                type="button"
                onClick={handleBrowse}
                className="inline-flex items-center gap-2 rounded-full bg-[#1C1917] px-6 py-3 text-sm font-bold text-[#FAF7F2] transition hover:bg-[#C83E2B]"
              >
                Browse Kitchens
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#EAE3D9] bg-white px-4 py-3.5">
                <div>
                  <div className="text-[10px] font-bold tracking-[0.14em] text-[#A8A29E] uppercase">
                    Ordering From
                  </div>
                  <div className="text-sm font-extrabold text-[#1C1917]">{cart.restaurantName}</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await clearCart();
                    showToast("Tray cleared.");
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-[#FBECE9] bg-[#FBECE9] px-3 py-1 text-xs font-bold text-[#C83E2B] transition hover:bg-[#C83E2B] hover:text-white"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#EAE3D9] bg-white p-4">
                {cart.items.map((item) => {
                  const id = item.dishId || item.id;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between gap-3 border-b border-dashed border-[#EAE3D9] pb-3 last:border-b-0 last:pb-0"
                    >
                      <DietBadge isVeg={item.isVeg} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-bold text-[#1C1917]">{item.name}</div>
                        <div className="font-code text-xs text-[#57534E]">₹{item.price} each</div>
                      </div>
                      <QtyStepper
                        qty={item.qty}
                        onDecrease={() => updateQty(id, -1)}
                        onIncrease={() => updateQty(id, 1)}
                      />
                      <div className="font-code min-w-[54px] text-right text-sm font-bold text-[#1C1917] tabular-nums">
                        ₹{item.price * item.qty}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Free Delivery Progress */}
              <div className="mb-4 rounded-2xl border border-[#EAE3D9] bg-white p-3.5">
                {totals.subtotal < 400 ? (
                  <>
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#57534E]">
                      <span>
                        Add <strong className="text-[#C83E2B]">₹{400 - totals.subtotal}</strong> more for{" "}
                        <strong className="text-[#1C1917]">FREE Delivery</strong>
                      </span>
                      <span className="font-code text-[11px]">{freeDeliveryProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F3EDE2]">
                      <div
                        className="h-full rounded-full bg-[#C83E2B] transition-all duration-300"
                        style={{ width: `${freeDeliveryProgress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2D5A3C]">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Zero delivery fee unlocked on this order!</span>
                  </div>
                )}
              </div>

              {/* Receipt Summary */}
              <div className="rounded-2xl border border-[#EAE3D9] bg-white p-4">
                <div className="mb-3 text-[10px] font-bold tracking-[0.14em] text-[#A8A29E] uppercase">
                  Bill Details
                </div>
                <div className="space-y-2 text-sm text-[#57534E]">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-code tabular-nums">₹{totals.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Partner Fee</span>
                    <span className="font-code tabular-nums">
                      {totals.deliveryFee === 0 ? (
                        <span className="font-bold text-[#2D5A3C]">FREE</span>
                      ) : (
                        `₹${totals.deliveryFee}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="font-code tabular-nums">₹{totals.platformFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span className="font-code tabular-nums">₹{totals.gst}</span>
                  </div>
                  <div className="mt-2.5 flex justify-between border-t border-dashed border-[#EAE3D9] pt-3 text-base font-extrabold text-[#1C1917]">
                    <span>To Pay</span>
                    <span className="font-code tabular-nums">₹{totals.grandTotal}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-[#EAE3D9] bg-white px-6 py-4">
          <button
            type="button"
            disabled={!cart.items || cart.items.length === 0}
            onClick={handleCheckout}
            className="flex w-full items-center justify-between rounded-full bg-[#C83E2B] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#A62F1F] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <span>Proceed to Checkout</span>
            <span className="font-code tabular-nums">₹{totals.grandTotal}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
