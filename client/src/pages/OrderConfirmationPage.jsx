import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
      showToast(err?.response?.data?.message || "Could not update payment status.", "⚠️");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[620px] px-5 py-16">
        <div className="h-96 animate-pulse rounded-3xl border border-[#E5EBE7] bg-white" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-[620px] px-5 py-16 text-center">
        <h2 className="mb-2 text-2xl font-extrabold text-[#111827]">Order Receipt Not Found</h2>
        <p className="mb-6 text-sm text-[#4B5563]">
          Sign in with the account that placed or participated in this order to view its receipt.
        </p>
        <Link
          to="/orders"
          className="inline-block rounded-full bg-[#0D7A53] px-6 py-2.5 text-sm font-bold text-white"
        >
          Go to My Orders
        </Link>
      </div>
    );
  }

  const isGroup = order.orderType === "group";
  const isCreator = user && order.placedByUserId === user.id;

  return (
    <div className="px-5 py-14">
      <div className="mx-auto max-w-[640px] rounded-3xl border border-[#E5EBE7] bg-white p-8 sm:p-10 text-center shadow-xl">
        <div className="animate-pulse-success mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#DCFCE7] text-4xl text-[#16A34A]">
          ✓
        </div>

        <h1 className="mb-2 text-3xl font-extrabold text-[#111827]">
          {isGroup ? "Group Order Placed Successfully!" : "Order Placed Successfully!"}
        </h1>
        <p className="mb-6 text-base text-[#4B5563]">
          Thank you for ordering with EatUp! Your meal from{" "}
          <strong>{order.restaurantName}</strong> is being prepared fresh.
        </p>

        <div className="mb-7 rounded-xl border border-dashed border-[#E5EBE7] bg-[#F7FAF8] p-5 text-left">
          <div className="mb-3 flex justify-between border-b border-[#E5EBE7] pb-2.5">
            <div>
              <div className="text-xs font-bold text-[#8E9BAE]">ORDER ID</div>
              <div className="text-lg font-extrabold text-[#0D7A53]">{order.orderNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-[#8E9BAE]">ESTIMATED ARRIVAL</div>
              <div className="text-lg font-extrabold text-[#0D7A53]">30-35 mins</div>
            </div>
          </div>

          <div className="mb-2 text-sm text-[#4B5563]">
            <strong>Delivering to:</strong> {order.deliveryAddress}
          </div>
          <div className="mb-3.5 text-sm text-[#4B5563]">
            <strong>Payment Method:</strong> {order.paymentMethod}
          </div>

          <div className="border-t border-dashed border-[#E5EBE7] pt-3">
            <div className="mb-2 text-sm font-bold text-[#111827]">Items Ordered:</div>
            {order.items.map((i, idx) => (
              <div
                key={`${i.dishId}-${idx}`}
                className="mb-1 flex justify-between text-[0.85rem] text-[#111827]"
              >
                <span>
                  {i.qty} × {i.name}
                  {isGroup && (
                    <span className="ml-1.5 text-xs text-[#8E9BAE]">({i.ownerName})</span>
                  )}
                </span>
                <span className="font-bold">₹{i.price * i.qty}</span>
              </div>
            ))}

            <div className="mt-2.5 flex justify-between border-t border-[#E5EBE7] pt-2.5 text-base font-extrabold text-[#111827]">
              <span>Combined Total</span>
              <span>₹{order.totals.grandTotal}</span>
            </div>
          </div>

          {isGroup && order.participantShares?.length > 0 && (
            <div className="mt-4 border-t border-dashed border-[#E5EBE7] pt-3">
              <div className="mb-2 text-xs font-extrabold uppercase text-[#0D7A53]">
                Individual Payment Responsibilities (Room {order.roomCode})
              </div>
              <div className="space-y-2">
                {order.participantShares.map((s) => {
                  const canToggle = isCreator || (user && s.userId === user.id);
                  const settled = s.paymentResponsibilityStatus === "settled";
                  return (
                    <div
                      key={s.userId}
                      className="flex items-center justify-between rounded-lg border border-[#E5EBE7] bg-white px-3 py-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#111827]">{s.userName}</span>
                        <span className="ml-2 text-[#8E9BAE]">
                          (Items ₹{s.itemsSubtotal} + Fees/GST ₹
                          {s.deliveryShare + s.platformShare + s.gstShare})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#111827]">₹{s.totalOwed}</span>
                        <button
                          type="button"
                          disabled={!canToggle}
                          onClick={() => toggleShareSettled(s)}
                          className={`rounded-full px-2.5 py-0.5 font-extrabold transition ${
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
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/orders"
            className="rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-95"
          >
            View in My Orders
          </Link>
          <Link
            to="/explore"
            className="rounded-full border border-[#E5EBE7] bg-white px-6 py-2.5 text-sm font-bold text-[#111827] transition hover:bg-[#F7FAF8]"
          >
            Order Something Else
          </Link>
        </div>
      </div>
    </div>
  );
}
