import { UtensilsCrossed } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useGroupOrder } from "../../context/GroupOrderContext";

export function ConflictModal() {
  const { pendingConflict, resolveConflictReplace, cancelConflict } = useCart();
  const { groupConflict, resolveGroupConflictReplace, cancelGroupConflict } = useGroupOrder();

  const active = pendingConflict || groupConflict;
  if (!active) return null;

  const isGroup = Boolean(groupConflict);
  const canReplace = !isGroup || groupConflict.isCreator;

  const handleCancel = isGroup ? cancelGroupConflict : cancelConflict;
  const handleConfirm = isGroup ? resolveGroupConflictReplace : resolveConflictReplace;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#1C1917]/65 p-4 backdrop-blur-xs">
      <div className="w-full max-w-[440px] rounded-3xl border border-[#EAE3D9] bg-[#FAF7F2] p-7 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FBECE9] text-[#C83E2B]">
          <UtensilsCrossed className="h-5 w-5" />
        </div>
        <h3 className="font-editorial mb-2 text-3xl text-[#1C1917]">
          {isGroup ? "Switch group kitchen?" : "Start a fresh tray?"}
        </h3>
        <p className="text-sm leading-relaxed text-[#57534E]">
          {isGroup ? (
            <>
              Your group table currently has dishes from <strong className="text-[#1C1917]">{active.existingRestaurant}</strong>.
              <br />
              <br />
              {canReplace
                ? `As the table host, would you like to clear the group tray and switch to ${active.newRestaurant}?`
                : `Only the table host can switch kitchens from ${active.existingRestaurant} to ${active.newRestaurant}.`}
            </>
          ) : (
            <>
              Your tray currently holds dishes from <strong className="text-[#1C1917]">{active.existingRestaurant}</strong>.
              <br />
              <br />
              Would you like to clear those and start fresh from{" "}
              <strong className="text-[#1C1917]">{active.newRestaurant}</strong>?
            </>
          )}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-full border border-[#EAE3D9] bg-white px-5 py-2.5 text-sm font-bold text-[#1C1917] transition hover:border-[#1C1917]"
          >
            {canReplace ? "Keep Current" : "Got It"}
          </button>
          {canReplace && (
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-full bg-[#C83E2B] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#A62F1F]"
            >
              Start Fresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
