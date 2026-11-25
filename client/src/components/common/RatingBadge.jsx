export function RatingBadge({ rating }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#0D7A53] px-2 py-0.5 text-[0.85rem] font-extrabold text-white">
      ★ {rating}
    </span>
  );
}
