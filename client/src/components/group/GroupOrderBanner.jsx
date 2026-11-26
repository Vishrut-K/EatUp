import { Link } from "react-router-dom";
import { Lock, Users } from "lucide-react";
import { useGroupOrder } from "../../context/GroupOrderContext";

export function GroupOrderBanner() {
  const { activeRoom, myBill, leaveRoom } = useGroupOrder();

  if (!activeRoom) return null;

  return (
    <div className="border-b border-[#2D5A3C]/20 bg-[#EAF2EC]">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2.5 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-2.5 text-[#1F422B]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2D5A3C] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2D5A3C]" />
          </span>
          <Users className="h-4 w-4 shrink-0" />
          <span className="font-bold">
            Live Group Table ·{" "}
            <span className="font-code rounded-md border border-[#2D5A3C]/20 bg-white px-2 py-0.5 text-xs font-bold">
              {activeRoom.roomCode}
            </span>
          </span>
          {activeRoom.restaurantName && (
            <span className="hidden md:inline text-xs font-medium text-[#57534E]">
              ({activeRoom.restaurantName})
            </span>
          )}
          {activeRoom.status === "locked" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF6E7] px-2.5 py-0.5 text-[11px] font-bold text-[#D99B26]">
              <Lock className="h-3 w-3" /> Locked
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {myBill && (
            <span className="text-xs font-semibold text-[#1C1917]">
              Your Share: <strong className="font-code text-[#2D5A3C]">₹{myBill.totalOwed}</strong>
              <span className="hidden sm:inline text-[#57534E]">
                {" "}
                · Total: <strong className="font-code text-[#1C1917]">₹{activeRoom.combinedTotals?.grandTotal || 0}</strong>
              </span>
            </span>
          )}
          <Link
            to={`/group/${activeRoom.roomCode}`}
            className="rounded-full bg-[#2D5A3C] px-3.5 py-1 text-xs font-bold text-white transition hover:bg-[#1F422B]"
          >
            Open Table
          </Link>
          <button
            type="button"
            onClick={leaveRoom}
            className="text-xs font-bold text-[#C83E2B] hover:underline"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
