import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, MapPin, Package, RotateCcw, Users } from "lucide-react";
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
      showToast(`Loaded ${res.cart.items.length} items from ${restaurantName} into tray.`);
      openDrawer();
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not reorder items.");
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
      showToast(err?.response?.data?.message || "Failed to update settlement.");
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-10 pb-24 sm:pb-20">
      <div className="mx-auto mb-8 max-w-[840px] border-b border-[#EAE3D9] pb-5">
        <span className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-[#C83E2B] uppercase">
          Dining Ledger
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl tracking-tight text-[#1C1917]">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-[#57534E]">
          Review past orders, delivery details, group splits, and reorder in one tap.
        </p>
      </div>

      {!authLoading && !user ? (
        <div className="mx-auto max-w-[600px]">
          <EmptyState
            icon={<Lock className="h-6 w-6" />}
            title="Sign in to view orders"
            subtitle="You must be signed in to view your solo and collaborative group order history."
            action={
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="rounded-full bg-[#C83E2B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#A62F1F]"
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
              className="h-44 animate-pulse rounded-2xl border border-[#EAE3D9] bg-white"
            />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mx-auto max-w-[600px]">
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title="No orders placed yet"
            subtitle="You haven't ordered from EatUp yet. Explore our curated kitchens to place your first meal."
            action={
              <Link
                to="/explore"
                className="inline-block rounded-full bg-[#C83E2B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#A62F1F]"
              >
                Explore Kitchens
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
                className="rounded-2xl border border-[#EAE3D9] bg-white p-6"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5 border-b border-[#EAE3D9] pb-3.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-code text-sm font-bold text-[#1C1917]">
                      #{o.orderNumber}
                    </span>
                    {isGroup && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF2EC] px-2.5 py-0.5 text-[11px] font-bold text-[#2D5A3C]">
                        <Users className="h-3 w-3" /> Room {o.roomCode}
                      </span>
                    )}
                    <span className="text-xs text-[#A8A29E]">{dateFormatted}</span>
                  </div>
                  <span className="rounded-full bg-[#EAF2EC] px-3 py-1 text-[11px] font-bold text-[#2D5A3C]">
                    {o.status}
                  </span>
                </div>

                <h3 className="font-editorial mb-1.5 text-2xl text-[#1C1917]">{o.restaurantName}</h3>

                <div className="mb-3 text-xs sm:text-sm leading-relaxed text-[#57534E]">
                  {o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}
                </div>

                <div className="mb-4 flex items-center gap-1.5 text-xs text-[#A8A29E]">
                  <MapPin className="h-3.5 w-3.5 text-[#C83E2B]" />
                  <span>{o.deliveryAddress}</span>
                </div>

                {isGroup && o.participantShares?.length > 0 && (
                  <div className="mb-4 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] p-4">
                    <div className="mb-2.5 flex items-center justify-between text-xs font-bold text-[#2D5A3C]">
                      <span className="uppercase tracking-wider">Group Split Breakdown</span>
                      {myShare && (
                        <span className="font-code">Your Share: ₹{myShare.totalOwed}</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {o.participantShares.map((s) => {
                        const canToggle = isCreator || s.userId === user.id;
                        const settled = s.paymentResponsibilityStatus === "settled";
                        return (
                          <div key={s.userId} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#57534E]">
                              {s.userName} ({s.itemCount} items)
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="font-code font-bold text-[#1C1917]">₹{s.totalOwed}</span>
                              <button
                                type="button"
                                disabled={!canToggle}
                                onClick={() => handleToggleSettlement(o, s)}
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                  settled
                                    ? "bg-[#EAF2EC] text-[#2D5A3C]"
                                    : "bg-[#FDF6E7] text-[#B47B14]"
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

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-[#EAE3D9] pt-4">
                  <div className="text-base font-extrabold text-[#1C1917]">
                    Total Paid: <span className="font-code">₹{o.totals.grandTotal}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/confirmation/${o.orderNumber}`}
                      className="rounded-full border border-[#EAE3D9] bg-white px-4 py-2 text-xs font-bold text-[#57534E] transition hover:border-[#1C1917] hover:text-[#1C1917]"
                    >
                      View Receipt
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleReorder(o.orderNumber, o.restaurantName)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#1C1917] px-4 py-2 text-xs font-bold text-[#FAF7F2] transition hover:bg-[#C83E2B]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reorder</span>
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
