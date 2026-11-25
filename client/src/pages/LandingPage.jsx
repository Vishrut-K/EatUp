import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { restaurantApi } from "../api/restaurantApi";
import { CATEGORIES } from "../utils/constants";
import { RestaurantCard } from "../components/restaurant/RestaurantCard";

export function LandingPage() {
  const [searchText, setSearchText] = useState("");
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    restaurantApi
      .getAll({ featured: "true" })
      .then((res) => {
        if (active) setFeaturedRestaurants(res.restaurants || []);
      })
      .catch(() => {
        if (active) setFeaturedRestaurants([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchText.trim();
    navigate(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-[#E5EBE7] bg-gradient-to-b from-white to-[#F0F8F4] py-14 md:py-20">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-9 px-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#EBF7F1] px-3.5 py-1.5 text-sm font-bold text-[#0D7A53]">
              <span>🌿</span>
              <span>Handpicked Gourmet Delicacies</span>
            </div>

            <h1 className="mb-5 text-4xl leading-[1.15] font-extrabold tracking-tight text-[#111827] md:text-[2.75rem] lg:text-[3.5rem]">
              Craving good food? <br />
              Order from <span className="text-[#0D7A53]">EatUp.</span>
            </h1>

            <p className="mb-9 max-w-[540px] text-lg text-[#4B5563]">
              Explore handpicked restaurants, artisanal pizzas, authentic biryanis, healthy bowls, and sweet treats delivered piping hot to your doorstep.
            </p>

            <form
              onSubmit={handleSearch}
              className="flex max-w-[580px] items-center rounded-full border-2 border-[#E5EBE7] bg-white p-1.5 pl-5 shadow-xl transition focus-within:border-[#0D7A53] focus-within:ring-4 focus-within:ring-[#0D7A53]/15"
            >
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search for restaurant or dish (e.g. Biryani, Pizza)..."
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-base text-[#111827] outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-gradient-to-br from-[#0D7A53] to-[#149666] px-6 py-3 text-sm sm:text-base font-bold text-white transition hover:scale-[1.02] hover:opacity-95"
              >
                Find Food
              </button>
            </form>

            <div className="mt-10 flex items-center gap-6 sm:gap-9">
              <div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#111827]">500+</h4>
                <p className="text-xs sm:text-sm font-semibold text-[#8E9BAE]">Dishes Available</p>
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#111827]">25 min</h4>
                <p className="text-xs sm:text-sm font-semibold text-[#8E9BAE]">Average Delivery</p>
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#111827]">4.8 ★</h4>
                <p className="text-xs sm:text-sm font-semibold text-[#8E9BAE]">Customer Rating</p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[500px] lg:max-w-none">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80"
              alt="Delicious Gourmet Food Feast"
              loading="eager"
              className="max-h-[440px] w-full rounded-[28px] object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Categories Quick Strip */}
      <div className="mx-auto max-w-[1240px] px-5 py-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[1.85rem] font-extrabold tracking-tight text-[#111827]">
              What&apos;s on your mind?
            </h2>
            <p className="mt-1 text-[0.95rem] text-[#4B5563]">
              Pick from popular cravings or explore the full menu
            </p>
          </div>
          <Link
            to="/explore"
            className="rounded-full border border-[#E5EBE7] bg-white px-5 py-2 text-sm font-bold text-[#111827] transition hover:border-[#8E9BAE] hover:bg-[#F7FAF8]"
          >
            View All
          </Link>
        </div>

        <div className="categories-scroll -mx-1 -mt-1.5 flex gap-4 overflow-x-auto px-1.5 pt-2.5 pb-4.5">
          {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/explore?category=${c.id}`)}
              className="flex min-w-[120px] shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border border-[#E5EBE7] bg-white px-5.5 py-4.5 transition hover:-translate-y-1 hover:border-[#0D7A53] hover:bg-[#EBF7F1] hover:shadow-md"
            >
              <span className="text-[2rem]">{c.icon}</span>
              <span className="whitespace-nowrap text-sm font-bold text-[#111827]">{c.name}</span>
            </button>
          ))}
        </div>

        {/* Promotional Deal Banners */}
        <div className="my-9 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-[18px] bg-gradient-to-br from-[#0D7A53] to-[#149666] p-7 text-white shadow-md">
            <div>
              <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-xs font-extrabold tracking-wider uppercase">
                SPECIAL WELCOME
              </span>
              <h3 className="text-[1.4rem] leading-tight font-extrabold">50% OFF Up to ₹100</h3>
              <p className="mt-1 text-sm opacity-90">
                Apply code <strong>EATUP50</strong> on your first order.
              </p>
            </div>
            <div className="text-[3.5rem]">🥘</div>
          </div>

          <div className="flex items-center justify-between rounded-[18px] bg-gradient-to-br from-[#D9822B] to-[#F59E0B] p-7 text-white shadow-md">
            <div>
              <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-xs font-extrabold tracking-wider uppercase">
                FREE DELIVERY
              </span>
              <h3 className="text-[1.4rem] leading-tight font-extrabold">Zero Delivery Fee</h3>
              <p className="mt-1 text-sm opacity-90">
                On all orders above ₹400 across Delhi NCR.
              </p>
            </div>
            <div className="text-[3.5rem]">🚀</div>
          </div>
        </div>

        {/* Featured Restaurants */}
        <div className="mt-12">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[1.85rem] font-extrabold tracking-tight text-[#111827]">
                Popular Restaurants in Delhi NCR
              </h2>
              <p className="mt-1 text-[0.95rem] text-[#4B5563]">
                Top-rated dining spots with rapid delivery
              </p>
            </div>
            <Link
              to="/explore"
              className="rounded-full border border-[#E5EBE7] bg-white px-5 py-2 text-sm font-bold text-[#111827] transition hover:border-[#8E9BAE] hover:bg-[#F7FAF8]"
            >
              Explore More (6)
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-[330px] animate-pulse rounded-[18px] border border-[#E5EBE7] bg-white"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {featuredRestaurants.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} />
              ))}
            </div>
          )}
        </div>

        {/* Why Order With EatUp */}
        <div className="mt-16">
          <div className="mb-7 text-center">
            <h2 className="text-[1.85rem] font-extrabold tracking-tight text-[#111827]">
              Why Order With EatUp?
            </h2>
            <p className="mt-1 text-[0.95rem] text-[#4B5563]">
              Delivering culinary happiness across the capital
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-[18px] border border-[#E5EBE7] bg-white px-6 py-7 text-center transition hover:-translate-y-1">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF7F1] text-[2rem]">
                ⚡
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-[#111827]">Lightning Delivery</h3>
              <p className="text-sm leading-relaxed text-[#4B5563]">
                Hot, freshly cooked meals delivered straight to your door in 25-30 minutes.
              </p>
            </div>

            <div className="rounded-[18px] border border-[#E5EBE7] bg-white px-6 py-7 text-center transition hover:-translate-y-1">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF7F1] text-[2rem]">
                🛡️
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-[#111827]">Hygiene Verified</h3>
              <p className="text-sm leading-relaxed text-[#4B5563]">
                Partnering exclusively with certified kitchens maintaining peak cleanliness &amp; taste.
              </p>
            </div>

            <div className="rounded-[18px] border border-[#E5EBE7] bg-white px-6 py-7 text-center transition hover:-translate-y-1">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EBF7F1] text-[2rem]">
                ⭐
              </div>
              <h3 className="mb-2 text-xl font-extrabold text-[#111827]">Curated Excellence</h3>
              <p className="text-sm leading-relaxed text-[#4B5563]">
                Every restaurant and recipe is hand-tasted and vetted by culinary experts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
