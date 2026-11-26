import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, Receipt } from "lucide-react";
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
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].value);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name);
      if (user.defaultPhone && user.defaultPhone !== "9876543210") {
        setPhone((prev) => prev || user.defaultPhone);
      }
      if (
        user.defaultAddress &&
        user.defaultAddress !== "Flat 402, Sunshine Residency, Barakhamba Road, Connaught Place, New Delhi"
      ) {
        setAddress((prev) => prev || user.defaultAddress);
      }
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
      showToast("Your tray is empty! Add dishes first.");
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
    const cleanPhone = phone.trim();
    if (!name.trim() || !cleanPhone || !address.trim()) {
      showToast("Please fill in all delivery details.");
      return;
    }
    if (!/^\d{10}$/.test(cleanPhone)) {
      showToast("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (isGroupMode && !isCreator) {
      showToast("Only the table host can finalize the group order.");
      return;
    }

    setPlacing(true);
    try {
      let order;
      if (isGroupMode) {
        order = await finalizeRoomOrder({
          name: name.trim(),
          phone: cleanPhone,
          address: address.trim(),
          paymentMethod
        });
      } else {
        const res = await orderApi.createSolo({
          name: name.trim(),
          phone: cleanPhone,
          address: address.trim(),
          paymentMethod
        });
        order = res.order;
        await refreshCart();
      }
      showToast("Order placed successfully!");
      navigate(`/confirmation/${order.orderNumber}`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to place order.");
    } finally {
      setPlacing(false);
    }
  };

  if (isGroupMode && activeRoom && !isCreator) {
    return (
      <div className="mx-auto max-w-[600px] px-4 sm:px-6 py-16 text-center">
        <h2 className="font-editorial mb-2 text-3xl text-[#1C1917]">Host Checkout Only</h2>
        <p className="mb-6 text-sm text-[#57534E]">
          Only the table host ({activeRoom.creatorName}) can finalize this combined group order.
        </p>
        <button
          type="button"
          onClick={() => navigate(`/group/${activeRoom.roomCode}`)}
          className="rounded-full bg-[#C83E2B] px-6 py-2.5 text-sm font-bold text-white"
        >
          Back to Group Table
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pb-24 sm:pb-20">
      <button
        type="button"
        onClick={() =>
          isGroupMode && activeRoom
            ? navigate(`/group/${activeRoom.roomCode}`)
            : cart.restaurantId
              ? navigate(`/restaurants/${cart.restaurantId}`)
              : navigate("/explore")
        }
        className="mt-6 mb-5 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#57534E] uppercase hover:text-[#C83E2B]"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{isGroupMode ? "Back to Group Table" : "Back to Menu"}</span>
      </button>

      <h1 className="font-editorial mb-7 text-4xl sm:text-5xl tracking-tight text-[#1C1917]">
        {isGroupMode ? `Finalize Group Table (${activeRoom?.roomCode || ""})` : "Complete Your Order"}
      </h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-7 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* Delivery Address */}
          <div className="rounded-2xl border border-[#EAE3D9] bg-white p-6 sm:p-7">
            <h2 className="font-editorial mb-5 flex items-center gap-2.5 text-2xl text-[#1C1917]">
              <MapPin className="h-5 w-5 text-[#C83E2B]" />
              <span>Delivery Details</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#57534E] uppercase" htmlFor="checkout-name">
                  Recipient Name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] px-3.5 py-3 text-sm text-[#1C1917] outline-none focus:border-[#C83E2B] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#57534E] uppercase" htmlFor="checkout-phone">
                  10-Digit Mobile Number
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  className="font-code w-full rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] px-3.5 py-3 text-sm text-[#1C1917] outline-none focus:border-[#C83E2B] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-[#57534E] uppercase" htmlFor="checkout-address">
                  Complete Street Address
                </label>
                <textarea
                  id="checkout-address"
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat / House no, Street, Area, Landmark"
                  className="w-full rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] px-3.5 py-3 text-sm text-[#1C1917] outline-none focus:border-[#C83E2B] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-[#EAE3D9] bg-white p-6 sm:p-7">
            <h2 className="font-editorial mb-5 flex items-center gap-2.5 text-2xl text-[#1C1917]">
              <CreditCard className="h-5 w-5 text-[#C83E2B]" />
              <span>Payment Method</span>
            </h2>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map((pm) => {
                const selected = paymentMethod === pm.value;
                return (
                  <label
                    key={pm.value}
                    className={`flex cursor-pointer items-center gap-3.5 rounded-xl border px-4 py-3.5 transition ${
                      selected
                        ? "border-[#C83E2B] bg-[#FBECE9]/50"
                        : "border-[#EAE3D9] bg-[#FAF7F2] hover:border-[#1C1917]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={pm.value}
                      checked={selected}
                      onChange={() => setPaymentMethod(pm.value)}
                      className="h-4 w-4 accent-[#C83E2B]"
                    />
                    <div>
                      <div className="text-sm font-bold text-[#1C1917]">{pm.title}</div>
                      <div className="text-xs text-[#57534E]">{pm.subtitle}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="rounded-2xl border border-[#EAE3D9] bg-white p-6 sm:p-7">
            <h2 className="font-editorial mb-5 flex items-center gap-2.5 text-2xl text-[#1C1917]">
              <Receipt className="h-5 w-5 text-[#C83E2B]" />
              <span>Order Ticket</span>
            </h2>

            <div className="mb-5">
              <div className="mb-3 text-xs font-bold tracking-wider text-[#C83E2B] uppercase">
                From: {activeRestaurantName} ({activeTotals.itemCount} items)
              </div>
              <div className="flex flex-col gap-2">
                {activeItems.map((item, idx) => (
                  <div
                    key={`${item.dishId || item.id}-${idx}`}
                    className="flex justify-between gap-3 text-sm"
                  >
                    <span className="text-[#1C1917]">
                      <span className="font-code font-bold">{item.qty}×</span> {item.name}
                      {isGroupMode && item.addedBy?.name && (
                        <span className="ml-1.5 text-xs text-[#A8A29E]">
                          ({item.addedBy.name})
                        </span>
                      )}
                    </span>
                    <span className="font-code shrink-0 font-bold text-[#1C1917] tabular-nums">
                      ₹{item.price * item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {isGroupMode && activeRoom?.participantBills && (
              <div className="mb-5 rounded-xl border border-[#2D5A3C]/20 bg-[#EAF2EC] p-3.5">
                <div className="mb-2 text-[10px] font-bold tracking-[0.14em] text-[#1F422B] uppercase">
                  Individual Payment Responsibilities
                </div>
                <div className="space-y-1.5 text-xs">
                  {activeRoom.participantBills
                    .filter((b) => b.itemCount > 0)
                    .map((b) => (
                      <div key={b.userId} className="flex justify-between font-bold text-[#1C1917]">
                        <span>
                          {b.userName} ({b.itemCount} items)
                        </span>
                        <span className="font-code text-[#2D5A3C]">₹{b.totalOwed}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] p-4 text-sm">
              <div className="flex justify-between text-[#57534E]">
                <span>Item Subtotal</span>
                <span className="font-code tabular-nums">₹{activeTotals.subtotal}</span>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <span>Delivery Fee</span>
                <span className="font-code tabular-nums">
                  {activeTotals.deliveryFee === 0 ? (
                    <span className="font-bold text-[#2D5A3C]">FREE</span>
                  ) : (
                    `₹${activeTotals.deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <span>Platform Fee</span>
                <span className="font-code tabular-nums">₹{activeTotals.platformFee}</span>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <span>GST (5%)</span>
                <span className="font-code tabular-nums">₹{activeTotals.gst}</span>
              </div>
              <div className="mt-2.5 flex justify-between border-t border-dashed border-[#EAE3D9] pt-2.5 text-base font-extrabold text-[#1C1917]">
                <span>Total to Pay</span>
                <span className="font-code tabular-nums">₹{activeTotals.grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placing || activeItems.length === 0}
              className="mt-6 w-full rounded-full bg-[#C83E2B] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#A62F1F] disabled:opacity-60"
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
