import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useGroupOrder } from "../context/GroupOrderContext";
import { useToast } from "../context/ToastContext";
import { PAYMENT_METHODS } from "../utils/constants";

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const isGroupMode = searchParams.get("mode") === "group";
  const roomCodeParam = searchParams.get("roomCode");

  const { user, authLoading, openAuthModal } = useAuth();
  const { cart, totals, refreshCart } = useCart();
  const { activeRoom, isCreator, joinRoom, finalizeRoomOrder } = useGroupOrder();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("9876543210");
  const [address, setAddress] = useState(
    "Flat 402, Sunshine Residency, Barakhamba Road, Connaught Place, New Delhi"
  );
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name);
      if (user.defaultPhone) setPhone(user.defaultPhone);
      if (user.defaultAddress) setAddress(user.defaultAddress);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      showToast("Please sign in to place your order.");
      openAuthModal("login");
      return;
    }

    if (isGroupMode) {
      if (roomCodeParam && (!activeRoom || activeRoom.roomCode !== roomCodeParam.toUpperCase())) {
        joinRoom(roomCodeParam).catch(() => navigate("/explore"));
      }
    } else if (!cart.items || cart.items.length === 0) {
      showToast("Your cart is empty! Add items first.");
      navigate("/explore");
    }
  }, [
    authLoading,
    user,
    isGroupMode,
    roomCodeParam,
    activeRoom,
    cart.items,
    joinRoom,
    navigate,
    openAuthModal,
    showToast
  ]);

  const activeItems = isGroupMode ? activeRoom?.items || [] : cart.items || [];
  const activeTotals = isGroupMode ? activeRoom?.combinedTotals || totals : totals;
  const activeRestaurantName = isGroupMode ? activeRoom?.restaurantName : cart.restaurantName;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      showToast("Please fill in all delivery details.");
      return;
    }
    if (isGroupMode && !isCreator) {
      showToast("Only the room host can finalize the group order.", "⚠️");
      return;
    }

    setPlacing(true);
    try {
      let order;
      if (isGroupMode) {
        order = await finalizeRoomOrder({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          paymentMethod
        });
      } else {
        const res = await orderApi.createSolo({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          paymentMethod
        });
        order = res.order;
        await refreshCart();
      }
      showToast("Order placed successfully! 🎉");
      navigate(`/confirmation/${order.orderNumber}`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to place order.", "⚠️");
    } finally {
      setPlacing(false);
    }
  };

  if (isGroupMode && activeRoom && !isCreator) {
    return (
      <div className="mx-auto max-w-[600px] px-5 py-16 text-center">
        <h2 className="mb-2 text-2xl font-extrabold text-[#111827]">Host Checkout Only</h2>
        <p className="mb-6 text-sm text-[#4B5563]">
          Only the room host ({activeRoom.creatorName}) can finalize this combined group order.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/group/${activeRoom.roomCode}`)}
          className="rounded-full bg-[#0D7A53] px-6 py-2.5 text-sm font-bold text-white"
        >
          Back to Group Room
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] px-5 pb-20">
      <button
        type="button"
        onClick={() =>
          isGroupMode && activeRoom
            ? navigate(`/group/${activeRoom.roomCode}`)
            : cart.restaurantId
              ? navigate(`/restaurants/${cart.restaurantId}`)
              : navigate("/explore")
        }
        className="mt-6 mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#0D7A53] hover:underline"
      >
        ← {isGroupMode ? "Back to Group Room" : "Back to Menu"}
      </button>

      <h1 className="mb-6 text-3xl font-extrabold text-[#111827]">
        {isGroupMode ? `Finalize Group Order (${activeRoom?.roomCode || ""})` : "Complete Your Order"}
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          {/* Delivery Address */}
          <div className="mb-6 rounded-[18px] border border-[#E5EBE7] bg-white p-7 shadow-xs">
            <h2 className="mb-5 flex items-center gap-2.5 text-xl font-extrabold text-[#111827]">
              <span>📍</span> Delivery Address
            </h2>

            <div className="mb-4.5">
              <label className="mb-1.5 block text-sm font-bold text-[#4B5563]" htmlFor="checkout-name">
                Recipient Name
              </label>
              <input
                id="checkout-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full rounded-lg border-[1.5px] border-[#E5EBE7] px-3.5 py-3 text-[0.95rem] outline-none focus:border-[#0D7A53]"
              />
            </div>

            <div className="mb-4.5">
              <label className="mb-1.5 block text-sm font-bold text-[#4B5563]" htmlFor="checkout-phone">
                Contact Phone Number
              </label>
              <input
                id="checkout-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full rounded-lg border-[1.5px] border-[#E5EBE7] px-3.5 py-3 text-[0.95rem] outline-none focus:border-[#0D7A53]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-[#4B5563]" htmlFor="checkout-address">
                Complete Street Address
              </label>
              <textarea
                id="checkout-address"
                rows={3}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / House no, Street, Area, Landmark"
                className="w-full rounded-lg border-[1.5px] border-[#E5EBE7] px-3.5 py-3 text-[0.95rem] outline-none focus:border-[#0D7A53]"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-[18px] border border-[#E5EBE7] bg-white p-7 shadow-xs">
            <h2 className="mb-5 flex items-center gap-2.5 text-xl font-extrabold text-[#111827]">
              <span>💳</span> Select Payment Method
            </h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.value}
                  className="flex cursor-pointer items-center gap-3.5 rounded-xl border-[1.5px] border-[#E5EBE7] px-4.5 py-3.5 transition hover:border-[#0D7A53] hover:bg-[#EBF7F1]"
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={pm.value}
                    checked={paymentMethod === pm.value}
                    onChange={() => setPaymentMethod(pm.value)}
                    className="h-4.5 w-4.5 accent-[#0D7A53]"
                  />
                  <div>
                    <div className="text-[0.95rem] font-bold text-[#111827]">{pm.title}</div>
                    <div className="text-xs text-[#8E9BAE]">{pm.subtitle}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="rounded-[18px] border border-[#E5EBE7] bg-white p-7 shadow-xs">
            <h2 className="mb-5 flex items-center gap-2.5 text-xl font-extrabold text-[#111827]">
              <span>🧾</span> Order Summary
            </h2>

            <div className="mb-5">
              <div className="mb-3 text-[0.95rem] font-bold text-[#0D7A53]">
                From: {activeRestaurantName} ({activeTotals.itemCount} items)
              </div>
              <div className="flex flex-col gap-2">
                {activeItems.map((item, idx) => (
                  <div
                    key={`${item.dishId || item.id}-${idx}`}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-[#111827]">
                      {item.qty} × {item.name}
                      {isGroupMode && item.addedBy?.name && (
                        <span className="ml-1.5 text-xs text-[#8E9BAE]">
                          ({item.addedBy.name})
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-bold text-[#111827]">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isGroupMode && activeRoom?.participantBills && (
              <div className="mb-5 rounded-xl border border-[#0D7A53]/20 bg-[#EBF7F1] p-3.5">
                <div className="mb-2 text-xs font-extrabold uppercase text-[#086041]">
                  Individual Payment Responsibilities
                </div>
                <div className="space-y-1.5 text-xs">
                  {activeRoom.participantBills
                    .filter((b) => b.itemCount > 0)
                    .map((b) => (
                      <div key={b.userId} className="flex justify-between font-bold text-[#111827]">
                        <span>
                          {b.userName} ({b.itemCount} items)
                        </span>
                        <span className="text-[#0D7A53]">₹{b.totalOwed}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-[#E5EBE7] bg-[#F7FAF8] p-4">
              <div className="mb-2 flex justify-between text-sm text-[#4B5563]">
                <span>Item Subtotal</span>
                <span>₹{activeTotals.subtotal}</span>
              </div>
              <div className="mb-2 flex justify-between text-sm text-[#4B5563]">
                <span>Delivery Fee</span>
                <span>
                  {activeTotals.deliveryFee === 0 ? (
                    <span className="font-extrabold text-[#0D7A53]">FREE</span>
                  ) : (
                    `₹${activeTotals.deliveryFee}`
                  )}
                </span>
              </div>
              <div className="mb-2 flex justify-between text-sm text-[#4B5563]">
                <span>Platform Fee</span>
                <span>₹{activeTotals.platformFee}</span>
              </div>
              <div className="mb-2 flex justify-between text-sm text-[#4B5563]">
                <span>GST (5%)</span>
                <span>₹{activeTotals.gst}</span>
              </div>
              <div className="mt-2.5 flex justify-between border-t border-dashed border-[#E5EBE7] pt-2.5 text-base font-extrabold text-[#111827]">
                <span>Total to Pay</span>
                <span>₹{activeTotals.grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placing || activeItems.length === 0}
              className="mt-6 w-full rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] py-3.5 text-base font-extrabold text-white shadow-md transition hover:opacity-95 disabled:opacity-60"
            >
              {placing
                ? "Placing Order..."
                : isGroupMode
                  ? "Place Combined Group Order"
                  : "Place Order Now"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
