import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { EmptyState } from "../components/common/EmptyState";

export function OrdersHistoryPage() {
  const { user, authLoading, openAuthModal } = useAuth();
  const { setCartDirect, openDrawer } = useCart();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      setOrders([]);
      return;
    }

    let active = true;
    setLoading(true);
    orderApi
      .getAll()
      .then((res) => {
        if (active) setOrders(res.orders || []);
      })
      .catch(() => {
        if (active) setOrders([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const handleReorder = async (orderNumber, restaurantName) => {
    try {
      const res = await orderApi.reorder(orderNumber);
      setCartDirect(res.cart);
      showToast(`Loaded ${res.cart.items.length} items from ${restaurantName} into cart!`, "🛍️");
      openDrawer();
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not reorder items.", "⚠️");
    }
  };

  const handleToggleSettlement = async (order, share) => {
    const nextStatus = share.paymentResponsibilityStatus === "settled" ? "unpaid" : "settled";
    try {
      const res = await orderApi.updateSettlement(order.orderNumber, {
        targetUserId: share.userId,
        status: nextStatus
      });
      setOrders((prev) =>
        prev.map((o) => (o.orderNumber === order.orderNumber ? res.order : o))
      );
      showToast(`${share.userName}'s share marked as ${nextStatus}.`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to update settlement.", "⚠️");
    }
  };

  return (
    <div className="mx-auto max-w-[1240px] px-5 pt-10 pb-20">
      <div className="mx-auto mb-7 max-w-[840px]">
        <h1 className="text-[1.85rem] font-extrabold text-[#111827]">My Orders</h1>
        <p className="mt-1 text-[0.95rem] text-[#4B5563]">
          View your past orders, delivery details, group splits, and items
        </p>
      </div>

      {!authLoading && !user ? (
        <div className="mx-auto max-w-[600px]">
          <EmptyState
            icon="🔐"
            title="Please Sign In"
            subtitle="You must be signed in to view your order history."
            action={
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] px-6 py-2.5 text-sm font-bold text-white"
              >
                Sign In Now
              </button>
            }
          />
        </div>
      ) : loading ? (
        <div className="mx-auto flex max-w-[840px] flex-col gap-5">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-44 animate-pulse rounded-[18px] border border-[#E5EBE7] bg-white"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mx-auto max-w-[600px]">
          <EmptyState
            icon="🛍️"
            title="No orders placed yet"
            subtitle="You haven't placed any orders with EatUp yet. Check out top restaurants and order your favorite meal!"
            action={
              <Link
                to="/explore"
                className="inline-block rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] px-6 py-2.5 text-sm font-bold text-white"
              >
                Explore Restaurants
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mx-auto flex max-w-[840px] flex-col gap-5">
          {orders.map((o) => {
            const dateFormatted = new Date(o.createdAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short"
            });
            const isGroup = o.orderType === "group";
            const myShare = o.participantShares?.find((s) => s.userId === user.id);
            const isCreator = o.placedByUserId === user.id;

            return (
              <div
                key={o.orderNumber}
                className="rounded-[18px] border border-[#E5EBE7] bg-white p-6 shadow-xs"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#E5EBE7] pb-3.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-[0.95rem] font-extrabold text-[#111827]">
                      Order #{o.orderNumber}
                    </span>
                    {isGroup && (
                      <span className="rounded-full bg-[#EBF7F1] px-2.5 py-0.5 text-xs font-extrabold text-[#0D7A53]">
                        👥 Group Room {o.roomCode}
                      </span>
                    )}
                    <span className="text-xs text-[#8E9BAE]">{dateFormatted}</span>
                  </div>
                  <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-extrabold text-[#15803D]">
                    {o.status}
                  </span>
                </div>

                <div className="mb-1.5 text-lg font-extrabold text-[#111827]">{o.restaurantName}</div>

                <div className="mb-3 text-sm leading-relaxed text-[#4B5563]">
                  {o.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                </div>

                <div className="mb-3 text-xs text-[#8E9BAE]">
                  📍 Delivered to: {o.deliveryAddress}
                </div>

                {isGroup && o.participantShares?.length > 0 && (
                  <div className="mb-4 rounded-xl border border-[#E5EBE7] bg-[#F7FAF8] p-3.5">
                    <div className="mb-2 flex items-center justify-between text-xs font-extrabold text-[#086041]">
                      <span>Group Split Breakdown</span>
                      {myShare && <span>Your Share: ₹{myShare.totalOwed}</span>}
                    </div>
                    <div className="space-y-1.5">
                      {o.participantShares.map((s) => {
                        const canToggle = isCreator || s.userId === user.id;
                        const settled = s.paymentResponsibilityStatus === "settled";
                        return (
                          <div key={s.userId} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#4B5563]">
                              {s.userName} ({s.itemCount} items)
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#111827]">₹{s.totalOwed}</span>
                              <button
                                type="button"
                                disabled={!canToggle}
                                onClick={() => handleToggleSettlement(o, s)}
                                className={`rounded-full px-2 py-0.5 text-[0.7rem] font-extrabold ${
                                  settled
                                    ? "bg-[#DCFCE7] text-[#15803D]"
                                    : "bg-[#FEF3C7] text-[#92400E]"
                                }`}
                              >
                                {settled ? "Settled" : "Unpaid"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-[#E5EBE7] pt-3.5">
                  <div className="text-lg font-extrabold text-[#111827]">
                    Total Paid: ₹{o.totals.grandTotal}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/confirmation/${o.orderNumber}`}
                      className="rounded-full border border-[#E5EBE7] bg-white px-4 py-1.5 text-sm font-bold text-[#4B5563] hover:bg-[#F7FAF8]"
                    >
                      View Receipt
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleReorder(o.orderNumber, o.restaurantName)}
                      className="rounded-full border border-[#E5EBE7] bg-white px-4 py-1.5 text-sm font-bold text-[#111827] hover:border-[#8E9BAE] hover:bg-[#F7FAF8]"
                    >
                      Reorder Dishes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
