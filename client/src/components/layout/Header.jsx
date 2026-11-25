import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
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
    const onScroll = () => setScrolled(window.scrollY > 20);
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
      showToast("Please sign in to start or join a Group Order.", "🔐");
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
    `px-3 py-2 rounded-lg text-[0.95rem] font-semibold transition flex items-center gap-1.5 ${
      isActive
        ? "text-[#0D7A53] bg-[#EBF7F1]"
        : "text-[#4B5563] hover:text-[#0D7A53] hover:bg-[#EBF7F1]"
    }`;

  return (
    <header
      className={`sticky top-0 z-[100] flex h-16 md:h-[74px] items-center border-b border-[#E5EBE7] bg-white/95 backdrop-blur-md transition-shadow ${
        scrolled ? "shadow-[0_4px_10px_-1px_rgba(13,122,83,0.08)]" : ""
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            title="EatUp Home"
            className="group flex items-center gap-2 text-[1.4rem] md:text-[1.65rem] font-extrabold tracking-tight text-[#0D7A53]"
          >
            <span className="inline-block -rotate-6 text-[1.6rem] md:text-[1.8rem] transition-transform group-hover:rotate-12 group-hover:scale-110">
              🍔
            </span>
            <span>EatUp</span>
          </Link>

          <div
            title="Delivery Location"
            className="hidden md:flex items-center gap-1.5 rounded-full bg-[#F0F4F1] px-3 py-1.5 text-[0.85rem] font-semibold text-[#4B5563]"
          >
            <span className="text-[#0D7A53]">📍</span>
            <span>Connaught Place, New Delhi</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3.5">
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/explore" className={navLinkClass}>
              Explore
            </NavLink>
            <NavLink to="/orders" className={navLinkClass}>
              My Orders
            </NavLink>
          </nav>

          {/* Group Order Trigger */}
          <button
            type="button"
            onClick={handleGroupOrderClick}
            className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs sm:text-sm font-bold transition ${
              activeRoomCode
                ? "border-[#0D7A53] bg-[#EBF7F1] text-[#0D7A53]"
                : "border-[#E5EBE7] bg-white text-[#111827] hover:border-[#0D7A53] hover:text-[#0D7A53]"
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">
              {activeRoomCode ? `Room ${activeRoomCode}` : "Group Order"}
            </span>
            {activeRoom && (
              <span className="rounded-full bg-[#0D7A53] px-1.5 py-0.5 text-[0.7rem] font-extrabold text-white">
                {activeRoom.participants?.length || 1}
              </span>
            )}
          </button>

          {/* Personal Cart Button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label="Open Shopping Cart"
            className="group flex items-center gap-2 rounded-full bg-[#111827] px-3.5 sm:px-4.5 py-2 text-[0.88rem] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#0D7A53]"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Cart</span>
            <span className="min-w-[20px] rounded-full bg-[#0D7A53] px-1.5 py-0.5 text-center text-xs font-extrabold text-white transition group-hover:bg-white group-hover:text-[#0D7A53]">
              {totals.itemCount}
            </span>
          </button>

          {/* Auth Controls */}
          {!user ? (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="rounded-full bg-[#0D7A53] px-4 sm:px-5 py-2 text-[0.88rem] font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#086041]"
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
                className="flex items-center gap-2 rounded-full bg-[#EBF7F1] px-3.5 py-1.5 text-sm font-bold text-[#0D7A53]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D7A53] text-xs font-extrabold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                <span>▾</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-[200] min-w-[210px] rounded-xl border border-[#E5EBE7] bg-white p-2 shadow-xl">
                  <div className="border-b border-[#F0F4F1] px-3 py-2 mb-1">
                    <div className="text-xs font-bold text-[#111827] truncate">{user.name}</div>
                    <div className="text-[0.72rem] text-[#8E9BAE] truncate">{user.email}</div>
                  </div>
                  <Link
                    to="/explore"
                    onClick={() => setDropdownOpen(false)}
                    className="flex sm:hidden items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#4B5563] hover:bg-[#F7FAF8] hover:text-[#0D7A53]"
                  >
                    🔍 Explore
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#4B5563] hover:bg-[#F7FAF8] hover:text-[#0D7A53]"
                  >
                    📦 My Orders
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      handleGroupOrderClick();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold text-[#4B5563] hover:bg-[#F7FAF8] hover:text-[#0D7A53]"
                  >
                    👥 {activeRoomCode ? `Active Room (${activeRoomCode})` : "Group Order"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2.5 rounded-lg border-t border-[#F0F4F1] px-3.5 pt-2.5 pb-2 text-left text-sm font-semibold text-[#B91C1C] hover:bg-[#FEE2E2]"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
