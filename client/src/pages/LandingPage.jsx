import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users,
  UtensilsCrossed,
  Zap
} from "lucide-react";
import { restaurantApi } from "../api/restaurantApi";
import { CATEGORIES } from "../utils/constants";
import { RestaurantCard } from "../components/restaurant/RestaurantCard";

const MARQUEE_ITEMS = [
  "FRESHLY PREPARED TO ORDER",
  "DELHI NCR'S CURATED KITCHENS",
  "ZERO DELIVERY ABOVE ₹400",
  "LIVE COLLABORATIVE GROUP TABLES",
  "WOODFIRE OVENS & SLOW DUM BIRYANI",
  "AUTOMATIC FAIR BILL SPLITTING"
];

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
      {/* Editorial Hero Section */}
      <section className="border-b border-[#EAE3D9] bg-[#FAF7F2] py-12 md:py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#EAE3D9] bg-white px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-[#C83E2B] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Curated Culinary Collective · Delhi NCR</span>
            </div>

            <h1 className="font-editorial mb-5 text-5xl leading-[1.03] tracking-tight text-[#1C1917] sm:text-6xl lg:text-[4.4rem]">
              Craving something{" "}
              <span className="italic text-[#C83E2B]">unforgettable?</span>
              <br />
              Order from EatUp.
            </h1>

            <p className="mb-8 max-w-[520px] text-base leading-relaxed text-[#57534E] sm:text-lg">
              Handpicked neighbourhood kitchens, slow-cooked dum biryanis, woodfire sourdough pizzas, and live collaborative group ordering — delivered piping hot.
            </p>

            <form
              onSubmit={handleSearch}
              className="flex max-w-[560px] items-center rounded-full border border-[#EAE3D9] bg-white p-1.5 pl-4 sm:pl-5 shadow-[0_12px_32px_-12px_rgba(28,25,23,0.12)] transition focus-within:border-[#C83E2B]"
            >
              <Search className="mr-3 h-4.5 w-4.5 shrink-0 text-[#A8A29E]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search kitchen, biryani, woodfire pizza..."
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-sm sm:text-base text-[#1C1917] placeholder:text-[#A8A29E] outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-[#C83E2B] px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-[#A62F1F]"
              >
                <span>Find Food</span>
                <ArrowRight className="h-4 w-4 hidden sm:inline" />
              </button>
            </form>

            {/* Editorial Stats Strip */}
            <div className="mt-10 grid max-w-[480px] grid-cols-3 divide-x divide-[#EAE3D9] border-t border-[#EAE3D9] pt-6">
              <div className="pr-4">
                <div className="font-editorial text-2xl sm:text-3xl text-[#1C1917]">500+</div>
                <div className="text-[11px] font-bold tracking-wider text-[#A8A29E] uppercase">
                  Curated Dishes
                </div>
              </div>
              <div className="px-4">
                <div className="font-editorial text-2xl sm:text-3xl text-[#1C1917]">25 min</div>
                <div className="text-[11px] font-bold tracking-wider text-[#A8A29E] uppercase">
                  Avg Delivery
                </div>
              </div>
              <div className="pl-4">
                <div className="font-editorial flex items-center gap-1 text-2xl sm:text-3xl text-[#1C1917]">
                  <span>4.8</span>
                  <Star className="h-4 w-4 fill-[#D99B26] text-[#D99B26]" />
                </div>
                <div className="text-[11px] font-bold tracking-wider text-[#A8A29E] uppercase">
                  Guest Rating
                </div>
              </div>
            </div>
          </div>

          {/* Editorial Framed Hero Photography */}
          <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
            <div className="overflow-hidden rounded-[28px] border border-[#EAE3D9] bg-white p-2.5 shadow-[0_24px_48px_-16px_rgba(28,25,23,0.16)]">
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&auto=format&fit=crop&q=80"
                alt="Artisanal gourmet table spread"
                loading="eager"
                className="aspect-[4/3] w-full rounded-[20px] object-cover"
              />
            </div>

            {/* Floating Editorial Stamp */}
            <div className="absolute -bottom-4 left-6 hidden sm:flex items-center gap-3 rounded-2xl border border-[#EAE3D9] bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF2EC] text-[#2D5A3C]">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.14em] text-[#A8A29E] uppercase">
                  Kitchen to Door
                </div>
                <div className="text-xs font-extrabold text-[#1C1917]">
                  Hot &amp; Sealed in 25 mins
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Foodie Marquee */}
      <div className="overflow-hidden border-b border-[#292524] bg-[#1C1917] py-3 text-[#FAF7F2]">
        <div className="animate-marquee flex items-center gap-8">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <span
              key={idx}
              className="flex items-center gap-8 text-[11px] font-bold tracking-[0.18em] whitespace-nowrap uppercase"
            >
              <span>{item}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#D99B26]" />
            </span>
          ))}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-14 sm:py-16">
        {/* Categories Strip */}
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-[#C83E2B] uppercase">
              Browse by Craving
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl tracking-tight text-[#1C1917]">
              What&apos;s on your <span className="italic">table</span> tonight?
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE3D9] bg-white px-4 py-2 text-xs font-bold text-[#1C1917] transition hover:border-[#1C1917]"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="categories-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pt-1 pb-4">
          {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => navigate(`/explore?category=${c.id}`)}
              className="group flex min-w-[144px] shrink-0 flex-col items-start justify-between rounded-2xl border border-[#EAE3D9] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#C83E2B] hover:shadow-md"
            >
              <span className="mb-3 rounded-full bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] text-[#C83E2B] uppercase transition group-hover:bg-[#FBECE9]">
                {c.tag}
              </span>
              <span className="text-sm font-extrabold text-[#1C1917]">{c.name}</span>
            </button>
          ))}
        </div>

        {/* Dual Editorial Promo Cards */}
        <div className="my-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex items-center justify-between gap-4 rounded-3xl bg-[#C83E2B] p-7 sm:p-8 text-white shadow-sm">
            <div>
              <span className="mb-2.5 inline-block rounded-full bg-white/18 px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase">
                Welcome Offer
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl leading-tight">
                50% Off <span className="italic">Up to ₹100</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-white/90">
                Use code <strong className="font-code rounded bg-white/20 px-1.5 py-0.5">EATUP50</strong> on your first kitchen order.
              </p>
            </div>
            <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-3xl bg-[#1C1917] p-7 sm:p-8 text-[#FAF7F2] shadow-sm">
            <div>
              <span className="mb-2.5 inline-block rounded-full bg-[#D99B26]/20 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-[#D99B26] uppercase">
                Zero Delivery Fee
              </span>
              <h3 className="font-editorial text-3xl sm:text-4xl leading-tight">
                Free Delivery <span className="italic text-[#D99B26]">Above ₹400</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#A8A29E]">
                Automatically unlocked on solo trays &amp; combined group tables across Delhi NCR.
              </p>
            </div>
            <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#D99B26]/30 bg-[#D99B26]/10 text-[#D99B26]">
              <Truck className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Featured Restaurants */}
        <div className="mt-14">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="mb-1.5 block text-[11px] font-bold tracking-[0.16em] text-[#2D5A3C] uppercase">
                Chef&apos;s Selection
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl tracking-tight text-[#1C1917]">
                Popular Kitchens in <span className="italic">Delhi NCR</span>
              </h2>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE3D9] bg-white px-4 py-2 text-xs font-bold text-[#1C1917] transition hover:border-[#1C1917]"
            >
              <span>Explore All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-[340px] animate-pulse rounded-2xl border border-[#EAE3D9] bg-white"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredRestaurants.map((rest) => (
                <RestaurantCard key={rest.id} restaurant={rest} />
              ))}
            </div>
          )}
        </div>

        {/* Editorial Value Pillars */}
        <div className="mt-20 border-t border-[#EAE3D9] pt-14">
          <div className="mb-10 text-center">
            <span className="mb-2 block text-[11px] font-bold tracking-[0.16em] text-[#C83E2B] uppercase">
              The EatUp Standard
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl text-[#1C1917]">
              Built for <span className="italic">effortless</span> dining
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#EAE3D9] bg-white p-7 transition hover:-translate-y-0.5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FBECE9] text-[#C83E2B]">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-editorial mb-2 text-2xl text-[#1C1917]">Lightning Dispatch</h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Kitchens begin firing your order immediately, arriving hot and tamper-sealed in 25–30 minutes.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EAE3D9] bg-white p-7 transition hover:-translate-y-0.5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF2EC] text-[#2D5A3C]">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-editorial mb-2 text-2xl text-[#1C1917]">Live Group Tables</h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Share a room code across devices. Everyone adds their own dishes while fees &amp; GST split automatically.
              </p>
            </div>

            <div className="rounded-2xl border border-[#EAE3D9] bg-white p-7 transition hover:-translate-y-0.5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FDF6E7] text-[#D99B26]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-editorial mb-2 text-2xl text-[#1C1917]">Hygiene Verified</h3>
              <p className="text-sm leading-relaxed text-[#57534E]">
                Every partner kitchen is vetted for culinary craft, fresh ingredients, and certified packaging hygiene.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
