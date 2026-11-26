import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Compass,
  Flame,
  Home,
  LogOut,
  MapPin,
  Package,
  ShoppingBag,
  Users
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useGroupOrder } from "../../context/GroupOrderContext";
import { useToast } from "../../context/ToastContext";

export function Header() {
  const { user, openAuthModal, logout } = useAuth();
  const { totals, openDrawer } = useCart();
  const { activeRoom, activeRoomCode, setJoinModalOpen, clearRoomLocal } = useGroupOrder();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    clearRoomLocal();
    showToast("Signed out successfully.");
    navigate("/");
  };

  const handleGroupOrderClick = () => {
    if (!user) {
      showToast("Please sign in to start or join a Group Order.");
      openAuthModal("login");
      return;
    }
    if (activeRoomCode) {
      navigate(`/group/${activeRoomCode}`);
    } else {
      setJoinModalOpen(true);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-full text-sm font-semibold transition flex items-center gap-1.5 ${
      isActive
        ? "text-[#C83E2B] bg-[#FBECE9]"
        : "text-[#57534E] hover:text-[#1C1917] hover:bg-[#F3EDE2]/70"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition ${
      isActive ? "text-[#C83E2B]" : "text-[#57534E]"
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-[100] flex h-16 md:h-[76px] items-center border-b border-[#EAE3D9] bg-[#FAF7F2]/92 backdrop-blur-md transition-shadow ${
          scrolled ? "shadow-[0_6px_24px_-8px_rgba(28,25,23,0.12)]" : ""
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
          {/* Brand + Location */}
          <div className="flex items-center gap-5">
            <Link
              to="/"
              title="EatUp Home"
              className="group flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C83E2B] text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
                <Flame className="h-4.5 w-4.5 fill-current" />
              </span>
              <span className="font-editorial text-2xl md:text-[1.75rem] tracking-tight text-[#1C1917]">
                Eat<span className="italic text-[#C83E2B]">Up.</span>
              </span>
            </Link>

            <div
              title="Delivery Location"
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-[#EAE3D9] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#57534E]"
            >
              <MapPin className="h-3.5 w-3.5 text-[#C83E2B]" />
              <span>Connaught Place, New Delhi</span>
            </div>
          </div>

          {/* Desktop Navigation + Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/explore" className={navLinkClass}>
                Kitchens
              </NavLink>
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>
            </nav>

            {/* Group Order Trigger */}
            <button
              type="button"
              onClick={handleGroupOrderClick}
              className={`hidden sm:flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                activeRoomCode
                  ? "border-[#2D5A3C] bg-[#EAF2EC] text-[#2D5A3C]"
                  : "border-[#EAE3D9] bg-white text-[#1C1917] hover:border-[#1C1917]"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span className="hidden md:inline">
                {activeRoomCode ? `Room ${activeRoomCode}` : "Group Table"}
              </span>
              {activeRoom && (
                <span className="rounded-full bg-[#2D5A3C] px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                  {activeRoom.participants?.length || 1}
                </span>
              )}
            </button>

            {/* Personal Cart Button */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Open Shopping Cart"
              className="group hidden sm:flex items-center gap-2 rounded-full bg-[#1C1917] px-4 py-2 text-xs sm:text-sm font-bold text-[#FAF7F2] transition hover:bg-[#C83E2B]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Tray</span>
              <span className="font-code min-w-[20px] rounded-full bg-[#C83E2B] px-1.5 py-0.5 text-center text-[11px] font-bold text-white transition group-hover:bg-white group-hover:text-[#C83E2B]">
                {totals.itemCount}
              </span>
            </button>

            {/* Auth Controls */}
            {!user ? (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="rounded-full bg-[#C83E2B] px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white transition hover:bg-[#A62F1F]"
              >
                Sign In
              </button>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((prev) => !prev);
                  }}
                  className="flex items-center gap-2 rounded-full border border-[#EAE3D9] bg-white px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold text-[#1C1917] transition hover:border-[#1C1917]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C83E2B] text-xs font-extrabold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-[#57534E]" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+10px)] z-[200] min-w-[220px] rounded-2xl border border-[#EAE3D9] bg-white p-2 shadow-2xl">
                    <div className="mb-1 border-b border-[#F3EDE2] px-3 py-2.5">
                      <div className="truncate text-xs font-bold text-[#1C1917]">{user.name}</div>
                      <div className="truncate text-[11px] text-[#A8A29E]">{user.email}</div>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#57534E] transition hover:bg-[#FAF7F2] hover:text-[#1C1917]"
                    >
                      <Package className="h-4 w-4 text-[#C83E2B]" />
                      <span>My Orders</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleGroupOrderClick();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#57534E] transition hover:bg-[#FAF7F2] hover:text-[#1C1917]"
                    >
                      <Users className="h-4 w-4 text-[#2D5A3C]" />
                      <span>{activeRoomCode ? `Room ${activeRoomCode}` : "Group Table"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2.5 rounded-xl border-t border-[#F3EDE2] px-3 pt-2.5 pb-2 text-left text-sm font-semibold text-[#C83E2B] transition hover:bg-[#FBECE9]"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed right-0 bottom-0 left-0 z-[120] grid grid-cols-5 border-t border-[#EAE3D9] bg-[#FAF7F2]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
      >
        <NavLink to="/" end className={mobileNavClass}>
          <Home className="h-4.5 w-4.5" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/explore" className={mobileNavClass}>
          <Compass className="h-4.5 w-4.5" />
          <span>Kitchens</span>
        </NavLink>
        <button
          type="button"
          onClick={handleGroupOrderClick}
          className={`flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold ${
            activeRoomCode ? "text-[#2D5A3C]" : "text-[#57534E]"
          }`}
        >
          <Users className="h-4.5 w-4.5" />
          <span>{activeRoomCode ? "Room" : "Group"}</span>
        </button>
        <NavLink to="/orders" className={mobileNavClass}>
          <Package className="h-4.5 w-4.5" />
          <span>Orders</span>
        </NavLink>
        <button
          type="button"
          onClick={openDrawer}
          className="relative flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold text-[#1C1917]"
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          <span>Tray</span>
          {totals.itemCount > 0 && (
            <span className="font-code absolute top-1.5 right-3.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C83E2B] px-1 text-[10px] font-bold text-white">
              {totals.itemCount}
            </span>
          )}
        </button>
      </nav>
    </>
  );
}
