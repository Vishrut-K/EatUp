import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, Search, SlidersHorizontal, Star, Zap } from "lucide-react";
import { restaurantApi } from "../api/restaurantApi";
import { CATEGORIES } from "../utils/constants";
import { DietBadge } from "../components/common/DietBadge";
import { EmptyState } from "../components/common/EmptyState";
import { RestaurantCard } from "../components/restaurant/RestaurantCard";

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all");
  const [vegOnly, setVegOnly] = useState(false);
  const [highRating, setHighRating] = useState(false);
  const [fastDelivery, setFastDelivery] = useState(false);
  const [sortOption, setSortOption] = useState("relevance");
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    const qParam = searchParams.get("q") || "";
    const catParam = searchParams.get("category") || "all";
    setSearchQuery(qParam);
    setDebouncedQuery(qParam);
    setActiveCategory(catParam);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setFetchError("");
    const params = {};
    if (debouncedQuery.trim()) params.q = debouncedQuery.trim();
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
      .catch((err) => {
        if (active) {
          setRestaurants([]);
          setFetchError(
            err?.response?.data?.message ||
              "Could not reach the EatUp kitchen server. Please make sure the backend is running."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedQuery, activeCategory, vegOnly, highRating, fastDelivery, sortOption]);

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
      <div className="sticky top-16 md:top-[76px] z-[90] border-b border-[#EAE3D9] bg-[#FAF7F2]/95 pt-4 pb-1 backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-[420px]">
              <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search kitchen, cuisine, or dish..."
                className="w-full rounded-full border border-[#EAE3D9] bg-white py-2.5 pr-4 pl-10 text-sm text-[#1C1917] placeholder:text-[#A8A29E] outline-none transition focus:border-[#C83E2B]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setVegOnly((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                  vegOnly
                    ? "border-[#2D5A3C] bg-[#EAF2EC] text-[#2D5A3C]"
                    : "border-[#EAE3D9] bg-white text-[#57534E] hover:border-[#1C1917]"
                }`}
              >
                <DietBadge isVeg={true} />
                <span>Pure Veg</span>
              </button>

              <button
                type="button"
                onClick={() => setHighRating((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                  highRating
                    ? "border-[#C83E2B] bg-[#FBECE9] text-[#C83E2B]"
                    : "border-[#EAE3D9] bg-white text-[#57534E] hover:border-[#1C1917]"
                }`}
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>4.5+ Rated</span>
              </button>

              <button
                type="button"
                onClick={() => setFastDelivery((v) => !v)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                  fastDelivery
                    ? "border-[#C83E2B] bg-[#FBECE9] text-[#C83E2B]"
                    : "border-[#EAE3D9] bg-white text-[#57534E] hover:border-[#1C1917]"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Under 25m</span>
              </button>

              <div className="relative flex items-center">
                <SlidersHorizontal className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-[#57534E]" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  aria-label="Sort restaurants"
                  className="cursor-pointer appearance-none rounded-full border border-[#EAE3D9] bg-white py-2 pr-9 pl-9 text-xs font-bold text-[#1C1917] outline-none transition hover:border-[#1C1917]"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="rating">Rating: High to Low</option>
                  <option value="deliveryTime">Delivery: Fastest</option>
                  <option value="costAsc">Price: Low to High</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-[#57534E]" />
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="categories-scroll mt-3.5 flex gap-2 overflow-x-auto pb-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleCategoryChange(c.id)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold whitespace-nowrap transition ${
                  activeCategory === c.id
                    ? "border-[#1C1917] bg-[#1C1917] text-[#FAF7F2]"
                    : "border-[#EAE3D9] bg-white text-[#57534E] hover:border-[#1C1917] hover:text-[#1C1917]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6 pb-24 sm:pb-16">
        <div className="mb-6 flex items-baseline justify-between border-b border-[#EAE3D9] pb-4">
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#1C1917]">
            {loading
              ? "Discovering kitchens..."
              : restaurants.length === 0
                ? "No kitchens found"
                : `${restaurants.length} Curated Kitchen${restaurants.length > 1 ? "s" : ""}`}
          </h1>
          <span className="text-[11px] font-bold tracking-[0.14em] text-[#A8A29E] uppercase">
            Delhi NCR
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-[340px] animate-pulse rounded-2xl border border-[#EAE3D9] bg-white"
              />
            ))}
          </div>
        ) : fetchError ? (
          <EmptyState
            title="Kitchens unavailable"
            subtitle={fetchError}
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-full bg-[#C83E2B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#A62F1F]"
              >
                Retry
              </button>
            }
          />
        ) : restaurants.length === 0 ? (
          <EmptyState
            title="No matching kitchens found"
            subtitle="We couldn't find any kitchens or dishes matching your active filters. Try resetting to explore everything."
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-full bg-[#C83E2B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#A62F1F]"
              >
                Reset All Filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
