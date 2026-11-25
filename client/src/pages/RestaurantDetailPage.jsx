import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Users } from "lucide-react";
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
  const { cart, addItem, updateQty } = useCart();
  const { activeRoom, addRoomItem, updateRoomItemQty, createRoom } = useGroupOrder();
  const { showToast } = useToast();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");
  const [orderTarget, setOrderTarget] = useState("auto"); // "auto" (uses group room if active), "personal"

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
      showToast("Please sign in to start a Group Order.", "🔐");
      openAuthModal("login");
      return;
    }
    try {
      const room = await createRoom(restaurant.id);
      navigate(`/group/${room.roomCode}`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Could not start group order.", "⚠️");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 py-10">
        <div className="h-44 animate-pulse rounded-[18px] bg-white border border-[#E5EBE7]" />
      </div>
    );
  }

  if (!restaurant) return null;

  return (
    <div>
      {/* Header Banner */}
      <div className="border-b border-[#E5EBE7] bg-white py-7.5">
        <div className="mx-auto max-w-[1240px] px-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0D7A53] hover:underline"
            >
              ← Back to Restaurants
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              {activeRoom ? (
                <div className="flex items-center gap-2 rounded-full border border-[#0D7A53]/30 bg-[#EBF7F1] px-3 py-1.5 text-xs font-bold text-[#086041]">
                  <span>Adding to:</span>
                  <button
                    type="button"
                    onClick={() => setOrderTarget("auto")}
                    className={`rounded-full px-2.5 py-0.5 transition ${
                      useGroupMode ? "bg-[#0D7A53] text-white" : "text-[#0D7A53]"
                    }`}
                  >
                    Group ({activeRoom.roomCode})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderTarget("personal")}
                    className={`rounded-full px-2.5 py-0.5 transition ${
                      !useGroupMode ? "bg-[#111827] text-white" : "text-[#4B5563]"
                    }`}
                  >
                    Personal Cart
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartGroupHere}
                  className="inline-flex items-center gap-2 rounded-full border border-[#0D7A53] bg-[#EBF7F1] px-4 py-2 text-xs font-extrabold text-[#0D7A53] transition hover:bg-[#0D7A53] hover:text-white"
                >
                  <Users className="h-4 w-4" />
                  <span>Start Group Order Here</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 rounded-[18px] border border-[#E5EBE7] bg-white p-6 shadow-xs md:grid-cols-[1fr_auto]">
            <div>
              <h1 className="mb-1.5 text-3xl font-extrabold text-[#111827]">{restaurant.name}</h1>
              <p className="mb-1 text-[0.95rem] text-[#4B5563]">{restaurant.cuisine.join(", ")}</p>
              <p className="mb-4 text-sm text-[#8E9BAE]">📍 {restaurant.address}</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-[#F7FAF8] px-3.5 py-1.5 text-sm font-bold">
                  ⏱️ {restaurant.deliveryTime}
                </div>
                <div className="flex items-center gap-2 rounded-full bg-[#F7FAF8] px-3.5 py-1.5 text-sm font-bold">
                  💳 {restaurant.priceForTwo}
                </div>
                {restaurant.discountBadge && (
                  <div className="flex items-center gap-2 rounded-full bg-[#F7FAF8] px-3.5 py-1.5 text-sm font-bold text-[#0D7A53]">
                    🏷️ {restaurant.discountBadge}
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-w-[100px] flex-col justify-center rounded-xl bg-[#086041] px-5 py-4 text-center text-white">
              <div className="flex items-center justify-center gap-1 text-2xl font-extrabold">
                ★ {restaurant.rating}
              </div>
              <div className="mt-0.5 text-xs opacity-90">{restaurant.ratingCount} reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="mx-auto max-w-[1240px] px-5 pt-10 pb-20">
        {useGroupMode && activeRoom && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#0D7A53]/25 bg-[#EBF7F1] px-4 py-3 text-sm">
            <span className="font-bold text-[#086041]">
              👥 Items you add will sync live to Group Room <strong>{activeRoom.roomCode}</strong>
            </span>
            <Link
              to={`/group/${activeRoom.roomCode}`}
              className="font-extrabold text-[#0D7A53] underline"
            >
              View Group Bill &amp; Participants →
            </Link>
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3.5 border-b border-[#E5EBE7] py-4">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setVegOnly(true)}
              className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-bold transition ${
                vegOnly
                  ? "border-[#0D7A53] bg-[#EBF7F1] text-[#0D7A53]"
                  : "border-[#E5EBE7] bg-white text-[#4B5563]"
              }`}
            >
              <DietBadge isVeg={true} />
              <span>Veg Only</span>
            </button>
            <button
              type="button"
              onClick={() => setVegOnly(false)}
              className={`rounded-full border px-3.5 py-2 text-sm font-bold transition ${
                !vegOnly
                  ? "border-[#0D7A53] bg-[#EBF7F1] text-[#0D7A53]"
                  : "border-[#E5EBE7] bg-white text-[#4B5563]"
              }`}
            >
              All Menu Items
            </button>
          </div>

          <div className="relative w-full max-w-[300px]">
            <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#8E9BAE]">🔍</span>
            <input
              type="text"
              value={menuQuery}
              onChange={(e) => setMenuQuery(e.target.value)}
              placeholder="Search dishes in menu..."
              className="w-full rounded-full border border-[#E5EBE7] bg-[#F7FAF8] py-2 pr-4 pl-10 text-sm outline-none focus:border-[#0D7A53] focus:bg-white"
            />
          </div>
        </div>

        {filteredMenu.length === 0 ? (
          <EmptyState
            icon="🥗"
            title="No dishes found"
            subtitle="No menu items match your search or dietary filter."
          />
        ) : (
          <div className="flex flex-col gap-5">
            {filteredMenu.map((item) => {
              const qty = getItemQty(item.id);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 gap-5 rounded-[18px] border border-[#E5EBE7] bg-white p-6 transition hover:border-[#0D7A53]/30 hover:shadow-xs md:grid-cols-[1fr_150px]"
                >
                  <div>
                    <div className="mb-1.5 flex items-center">
                      <DietBadge isVeg={item.isVeg} />
                      {item.bestseller && (
                        <span className="ml-2 inline-block rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-extrabold text-[#92400E]">
                          ★ Bestseller
                        </span>
                      )}
                    </div>
                    <h3 className="mb-1 text-lg font-extrabold text-[#111827]">{item.name}</h3>
                    <div className="mb-2 text-base font-bold text-[#111827]">₹{item.price}</div>
                    <p className="max-w-[550px] text-sm leading-relaxed text-[#4B5563]">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-row items-center justify-between md:flex-col md:justify-start">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_FOOD_IMG;
                      }}
                      className="h-[90px] w-[100px] rounded-xl bg-[#F0F4F1] object-cover md:h-[120px] md:w-[140px]"
                    />
                    <div className="z-[2] md:-mt-5">
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
                          className="rounded-lg border-[1.5px] border-[#E5EBE7] bg-white px-6 py-2 text-sm font-extrabold text-[#0D7A53] shadow-md transition hover:-translate-y-0.5 hover:border-[#0D7A53] hover:bg-[#0D7A53] hover:text-white"
                        >
                          + ADD
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
    </div>
  );
}
