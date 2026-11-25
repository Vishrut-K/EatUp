import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Copy, Crown, Lock, Unlock, Users, UtensilsCrossed } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useGroupOrder } from "../context/GroupOrderContext";
import { useToast } from "../context/ToastContext";
import { DietBadge } from "../components/common/DietBadge";
import { QtyStepper } from "../components/common/QtyStepper";
import { EmptyState } from "../components/common/EmptyState";

export function GroupOrderRoomPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user, authLoading, openAuthModal } = useAuth();
  const {
    activeRoom,
    isCreator,
    myBill,
    joinRoom,
    leaveRoom,
    updateRoomItemQty,
    toggleLock
  } = useGroupOrder();
  const { showToast } = useToast();

  const [error, setError] = useState("");
  const [joining, setJoining] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setJoining(false);
      return;
    }

    let active = true;
    const normalized = (roomCode || "").toUpperCase().trim();
    if (activeRoom?.roomCode === normalized) {
      setJoining(false);
      return;
    }

    setJoining(true);
    joinRoom(normalized)
      .then((room) => {
        if (active && room?.status === "finalized" && room.finalOrderNumber) {
          navigate(`/confirmation/${room.finalOrderNumber}`, { replace: true });
        }
      })
      .catch((err) => {
        if (active) {
          setError(err?.response?.data?.message || "Could not load group room.");
        }
      })
      .finally(() => {
        if (active) setJoining(false);
      });

    return () => {
      active = false;
    };
  }, [authLoading, user, roomCode, activeRoom?.roomCode, joinRoom, navigate]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode.toUpperCase());
      showToast(`Room code ${roomCode.toUpperCase()} copied!`, "📋");
    } catch {
      showToast("Copy failed. Share code: " + roomCode.toUpperCase());
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Invite link copied! Share with friends.", "🔗");
    } catch {
      showToast("Share URL: " + window.location.href);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-[600px] px-5 py-12">
        <EmptyState
          icon="👥"
          title={`Join Group Order ${roomCode?.toUpperCase()}`}
          subtitle="Sign in to join this collaborative order, add your dishes, and see your individual bill split in real time."
          action={
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] px-6 py-2.5 text-sm font-bold text-white"
            >
              Sign In to Join Room
            </button>
          }
        />
      </div>
    );
  }

  if (joining) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 py-12">
        <div className="h-64 animate-pulse rounded-[18px] border border-[#E5EBE7] bg-white" />
      </div>
    );
  }

  if (error || !activeRoom) {
    return (
      <div className="mx-auto max-w-[600px] px-5 py-12">
        <EmptyState
          icon="😕"
          title="Room Unavailable"
          subtitle={error || "This group order room could not be found."}
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
    );
  }

  const combined = activeRoom.combinedTotals || {
    itemCount: 0,
    subtotal: 0,
    deliveryFee: 0,
    platformFee: 0,
    gst: 0,
    grandTotal: 0
  };
  const isLocked = activeRoom.status === "locked";

  // Group items by participant
  const itemsByParticipant = activeRoom.participantBills.map((bill) => ({
    ...bill,
    items: activeRoom.items.filter((i) => i.addedBy?.userId === bill.userId)
  }));

  return (
    <div className="mx-auto max-w-[1240px] px-5 py-9 pb-20">
      {/* Room Header Card */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5 rounded-[18px] border border-[#E5EBE7] bg-white p-6 shadow-xs">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF7F1] px-3 py-1 text-xs font-extrabold text-[#0D7A53]">
              <Users className="h-3.5 w-3.5" /> LIVE GROUP ROOM
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                isLocked
                  ? "bg-[#FEF7EE] text-[#D9822B]"
                  : "bg-[#DCFCE7] text-[#15803D]"
              }`}
            >
              {activeRoom.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-3xl font-extrabold tracking-wider text-[#111827]">
              {activeRoom.roomCode}
            </h1>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 rounded-full border border-[#E5EBE7] bg-[#F7FAF8] px-3 py-1 text-xs font-bold text-[#4B5563] hover:border-[#0D7A53] hover:text-[#0D7A53]"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Code
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 rounded-full border border-[#E5EBE7] bg-[#F7FAF8] px-3 py-1 text-xs font-bold text-[#4B5563] hover:border-[#0D7A53] hover:text-[#0D7A53]"
            >
              🔗 Copy Invite Link
            </button>
          </div>

          <p className="mt-2 text-sm text-[#4B5563]">
            Host: <strong>{activeRoom.creatorName}</strong> ·{" "}
            {activeRoom.restaurantName ? (
              <>
                Ordering from <strong className="text-[#0D7A53]">{activeRoom.restaurantName}</strong>
              </>
            ) : (
              "No restaurant selected yet — pick any restaurant to start!"
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={
              activeRoom.restaurantId
                ? `/restaurants/${activeRoom.restaurantId}`
                : "/explore"
            }
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:opacity-95"
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>{activeRoom.restaurantId ? "Add More Dishes" : "Choose Restaurant & Dishes"}</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await leaveRoom();
              navigate("/explore");
            }}
            className="rounded-full border border-red-200 bg-[#FEE2E2] px-4 py-2.5 text-sm font-bold text-[#B91C1C] transition hover:bg-red-200/70"
          >
            Leave Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Left Column: Synchronized Group Cart by Participant */}
        <div className="space-y-5">
          {/* Participants Strip */}
          <div className="rounded-[18px] border border-[#E5EBE7] bg-white p-5">
            <h2 className="mb-3 text-base font-extrabold text-[#111827]">
              Participants ({activeRoom.participants.length})
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {activeRoom.participants.map((p) => (
                <div
                  key={p.userId}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${
                    p.userId === user.id
                      ? "border-[#0D7A53] bg-[#EBF7F1] text-[#086041]"
                      : "border-[#E5EBE7] bg-[#F7FAF8] text-[#111827]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      p.isOnline ? "bg-[#15803D]" : "bg-[#8E9BAE]"
                    }`}
                  />
                  <span>
                    {p.name}
                    {p.userId === user.id ? " (You)" : ""}
                  </span>
                  {p.isCreator && <Crown className="h-3.5 w-3.5 text-[#D9822B]" title="Room Host" />}
                </div>
              ))}
            </div>
          </div>

          {/* Synchronized Items Grouped by Person */}
          <div className="rounded-[18px] border border-[#E5EBE7] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#111827]">
                Shared Cart ({combined.itemCount} items)
              </h2>
              {isLocked && (
                <span className="text-xs font-bold text-[#D9822B]">
                  🔒 Cart locked by host
                </span>
              )}
            </div>

            {activeRoom.items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E5EBE7] bg-[#F7FAF8] p-8 text-center">
                <div className="mb-2 text-4xl">🍽️</div>
                <h3 className="mb-1 text-lg font-extrabold text-[#111827]">Group cart is empty</h3>
                <p className="mb-4 text-sm text-[#4B5563]">
                  Anyone in this room can browse a menu and add their dishes here in real time.
                </p>
                <Link
                  to={activeRoom.restaurantId ? `/restaurants/${activeRoom.restaurantId}` : "/explore"}
                  className="inline-block rounded-full bg-[#0D7A53] px-5 py-2 text-sm font-bold text-white"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {itemsByParticipant.map((person) => {
                  const isMine = person.userId === user.id;
                  return (
                    <div
                      key={person.userId}
                      className={`rounded-xl border p-4 ${
                        isMine ? "border-[#0D7A53]/35 bg-[#F7FAF8]" : "border-[#E5EBE7] bg-white"
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#E5EBE7] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D7A53] text-xs font-extrabold text-white">
                            {person.userName.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-extrabold text-[#111827]">
                            {person.userName} {isMine ? "(You)" : ""}
                          </span>
                          {person.isCreator && (
                            <span className="rounded-full bg-[#FEF7EE] px-2 py-0.5 text-[0.7rem] font-extrabold text-[#D9822B]">
                              Host
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-extrabold text-[#0D7A53]">
                          Individual Share: ₹{person.totalOwed}
                        </div>
                      </div>

                      {person.items.length === 0 ? (
                        <p className="text-xs italic text-[#8E9BAE]">No dishes added yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {person.items.map((item) => (
                            <div
                              key={`${person.userId}-${item.dishId}`}
                              className="flex items-center justify-between gap-3"
                            >
                              <DietBadge isVeg={item.isVeg} />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-[#111827]">
                                  {item.name}
                                </div>
                                <div className="text-xs text-[#4B5563]">₹{item.price} each</div>
                              </div>
                              {isMine && !isLocked ? (
                                <QtyStepper
                                  qty={item.qty}
                                  onDecrease={() => updateRoomItemQty(item.dishId, -1)}
                                  onIncrease={() => updateRoomItemQty(item.dishId, 1)}
                                />
                              ) : (
                                <span className="rounded-md bg-[#F0F4F1] px-2.5 py-1 text-xs font-extrabold text-[#4B5563]">
                                  × {item.qty}
                                </span>
                              )}
                              <div className="min-w-[52px] text-right text-sm font-extrabold text-[#111827]">
                                ₹{item.price * item.qty}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Individual Bill + Combined Group Bill + Host Actions */}
        <div className="space-y-5">
          {/* Individual Bill Card */}
          <div className="rounded-[18px] border-2 border-[#0D7A53]/25 bg-white p-6 shadow-xs">
            <h2 className="mb-1 text-lg font-extrabold text-[#111827]">Your Individual Bill</h2>
            <p className="mb-4 text-xs text-[#4B5563]">
              Your dishes + proportional share of delivery, platform fee &amp; 5% GST
            </p>

            <div className="space-y-2 rounded-xl border border-[#E5EBE7] bg-[#F7FAF8] p-4 text-sm">
              <div className="flex justify-between text-[#4B5563]">
                <span>Your Items ({myBill?.itemCount || 0})</span>
                <span>₹{myBill?.itemsSubtotal || 0}</span>
              </div>
              <div className="flex justify-between text-[#4B5563]">
                <span>Delivery Fee Share</span>
                <span>₹{myBill?.deliveryShare || 0}</span>
              </div>
              <div className="flex justify-between text-[#4B5563]">
                <span>Platform Fee Share</span>
                <span>₹{myBill?.platformShare || 0}</span>
              </div>
              <div className="flex justify-between text-[#4B5563]">
                <span>GST Share (5%)</span>
                <span>₹{myBill?.gstShare || 0}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-[#E5EBE7] pt-2.5 text-base font-extrabold text-[#0D7A53]">
                <span>Your Total Responsibility</span>
                <span>₹{myBill?.totalOwed || 0}</span>
              </div>
            </div>
          </div>

          {/* Combined Restaurant Bill Card */}
          <div className="rounded-[18px] border border-[#E5EBE7] bg-white p-6 shadow-xs">
            <h2 className="mb-4 text-lg font-extrabold text-[#111827]">Combined Order Bill</h2>

            {combined.subtotal > 0 && combined.subtotal < 400 && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                💡 Group needs <strong>₹{400 - combined.subtotal}</strong> more for{" "}
                <strong>FREE Delivery!</strong>
              </div>
            )}
            {combined.subtotal >= 400 && (
              <div className="mb-4 rounded-lg border border-green-200 bg-[#DCFCE7] px-3 py-2 text-xs text-[#15803D]">
                🎉 Group unlocked <strong>FREE Delivery!</strong>
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-[#E5EBE7] bg-[#F7FAF8] p-4 text-sm">
              <div className="flex justify-between text-[#4B5563]">
                <span>Combined Subtotal</span>
                <span>₹{combined.subtotal}</span>
              </div>
              <div className="flex justify-between text-[#4B5563]">
                <span>Delivery Partner Fee</span>
                <span>
                  {combined.deliveryFee === 0 ? (
                    <span className="font-extrabold text-[#0D7A53]">FREE</span>
                  ) : (
                    `₹${combined.deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[#4B5563]">
                <span>Platform Fee</span>
                <span>₹{combined.platformFee}</span>
              </div>
              <div className="flex justify-between text-[#4B5563]">
                <span>Government Taxes &amp; GST (5%)</span>
                <span>₹{combined.gst}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-[#E5EBE7] pt-2.5 text-base font-extrabold text-[#111827]">
                <span>Combined Grand Total</span>
                <span>₹{combined.grandTotal}</span>
              </div>
            </div>

            {isCreator ? (
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  disabled={activeRoom.items.length === 0}
                  onClick={() => toggleLock(!isLocked)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#E5EBE7] bg-white py-2.5 text-sm font-bold text-[#111827] transition hover:bg-[#F7FAF8] disabled:opacity-50"
                >
                  {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  <span>{isLocked ? "Unlock Cart for Edits" : "Lock Cart Before Checkout"}</span>
                </button>

                <button
                  type="button"
                  disabled={activeRoom.items.length === 0}
                  onClick={() => navigate(`/checkout?mode=group&roomCode=${activeRoom.roomCode}`)}
                  className="w-full rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] py-3.5 text-base font-extrabold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Finalize Combined Order (₹{combined.grandTotal})
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[#F7FAF8] p-3.5 text-center text-xs font-semibold text-[#4B5563]">
                Waiting for host <strong>{activeRoom.creatorName}</strong> to finalize the combined restaurant order.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
