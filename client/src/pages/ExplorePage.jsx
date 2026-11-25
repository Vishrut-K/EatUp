import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { restaurantApi } from "../api/restaurantApi";
import { CATEGORIES } from "../utils/constants";
import { DietBadge } from "../components/common/DietBadge";
import { EmptyState } from "../components/common/EmptyState";
import { RestaurantCard } from "../components/restaurant/RestaurantCard";

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [vegOnly, setVegOnly] = useState(false);
  const [highRating, setHighRating] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);
  const [sortOption, setSortOption] = useState("relevance");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qParam = searchParams.get("q") || "";
    const catParam = searchParams.get("category") || "all";
    setSearchQuery(qParam);
    setActiveCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = {};
    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (activeCategory && activeCategory !== "all") params.category = activeCategory;
    if (vegOnly) params.vegOnly = "true";
    if (highRating) params.minRating = "4.5";
    if (fastDelivery) params.maxTime = "25";
    if (sortOption !== "relevance") params.sort = sortOption;

    restaurantApi
      .getAll(params)
      .then((res) => {
        if (active) setRestaurants(res.restaurants || []);
      })
      .catch(() => {
        if (active) setRestaurants([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [searchQuery, activeCategory, vegOnly, highRating, fastDelivery, sortOption]);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    const next = new URLSearchParams(searchParams);
    if (catId === "all") next.delete("category");
    else next.set("category", catId);
    setSearchParams(next, { replace: true });
  };

  const handleSearchInput = (val) => {
    setSearchQuery(val);
    const next = new URLSearchParams(searchParams);
    if (val.trim()) next.set("q", val);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setVegOnly(false);
    setHighRating(false);
    setFastDelivery(false);
    setSortOption("relevance");
    setSearchParams({}, { replace: true });
  };

  return (
    <div>
      {/* Sticky Filter & Sort Bar */}
      <div className="sticky top-16 md:top-[74px] z-[90] border-b border-[#E5EBE7] bg-white pt-4.5 pb-1 shadow-xs">
        <div className="mx-auto max-w-[1240px] px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative min-w-[240px] flex-1 max-w-[440px]">
              <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#8E9BAE]">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search restaurant name, cuisine or food item..."
                className="w-full rounded-full border border-[#E5EBE7] bg-[#F7FAF8] py-2.5 pr-4 pl-10 text-sm outline-none transition focus:border-[#0D7A53] focus:bg-white focus:ring-3 focus:ring-[#0D7A53]/15"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setVegOnly((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.85rem] font-bold transition ${
                  vegOnly
                    ? "border-[#0D7A53] bg-[#EBF7F1] text-[#0D7A53]"
                    : "border-[#E5EBE7] bg-white text-[#4B5563] hover:border-[#4B5563]"
                }`}
              >
                <DietBadge isVeg={true} />
                <span>Pure Veg</span>
              </button>

              <button
                type="button"
                onClick={() => setHighRating((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.85rem] font-bold transition ${
                  highRating
                    ? "border-[#0D7A53] bg-[#EBF7F1] text-[#0D7A53]"
                    : "border-[#E5EBE7] bg-white text-[#4B5563] hover:border-[#4B5563]"
                }`}
              >
                <span>★ 4.5+ Rating</span>
              </button>

              <button
                type="button"
                onClick={() => setFastDelivery((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.85rem] font-bold transition ${
                  fastDelivery
                    ? "border-[#0D7A53] bg-[#EBF7F1] text-[#0D7A53]"
                    : "border-[#E5EBE7] bg-white text-[#4B5563] hover:border-[#4B5563]"
                }`}
              >
                <span>⚡ Under 25 mins</span>
              </button>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                aria-label="Sort restaurants"
                className="cursor-pointer rounded-full border border-[#E5EBE7] bg-white px-3.5 py-2 text-[0.85rem] font-bold text-[#4B5563] outline-none"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="rating">Sort: Rating (High to Low)</option>
                <option value="deliveryTime">Sort: Delivery Time (Fastest)</option>
                <option value="costAsc">Sort: Price (Low to High)</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="categories-scroll mt-3.5 flex gap-3 overflow-x-auto px-1 pt-2 pb-3.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCategoryChange(c.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[0.85rem] font-bold whitespace-nowrap transition ${
                  activeCategory === c.id
                    ? "border-[#0D7A53] bg-[#EBF7F1] text-[#0D7A53]"
                    : "border-[#E5EBE7] bg-white text-[#4B5563] hover:border-[#4B5563]"
                }`}
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="mx-auto max-w-[1240px] px-5 pt-2.5 pb-16">
        <div className="flex items-center justify-between pt-6 pb-4">
          <h2 className="text-lg font-extrabold text-[#111827]">
            {loading
              ? "Finding restaurants..."
              : restaurants.length === 0
                ? "0 restaurants found"
                : `Showing ${restaurants.length} restaurant${restaurants.length > 1 ? "s" : ""} in Delhi NCR`}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-[330px] animate-pulse rounded-[18px] border border-[#E5EBE7] bg-white"
              />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No matching restaurants found"
            subtitle="We couldn't find any restaurants or dishes matching your search filters. Try clearing your filters or searching another term."
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-95"
              >
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
