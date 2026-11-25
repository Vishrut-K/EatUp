import { Link } from "react-router-dom";
import { FALLBACK_FOOD_IMG } from "../../utils/constants";
import { RatingBadge } from "../common/RatingBadge";

export function RestaurantCard({ restaurant }) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group flex flex-col overflow-hidden rounded-[18px] border border-[#E5EBE7] bg-white transition-all duration-200 hover:-translate-y-1.5 hover:border-[#0D7A53]/40 hover:shadow-[0_16px_32px_-4px_rgba(13,122,83,0.16)]"
    >
      <div className="relative h-[200px] overflow-hidden bg-[#F0F4F1]">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_FOOD_IMG;
          }}
          className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-105"
        />
        {restaurant.discountBadge && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-lg bg-slate-900/85 px-2.5 py-1 text-xs font-extrabold text-white backdrop-blur-md">
            <span>🏷️</span>
            <span>{restaurant.discountBadge}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="text-xl leading-snug font-extrabold text-[#111827]">{restaurant.name}</h3>
          <RatingBadge rating={restaurant.rating} />
        </div>

        <p className="mb-3.5 truncate text-sm text-[#4B5563]">{restaurant.cuisine.join(", ")}</p>

        <div className="mt-auto flex items-center justify-between border-t border-dashed border-[#E5EBE7] pt-3.5 text-[0.85rem] font-bold text-[#4B5563]">
          <span className="flex items-center gap-1.5">⏱️ {restaurant.deliveryTime}</span>
          <span className="flex items-center gap-1.5">💳 {restaurant.priceForTwo}</span>
        </div>
      </div>
    </Link>
  );
}
