import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#292524] bg-[#1C1917] pt-14 pb-24 sm:pb-10 text-[#A8A29E]">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-6">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C83E2B] text-white">
                <Flame className="h-4 w-4 fill-current" />
              </span>
              <span className="font-editorial text-2xl text-[#FAF7F2]">
                Eat<span className="italic text-[#D99B26]">Up.</span>
              </span>
            </Link>
            <p className="max-w-[340px] text-sm leading-relaxed text-[#A8A29E]">
              Curated local kitchens, woodfire ovens, and slow-cooked biryanis — built for solo cravings and real-time shared group tables across Delhi NCR.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-bold tracking-[0.16em] text-[#FAF7F2] uppercase">
              Explore
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/explore" className="transition hover:text-[#FAF7F2]">All Kitchens</Link></li>
              <li><Link to="/explore?category=biryani" className="transition hover:text-[#FAF7F2]">Slow Dum Biryani</Link></li>
              <li><Link to="/explore?category=pizza" className="transition hover:text-[#FAF7F2]">Woodfire Pizza</Link></li>
              <li><Link to="/explore?category=healthy" className="transition hover:text-[#FAF7F2]">Healthy Bowls</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-bold tracking-[0.16em] text-[#FAF7F2] uppercase">
              Experience
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/" className="transition hover:text-[#FAF7F2]">Editorial Home</Link></li>
              <li><Link to="/orders" className="transition hover:text-[#FAF7F2]">Order History</Link></li>
              <li><Link to="/explore" className="transition hover:text-[#FAF7F2]">Seasonal Offers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-bold tracking-[0.16em] text-[#FAF7F2] uppercase">
              Cuisines
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/explore?category=north-indian" className="transition hover:text-[#FAF7F2]">North Indian</Link></li>
              <li><Link to="/explore?category=south-indian" className="transition hover:text-[#FAF7F2]">South Indian Tiffin</Link></li>
              <li><Link to="/explore?category=chinese" className="transition hover:text-[#FAF7F2]">Asian Wok &amp; Dim Sum</Link></li>
              <li><Link to="/explore?category=desserts" className="transition hover:text-[#FAF7F2]">Artisanal Desserts</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-[#292524] pt-6 text-xs sm:flex-row">
          <p>&copy; 2026 EatUp Technologies Pvt. Ltd. Crafted for food lovers.</p>
          <p className="text-[#78716C]">
            Connaught Place · South Delhi · Gurugram · Noida
          </p>
        </div>
      </div>
    </footer>
  );
}
