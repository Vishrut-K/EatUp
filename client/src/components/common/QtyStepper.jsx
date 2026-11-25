export function QtyStepper({ qty, onDecrease, onIncrease, disabled = false }) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg bg-[#0D7A53] font-extrabold text-white shadow-md">
      <button
        type="button"
        disabled={disabled}
        onClick={onDecrease}
        className="px-3 py-2 text-base transition hover:bg-black/15 disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[24px] text-center text-sm">{qty}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrease}
        className="px-3 py-2 text-base transition hover:bg-black/15 disabled:opacity-50"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
