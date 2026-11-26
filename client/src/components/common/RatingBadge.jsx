import { Star } from "lucide-react";

export function RatingBadge({ rating }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#2D5A3C] px-2.5 py-1 text-xs font-bold text-white tabular-nums">
      <Star className="h-3 w-3 fill-current" />
      <span>{rating}</span>
    </span>
  );
}
