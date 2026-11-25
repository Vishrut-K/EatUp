import { Link } from "react-router-dom";
import { Users, Lock } from "lucide-react";
import { useGroupOrder } from "../../context/GroupOrderContext";

export function GroupOrderBanner() {
  const { activeRoom, myBill, leaveRoom } = useGroupOrder();

  if (!activeRoom) return null;

  return (
    <div className="border-b border-[#0D7A53]/20 bg-[#EBF7F1]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-5 py-2.5 text-sm">
        <div className="flex flex-wrap items-center gap-2.5 text-[#086041]">
          <Users className="h-4 w-4 shrink-0" />
          <span className="font-extrabold">
            Group Order Active · Room <span className="rounded bg-white px-2 py-0.5 font-mono">{activeRoom.roomCode}</span>
          </span>
          {activeRoom.restaurantName && (
            <span className="text-xs font-semibold text-[#4B5563]">
              ({activeRoom.restaurantName})
            </span>
          )}
          {activeRoom.status === "locked" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF7EE] px-2.5 py-0.5 text-xs font-extrabold text-[#D9822B]">
              <Lock className="h-3 w-3" /> Locked for checkout
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {myBill && (
            <span className="text-xs font-bold text-[#111827]">
              Your Share: <strong className="text-[#0D7A53]">₹{myBill.totalOwed}</strong> · Group Total:{" "}
              <strong>₹{activeRoom.combinedTotals?.grandTotal || 0}</strong>
            </span>
          )}
          <Link
            to={`/group/${activeRoom.roomCode}`}
            className="rounded-full bg-[#0D7A53] px-3.5 py-1 text-xs font-extrabold text-white transition hover:bg-[#086041]"
          >
            Open Group Room
          </Link>
          <button
            type="button"
            onClick={leaveRoom}
            className="text-xs font-bold text-[#B91C1C] hover:underline"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
