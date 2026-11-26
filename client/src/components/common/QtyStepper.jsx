import { Minus, Plus } from "lucide-react";

export function QtyStepper({ qty, onDecrease, onIncrease, disabled = false }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border border-[#1C1917] bg-[#1C1917] font-bold text-white shadow-sm">
      <button
        type="button"
        disabled={disabled}
        onClick={onDecrease}
        className="flex h-8 w-8 items-center justify-center transition hover:bg-white/15 disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="font-code min-w-[26px] text-center text-xs font-bold tabular-nums">{qty}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrease}
        className="flex h-8 w-8 items-center justify-center transition hover:bg-white/15 disabled:opacity-50"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
