import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#1E293B] bg-[#0F172A] pt-12 pb-8 text-[#94A3B8]">
      <div className="mx-auto max-w-[1240px] px-5">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-10">
          <div>
            <Link to="/" className="mb-3 inline-flex items-center gap-2 text-2xl font-extrabold text-white">
              <span>🍔</span>
              <span>EatUp</span>
            </Link>
            <p className="max-w-[320px] text-sm leading-relaxed">
              Discover and order from Delhi NCR&apos;s top dining spots, authentic tandoors, artisanal pizzerias, and health kitchens. Delivered piping hot to your table.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-base font-bold text-white">Explore</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/explore" className="hover:text-white">All Restaurants</Link></li>
              <li><Link to="/explore?category=biryani" className="hover:text-white">Biryani Specials</Link></li>
              <li><Link to="/explore?category=pizza" className="hover:text-white">Artisanal Pizzas</Link></li>
              <li><Link to="/explore?category=healthy" className="hover:text-white">Healthy Bowls</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-bold text-white">Quick Links</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/orders" className="hover:text-white">My Orders</Link></li>
              <li><Link to="/explore" className="hover:text-white">Offers &amp; Deals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-base font-bold text-white">Top Cuisines</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><Link to="/explore?category=north-indian" className="hover:text-white">North Indian</Link></li>
              <li><Link to="/explore?category=pizza" className="hover:text-white">Woodfire Italian</Link></li>
              <li><Link to="/explore?category=biryani" className="hover:text-white">Mughlai Dum Biryani</Link></li>
              <li><Link to="/explore?category=chinese" className="hover:text-white">Asian Dim Sum</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1E293B] pt-6 text-center text-sm">
          <p>&copy; 2026 EatUp Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="mt-1 text-xs text-[#64748B]">
            Delivering culinary excellence across Connaught Place, South Delhi, Gurugram &amp; Noida.
          </p>
        </div>
      </div>
    </footer>
  );
}
