import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { orderApi } from "../api/orderApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    orderApi
      .getByNumber(orderNumber)
      .then((res) => {
        if (active) setOrder(res.order);
      })
      .catch(() => {
        if (active) setOrder(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderNumber]);

  const toggleShareSettled = async (share) => {
    const nextStatus = share.paymentResponsibilityStatus === "settled" ? "unpaid" : "settled";
    try {
      const res = await orderApi.updateSettlement(order.orderNumber, {
        targetUserId: share.userId,
        status: nextStatus
      });
      setOrder(res.order);
      showToast(`${share.userName}'s share marked as ${nextStatus}.`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not update payment status.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-16">
        <div className="h-96 animate-pulse rounded-3xl border border-[#EAE3D9] bg-white" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-16 text-center">
        <h2 className="font-editorial mb-2 text-3xl text-[#1C1917]">Order Receipt Not Found</h2>
        <p className="mb-6 text-sm text-[#57534E]">
          Sign in with the account that placed or participated in this order to view its receipt.
        </p>
        <Link
          to="/orders"
          className="inline-block rounded-full bg-[#C83E2B] px-6 py-2.5 text-sm font-bold text-white"
        >
          Go to My Orders
        </Link>
      </div>
    );
  }

  const isGroup = order.orderType === "group";
  const isCreator = user && order.placedByUserId === user.id;

  return (
    <div className="px-4 sm:px-6 py-12 pb-24 sm:pb-16">
      <div className="mx-auto max-w-[660px] rounded-3xl border border-[#EAE3D9] bg-white p-7 sm:p-10 text-center shadow-xl">
        <div className="animate-pulse-success mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF2EC] text-[#2D5A3C]">
          <Check className="h-8 w-8 stroke-[2.5]" />
        </div>

        <span className="mb-2 inline-block text-[10px] font-bold tracking-[0.16em] text-[#2D5A3C] uppercase">
          Kitchen Confirmed
        </span>
        <h1 className="font-editorial mb-2 text-4xl sm:text-5xl text-[#1C1917]">
          {isGroup ? "Group Order Placed!" : "Order Placed!"}
        </h1>
        <p className="mb-7 text-sm sm:text-base text-[#57534E]">
          Thank you for dining with EatUp. Your meal from{" "}
          <strong className="text-[#1C1917]">{order.restaurantName}</strong> is being prepared fresh.
        </p>

        <div className="mb-7 rounded-2xl border border-dashed border-[#EAE3D9] bg-[#FAF7F2] p-5 text-left">
          <div className="mb-4 flex justify-between border-b border-[#EAE3D9] pb-3">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-[#A8A29E] uppercase">
                Order ID
              </div>
              <div className="font-code text-base sm:text-lg font-bold text-[#C83E2B]">
                {order.orderNumber}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold tracking-wider text-[#A8A29E] uppercase">
                Estimated Arrival
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[#2D5A3C]">30–35 mins</div>
            </div>
          </div>

          <div className="mb-1.5 text-xs sm:text-sm text-[#57534E]">
            <strong className="text-[#1C1917]">Delivering to:</strong> {order.deliveryAddress}
          </div>
          <div className="mb-4 text-xs sm:text-sm text-[#57534E]">
            <strong className="text-[#1C1917]">Payment:</strong> {order.paymentMethod}
          </div>

          <div className="border-t border-dashed border-[#EAE3D9] pt-3.5">
            <div className="mb-2.5 text-xs font-bold tracking-wider text-[#A8A29E] uppercase">
              Items Ordered
            </div>
            {order.items.map((i, idx) => (
              <div
                key={`${i.dishId}-${idx}`}
                className="mb-1.5 flex justify-between text-xs sm:text-sm text-[#1C1917]"
              >
                <span>
                  <span className="font-code font-bold">{i.qty}×</span> {i.name}
                  {isGroup && (
                    <span className="ml-1.5 text-xs text-[#A8A29E]">({i.ownerName})</span>
                  )}
                </span>
                <span className="font-code font-bold tabular-nums">₹{i.price * i.qty}</span>
              </div>
            ))}

            <div className="mt-3 flex justify-between border-t border-[#EAE3D9] pt-3 text-base font-extrabold text-[#1C1917]">
              <span>Total Paid</span>
              <span className="font-code tabular-nums">₹{order.totals.grandTotal}</span>
            </div>
          </div>

          {isGroup && order.participantShares?.length > 0 && (
            <div className="mt-4 border-t border-dashed border-[#EAE3D9] pt-3.5">
              <div className="mb-2.5 text-[10px] font-bold tracking-[0.14em] text-[#2D5A3C] uppercase">
                Individual Payment Responsibilities (Room {order.roomCode})
              </div>
              <div className="space-y-2">
                {order.participantShares.map((s) => {
                  const canToggle = isCreator || (user && s.userId === user.id);
                  const settled = s.paymentResponsibilityStatus === "settled";
                  return (
                    <div
                      key={s.userId}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#EAE3D9] bg-white px-3.5 py-2.5 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#1C1917]">{s.userName}</span>
                        <span className="ml-2 text-[#A8A29E]">
                          (Items ₹{s.itemsSubtotal} + Fees/GST ₹
                          {s.deliveryShare + s.platformShare + s.gstShare})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-code font-bold text-[#1C1917]">₹{s.totalOwed}</span>
                        <button
                          type="button"
                          disabled={!canToggle}
                          onClick={() => toggleShareSettled(s)}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
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
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/orders"
            className="rounded-full bg-[#C83E2B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#A62F1F]"
          >
            View in My Orders
          </Link>
          <Link
            to="/explore"
            className="rounded-full border border-[#EAE3D9] bg-white px-6 py-3 text-sm font-bold text-[#1C1917] transition hover:border-[#1C1917]"
          >
            Explore More Kitchens
          </Link>
        </div>
      </div>
    </div>
  );
}
