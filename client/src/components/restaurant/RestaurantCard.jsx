import { Link } from "react-router-dom";
import { Clock, Tag } from "lucide-react";
import { FALLBACK_FOOD_IMG } from "../../utils/constants";
import { RatingBadge } from "../common/RatingBadge";

export function RestaurantCard({ restaurant }) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#EAE3D9] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#C83E2B]/40 hover:shadow-[0_20px_36px_-12px_rgba(28,25,23,0.12)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F3EDE2]">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_FOOD_IMG;
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1C1917]/65 via-transparent to-transparent" />
        {restaurant.discountBadge && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-[#FAF7F2]/95 px-3 py-1 text-[11px] font-bold tracking-wide text-[#C83E2B] shadow-sm backdrop-blur-xs">
            <Tag className="h-3 w-3 shrink-0" />
            <span>{restaurant.discountBadge}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1.5 flex items-start justify-between gap-3">
          <h3 className="font-editorial text-2xl leading-tight tracking-tight text-[#1C1917] transition-colors group-hover:text-[#C83E2B]">
            {restaurant.name}
          </h3>
          <RatingBadge rating={restaurant.rating} />
        </div>

        <p className="mb-4 truncate text-xs font-medium text-[#57534E]">
          {restaurant.cuisine.join(" · ")}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-dashed border-[#EAE3D9] pt-3.5 text-xs font-semibold text-[#57534E]">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#C83E2B]" />
            {restaurant.deliveryTime}
          </span>
          <span className="font-code text-[#1C1917]">{restaurant.priceForTwo}</span>
        </div>
      </div>
    </Link>
  );
}
