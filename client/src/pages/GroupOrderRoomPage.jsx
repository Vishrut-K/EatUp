import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Copy,
  Crown,
  Link2,
  Lock,
  Sparkles,
  Unlock,
  Users,
  UtensilsCrossed
} from "lucide-react";
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
      showToast(`Room code ${roomCode.toUpperCase()} copied!`);
    } catch {
      showToast("Share code: " + roomCode.toUpperCase());
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Invite link copied! Share with friends.");
    } catch {
      showToast("Share URL: " + window.location.href);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="mx-auto max-w-[600px] px-4 sm:px-6 py-12">
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={`Join Group Table ${roomCode?.toUpperCase()}`}
          subtitle="Sign in to join this live collaborative order, add your dishes, and see your individual split in real time."
          action={
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="rounded-full bg-[#C83E2B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#A62F1F]"
            >
              Sign In to Join Table
            </button>
          }
        />
      </div>
    );
  }

  if (joining) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-12">
        <div className="h-64 animate-pulse rounded-3xl border border-[#EAE3D9] bg-white" />
      </div>
    );
  }

  if (error || !activeRoom) {
    return (
      <div className="mx-auto max-w-[600px] px-4 sm:px-6 py-12">
        <EmptyState
          title="Table Unavailable"
          subtitle={error || "This group order room could not be found."}
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

  const itemsByParticipant = activeRoom.participantBills.map((bill) => ({
    ...bill,
    items: activeRoom.items.filter((i) => i.addedBy?.userId === bill.userId)
  }));

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 pb-24 sm:pb-20">
      {/* Room Header Card */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-[#EAE3D9] bg-white p-6 sm:p-7">
        <div>
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2EC] px-3 py-1 text-[11px] font-bold tracking-wider text-[#2D5A3C] uppercase">
              <Users className="h-3.5 w-3.5" /> Live Group Table
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${
                isLocked
                  ? "bg-[#FDF6E7] text-[#B47B14]"
                  : "bg-[#EAF2EC] text-[#2D5A3C]"
              }`}
            >
              {activeRoom.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-code text-3xl font-bold tracking-wider text-[#1C1917]">
              {activeRoom.roomCode}
            </h1>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE3D9] bg-[#FAF7F2] px-3 py-1.5 text-xs font-bold text-[#57534E] transition hover:border-[#1C1917] hover:text-[#1C1917]"
            >
              <Copy className="h-3.5 w-3.5" /> Copy Code
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE3D9] bg-[#FAF7F2] px-3 py-1.5 text-xs font-bold text-[#57534E] transition hover:border-[#1C1917] hover:text-[#1C1917]"
            >
              <Link2 className="h-3.5 w-3.5" /> Copy Invite
            </button>
          </div>

          <p className="mt-2.5 text-xs sm:text-sm text-[#57534E]">
            Host: <strong className="text-[#1C1917]">{activeRoom.creatorName}</strong> ·{" "}
            {activeRoom.restaurantName ? (
              <>
                Ordering from <strong className="text-[#C83E2B]">{activeRoom.restaurantName}</strong>
              </>
            ) : (
              "No kitchen selected yet — pick any kitchen to begin."
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={
              activeRoom.restaurantId
                ? `/restaurants/${activeRoom.restaurantId}`
                : "/explore"
            }
            className="inline-flex items-center gap-2 rounded-full bg-[#C83E2B] px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition hover:bg-[#A62F1F]"
          >
            <UtensilsCrossed className="h-4 w-4" />
            <span>{activeRoom.restaurantId ? "Add More Dishes" : "Choose Kitchen & Dishes"}</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await leaveRoom();
              navigate("/explore");
            }}
            className="rounded-full border border-[#FBECE9] bg-[#FBECE9] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#C83E2B] transition hover:bg-[#C83E2B] hover:text-white"
          >
            Leave Table
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Left Column: Synchronized Group Cart by Participant */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#EAE3D9] bg-white p-5">
            <h2 className="mb-3 text-xs font-bold tracking-[0.14em] text-[#A8A29E] uppercase">
              At This Table ({activeRoom.participants.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {activeRoom.participants.map((p) => (
                <div
                  key={p.userId}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold ${
                    p.userId === user.id
                      ? "border-[#2D5A3C] bg-[#EAF2EC] text-[#1F422B]"
                      : "border-[#EAE3D9] bg-[#FAF7F2] text-[#1C1917]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      p.isOnline ? "bg-[#2D5A3C]" : "bg-[#A8A29E]"
                    }`}
                  />
                  <span>
                    {p.name}
                    {p.userId === user.id ? " (You)" : ""}
                  </span>
                  {p.isCreator && <Crown className="h-3.5 w-3.5 text-[#D99B26]" title="Table Host" />}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#EAE3D9] bg-white p-6">
            <div className="mb-5 flex items-center justify-between border-b border-[#EAE3D9] pb-3.5">
              <h2 className="font-editorial text-2xl sm:text-3xl text-[#1C1917]">
                Shared Tray ({combined.itemCount} items)
              </h2>
              {isLocked && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B47B14]">
                  <Lock className="h-3.5 w-3.5" /> Locked by host
                </span>
              )}
            </div>

            {activeRoom.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#EAE3D9] bg-[#FAF7F2] p-8 text-center">
                <h3 className="font-editorial mb-1 text-2xl text-[#1C1917]">Group tray is empty</h3>
                <p className="mb-5 text-xs sm:text-sm text-[#57534E]">
                  Anyone at this table can browse a menu and add their dishes here in real time.
                </p>
                <Link
                  to={activeRoom.restaurantId ? `/restaurants/${activeRoom.restaurantId}` : "/explore"}
                  className="inline-block rounded-full bg-[#1C1917] px-6 py-2.5 text-xs font-bold text-[#FAF7F2] transition hover:bg-[#C83E2B]"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {itemsByParticipant.map((person) => {
                  const isMine = person.userId === user.id;
                  return (
                    <div
                      key={person.userId}
                      className={`rounded-2xl border p-4 ${
                        isMine ? "border-[#2D5A3C]/35 bg-[#FAF7F2]" : "border-[#EAE3D9] bg-white"
                      }`}
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-[#EAE3D9] pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1C1917] text-xs font-bold text-white">
                            {person.userName.charAt(0).toUpperCase()}
                          </span>
                          <span className="text-sm font-extrabold text-[#1C1917]">
                            {person.userName} {isMine ? "(You)" : ""}
                          </span>
                          {person.isCreator && (
                            <span className="rounded-full bg-[#FDF6E7] px-2 py-0.5 text-[10px] font-bold text-[#B47B14] uppercase">
                              Host
                            </span>
                          )}
                        </div>
                        <div className="font-code text-xs font-bold text-[#2D5A3C]">
                          Share: ₹{person.totalOwed}
                        </div>
                      </div>

                      {person.items.length === 0 ? (
                        <p className="text-xs italic text-[#A8A29E]">No dishes added yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {person.items.map((item) => (
                            <div
                              key={`${person.userId}-${item.dishId}`}
                              className="flex items-center justify-between gap-3"
                            >
                              <DietBadge isVeg={item.isVeg} />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-[#1C1917]">
                                  {item.name}
                                </div>
                                <div className="font-code text-xs text-[#57534E]">₹{item.price} each</div>
                              </div>
                              {isMine && !isLocked ? (
                                <QtyStepper
                                  qty={item.qty}
                                  onDecrease={() => updateRoomItemQty(item.dishId, -1)}
                                  onIncrease={() => updateRoomItemQty(item.dishId, 1)}
                                />
                              ) : (
                                <span className="font-code rounded-full bg-[#F3EDE2] px-2.5 py-1 text-xs font-bold text-[#57534E]">
                                  × {item.qty}
                                </span>
                              )}
                              <div className="font-code min-w-[54px] text-right text-sm font-bold text-[#1C1917] tabular-nums">
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

        {/* Right Column: Individual Bill + Combined Group Bill */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-[#2D5A3C]/30 bg-white p-6">
            <span className="mb-1 block text-[10px] font-bold tracking-[0.14em] text-[#2D5A3C] uppercase">
              Personal Responsibility
            </span>
            <h2 className="font-editorial mb-1 text-2xl text-[#1C1917]">Your Individual Bill</h2>
            <p className="mb-4 text-xs text-[#57534E]">
              Your dishes + proportional share of delivery, platform fee &amp; 5% GST
            </p>

            <div className="space-y-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] p-4 text-sm">
              <div className="flex justify-between text-[#57534E]">
                <span>Your Items ({myBill?.itemCount || 0})</span>
                <span className="font-code tabular-nums">₹{myBill?.itemsSubtotal || 0}</span>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <span>Delivery Share</span>
                <span className="font-code tabular-nums">₹{myBill?.deliveryShare || 0}</span>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <span>Platform Share</span>
                <span className="font-code tabular-nums">₹{myBill?.platformShare || 0}</span>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <span>GST Share (5%)</span>
                <span className="font-code tabular-nums">₹{myBill?.gstShare || 0}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-[#EAE3D9] pt-2.5 text-base font-extrabold text-[#2D5A3C]">
                <span>Your Total</span>
                <span className="font-code tabular-nums">₹{myBill?.totalOwed || 0}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EAE3D9] bg-white p-6">
            <span className="mb-1 block text-[10px] font-bold tracking-[0.14em] text-[#A8A29E] uppercase">
              Combined Kitchen Ticket
            </span>
            <h2 className="font-editorial mb-4 text-2xl text-[#1C1917]">Group Order Total</h2>

            {combined.subtotal > 0 && combined.subtotal < 400 && (
              <div className="mb-4 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] px-3.5 py-2.5 text-xs font-medium text-[#57534E]">
                Group needs <strong className="text-[#C83E2B]">₹{400 - combined.subtotal}</strong> more for{" "}
                <strong className="text-[#1C1917]">FREE Delivery!</strong>
              </div>
            )}
            {combined.subtotal >= 400 && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#2D5A3C]/20 bg-[#EAF2EC] px-3.5 py-2.5 text-xs font-bold text-[#2D5A3C]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Group unlocked FREE Delivery!</span>
              </div>
            )}

            <div className="space-y-2 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] p-4 text-sm">
              <div className="flex justify-between text-[#57534E]">
                <span>Combined Subtotal</span>
                <span className="font-code tabular-nums">₹{combined.subtotal}</span>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <span>Delivery Partner Fee</span>
                <span className="font-code tabular-nums">
                  {combined.deliveryFee === 0 ? (
                    <span className="font-bold text-[#2D5A3C]">FREE</span>
                  ) : (
                    `₹${combined.deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <span>Platform Fee</span>
                <span className="font-code tabular-nums">₹{combined.platformFee}</span>
              </div>
              <div className="flex justify-between text-[#57534E]">
                <span>GST (5%)</span>
                <span className="font-code tabular-nums">₹{combined.gst}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-[#EAE3D9] pt-2.5 text-base font-extrabold text-[#1C1917]">
                <span>Combined Total</span>
                <span className="font-code tabular-nums">₹{combined.grandTotal}</span>
              </div>
            </div>

            {isCreator ? (
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  disabled={activeRoom.items.length === 0}
                  onClick={() => toggleLock(!isLocked)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-[#EAE3D9] bg-white py-2.5 text-xs font-bold text-[#1C1917] transition hover:border-[#1C1917] disabled:opacity-50"
                >
                  {isLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  <span>{isLocked ? "Unlock Tray for Edits" : "Lock Tray Before Checkout"}</span>
                </button>

                <button
                  type="button"
                  disabled={activeRoom.items.length === 0}
                  onClick={() => navigate(`/checkout?mode=group&roomCode=${activeRoom.roomCode}`)}
                  className="w-full rounded-full bg-[#C83E2B] py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#A62F1F] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Finalize Group Order (₹{combined.grandTotal})
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-[#EAE3D9] bg-[#FAF7F2] p-3.5 text-center text-xs font-semibold text-[#57534E]">
                Waiting for host <strong className="text-[#1C1917]">{activeRoom.creatorName}</strong> to finalize the combined order.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
