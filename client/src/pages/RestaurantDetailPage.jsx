import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  MapPin,
  Search,
  ShoppingBag,
  Star,
  Tag,
  Users
} from "lucide-react";
import { restaurantApi } from "../api/restaurantApi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useGroupOrder } from "../context/GroupOrderContext";
import { useToast } from "../context/ToastContext";
import { FALLBACK_FOOD_IMG } from "../utils/constants";
import { DietBadge } from "../components/common/DietBadge";
import { QtyStepper } from "../components/common/QtyStepper";
import { EmptyState } from "../components/common/EmptyState";

export function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { cart, totals, addItem, updateQty, openDrawer } = useCart();
  const { activeRoom, addRoomItem, updateRoomItemQty, createRoom } = useGroupOrder();
  const { showToast } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [orderTarget, setOrderTarget] = useState("auto");

  useEffect(() => {
    let active = true;
    setLoading(true);
    restaurantApi
      .getById(id)
      .then((res) => {
        if (active) setRestaurant(res.restaurant);
      })
      .catch(() => {
        if (active) {
          showToast("Restaurant not found.");
          navigate("/explore");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, navigate, showToast]);

  const useGroupMode = Boolean(activeRoom && orderTarget !== "personal");

  const filteredMenu = useMemo(() => {
    if (!restaurant?.menu) return [];
    let list = [...restaurant.menu];
    if (vegOnly) {
      list = list.filter((m) => m.isVeg);
    }
    if (menuQuery.trim()) {
      const q = menuQuery.trim().toLowerCase();
      list = list.filter(
        (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [restaurant, vegOnly, menuQuery]);

  const getItemQty = (dishId) => {
    if (!restaurant) return 0;
    if (useGroupMode && activeRoom) {
      if (activeRoom.restaurantId !== restaurant.id) return 0;
      const mine = activeRoom.items.find(
        (i) => i.dishId === dishId && i.addedBy?.userId === user?.id
      );
      return mine ? mine.qty : 0;
    }
    if (cart.restaurantId !== restaurant.id) return 0;
    const found = cart.items.find((i) => (i.dishId || i.id) === dishId);
    return found ? found.qty : 0;
  };

  const handleStartGroupHere = async () => {
    if (!user) {
      showToast("Please sign in to start a Group Table.");
      openAuthModal("login");
      return;
    }
    try {
      const room = await createRoom(restaurant.id);
      navigate(`/group/${room.roomCode}`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not start group table.");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10">
        <div className="h-64 animate-pulse rounded-3xl border border-[#EAE3D9] bg-white" />
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div>
      {/* Editorial Restaurant Hero */}
      <div className="border-b border-[#EAE3D9] bg-white py-7">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#57534E] uppercase transition hover:text-[#C83E2B]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Kitchens</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              {activeRoom ? (
                <div className="flex items-center gap-1.5 rounded-full border border-[#2D5A3C]/25 bg-[#EAF2EC] px-3 py-1.5 text-xs font-bold text-[#1F422B]">
                  <span>Target:</span>
                  <button
                    type="button"
                    onClick={() => setOrderTarget("auto")}
                    className={`rounded-full px-2.5 py-0.5 transition ${
                      useGroupMode ? "bg-[#2D5A3C] text-white" : "text-[#2D5A3C]"
                    }`}
                  >
                    Group ({activeRoom.roomCode})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderTarget("personal")}
                    className={`rounded-full px-2.5 py-0.5 transition ${
                      !useGroupMode ? "bg-[#1C1917] text-white" : "text-[#57534E]"
                    }`}
                  >
                    Personal Tray
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartGroupHere}
                  className="inline-flex items-center gap-2 rounded-full border border-[#2D5A3C] bg-[#EAF2EC] px-4 py-2 text-xs font-bold text-[#2D5A3C] transition hover:bg-[#2D5A3C] hover:text-white"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Start Group Table Here</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-[#EAE3D9] bg-[#FAF7F2] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#2D5A3C] px-3 py-1 text-xs font-bold text-white">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{restaurant.rating}</span>
                    <span className="opacity-80">({restaurant.ratingCount})</span>
                  </span>
                  {restaurant.discountBadge && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FBECE9] px-3 py-1 text-xs font-bold text-[#C83E2B]">
                      <Tag className="h-3 w-3" />
                      <span>{restaurant.discountBadge}</span>
                    </span>
                  )}
                </div>

                <h1 className="font-editorial mb-2 text-4xl sm:text-5xl tracking-tight text-[#1C1917]">
                  {restaurant.name}
                </h1>
                <p className="mb-2 text-sm font-medium text-[#57534E]">
                  {restaurant.cuisine.join(" · ")}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-[#A8A29E]">
                  <MapPin className="h-3.5 w-3.5 text-[#C83E2B]" />
                  <span>{restaurant.address}</span>
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-dashed border-[#EAE3D9] pt-5">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#EAE3D9] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1C1917]">
                  <Clock className="h-3.5 w-3.5 text-[#C83E2B]" />
                  <span>{restaurant.deliveryTime}</span>
                </div>
                <div className="font-code inline-flex items-center rounded-full border border-[#EAE3D9] bg-white px-3.5 py-1.5 text-xs font-bold text-[#1C1917]">
                  {restaurant.priceForTwo}
                </div>
              </div>
            </div>

            <div className="relative min-h-[220px] bg-[#F3EDE2]">
              <img
                src={restaurant.image}
                alt={restaurant.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_FOOD_IMG;
                }}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-8 pb-28">
        {useGroupMode && activeRoom && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#2D5A3C]/25 bg-[#EAF2EC] px-4 py-3 text-xs sm:text-sm">
            <span className="font-bold text-[#1F422B]">
              Dishes you add sync live to Group Table <strong className="font-code">{activeRoom.roomCode}</strong>
            </span>
            <Link
              to={`/group/${activeRoom.roomCode}`}
              className="inline-flex items-center gap-1 font-extrabold text-[#2D5A3C] underline"
            >
              <span>View Group Bill</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Menu Filter Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3.5 border-b border-[#EAE3D9] pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVegOnly(true)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition ${
                vegOnly
                  ? "border-[#2D5A3C] bg-[#EAF2EC] text-[#2D5A3C]"
                  : "border-[#EAE3D9] bg-white text-[#57534E]"
              }`}
            >
              <DietBadge isVeg={true} />
              <span>Veg Only</span>
            </button>
            <button
              type="button"
              onClick={() => setVegOnly(false)}
              className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                !vegOnly
                  ? "border-[#1C1917] bg-[#1C1917] text-[#FAF7F2]"
                  : "border-[#EAE3D9] bg-white text-[#57534E]"
              }`}
            >
              All Dishes ({restaurant.menu.length})
            </button>
          </div>

          <div className="relative w-full sm:max-w-[300px]">
            <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#A8A29E]" />
            <input
              type="text"
              value={menuQuery}
              onChange={(e) => setMenuQuery(e.target.value)}
              placeholder="Search dishes in menu..."
              className="w-full rounded-full border border-[#EAE3D9] bg-white py-2 pr-4 pl-10 text-sm text-[#1C1917] placeholder:text-[#A8A29E] outline-none focus:border-[#C83E2B]"
            />
          </div>
        </div>

        {filteredMenu.length === 0 ? (
          <EmptyState
            title="No dishes found"
            subtitle="No menu items match your search or dietary filter."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredMenu.map((item) => {
              const qty = getItemQty(item.id);
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-[#EAE3D9] bg-white p-5 transition hover:border-[#C83E2B]/35 sm:flex-row"
                >
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <DietBadge isVeg={item.isVeg} />
                      {item.bestseller && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#FDF6E7] px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#B47B14] uppercase">
                          <Star className="h-2.5 w-2.5 fill-current" /> Bestseller
                        </span>
                      )}
                    </div>
                    <h3 className="font-editorial mb-1 text-2xl leading-snug text-[#1C1917]">
                      {item.name}
                    </h3>
                    <div className="font-code mb-2 text-sm font-bold text-[#1C1917]">
                      ₹{item.price}
                    </div>
                    <p className="text-xs leading-relaxed text-[#57534E]">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:justify-start">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_FOOD_IMG;
                      }}
                      className="h-24 w-28 rounded-xl bg-[#F3EDE2] object-cover sm:h-28 sm:w-32"
                    />
                    <div className="z-[2] sm:-mt-5">
                      {qty > 0 ? (
                        <QtyStepper
                          qty={qty}
                          onDecrease={() =>
                            useGroupMode
                              ? updateRoomItemQty(item.id, -1)
                              : updateQty(item.id, -1)
                          }
                          onIncrease={() =>
                            useGroupMode
                              ? updateRoomItemQty(item.id, 1)
                              : updateQty(item.id, 1)
                          }
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            useGroupMode
                              ? addRoomItem(restaurant, item)
                              : addItem(restaurant, item)
                          }
                          className="rounded-full border border-[#EAE3D9] bg-white px-6 py-2 text-xs font-extrabold tracking-wider text-[#C83E2B] uppercase shadow-sm transition hover:border-[#C83E2B] hover:bg-[#C83E2B] hover:text-white"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Persistent Tray Bar (when items in personal cart & not in group mode) */}
      {!useGroupMode && totals.itemCount > 0 && (
        <div className="fixed right-4 bottom-20 left-4 z-[95] mx-auto max-w-[520px] sm:bottom-6">
          <button
            type="button"
            onClick={openDrawer}
            className="flex w-full items-center justify-between rounded-full bg-[#1C1917] px-5 py-3.5 text-sm font-bold text-[#FAF7F2] shadow-2xl transition hover:bg-[#C83E2B]"
          >
            <span className="flex items-center gap-2.5">
              <ShoppingBag className="h-4 w-4 text-[#D99B26]" />
              <span>
                {totals.itemCount} item{totals.itemCount > 1 ? "s" : ""} ·{" "}
                <span className="font-code">₹{totals.grandTotal}</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider">
              View Tray <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
