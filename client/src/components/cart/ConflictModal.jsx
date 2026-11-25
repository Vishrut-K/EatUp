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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/65 p-5 backdrop-blur-xs">
      <div className="w-full max-w-[440px] rounded-[18px] bg-white p-7 text-center shadow-2xl">
        <div className="mb-3 text-5xl">🍲</div>
        <h3 className="mb-2 text-2xl font-extrabold text-[#111827]">
          {isGroup ? "Group order restaurant mismatch" : "Replace cart items?"}
        </h3>
        <p className="text-sm leading-relaxed text-[#4B5563]">
          {isGroup ? (
            <>
              Your group room currently has items from <strong>{active.existingRestaurant}</strong>.
              <br />
              <br />
              {canReplace
                ? `As the room host, would you like to clear the group cart and start fresh from ${active.newRestaurant}?`
                : `Only the room host can switch restaurants from ${active.existingRestaurant} to ${active.newRestaurant}.`}
            </>
          ) : (
            <>
              Your cart contains delicious food from <strong>{active.existingRestaurant}</strong>.
              <br />
              <br />
              Would you like to discard those and start a fresh order from{" "}
              <strong>{active.newRestaurant}</strong>?
            </>
          )}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-full border border-[#E5EBE7] bg-white px-5 py-2.5 text-sm font-bold text-[#111827] transition hover:bg-[#F7FAF8]"
          >
            {canReplace ? "Cancel" : "Got It"}
          </button>
          {canReplace && (
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-95"
            >
              Start Fresh Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
