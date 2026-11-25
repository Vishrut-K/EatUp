import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { groupOrderApi } from "../api/groupOrderApi";
import { socketClient } from "../socket/socketClient";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const ACTIVE_ROOM_KEY = "eatup_active_room_code";

const GroupOrderContext = createContext(null);

export function GroupOrderProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeRoomCode, setActiveRoomCode] = useState(
    () => sessionStorage.getItem(ACTIVE_ROOM_KEY) || null
  );
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomLoading, setRoomLoading] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [groupConflict, setGroupConflict] = useState(null);

  const persistRoomCode = useCallback((code) => {
    if (code) {
      const normalized = code.toUpperCase().trim();
      sessionStorage.setItem(ACTIVE_ROOM_KEY, normalized);
      setActiveRoomCode(normalized);
    } else {
      sessionStorage.removeItem(ACTIVE_ROOM_KEY);
      setActiveRoomCode(null);
      setActiveRoom(null);
    }
  }, []);

  // Connect Socket.IO and join channel whenever user + activeRoomCode are active
  useEffect(() => {
    if (!user || !activeRoomCode) {
      if (socketClient.connected) socketClient.disconnect();
      return;
    }

    if (!socketClient.connected) {
      socketClient.connect();
    }

    const handleConnect = () => {
      socketClient.emit("group:join", { roomCode: activeRoomCode }, (res) => {
        if (res?.success && res.groupOrder) {
          setActiveRoom(res.groupOrder);
        } else if (res && !res.success) {
          persistRoomCode(null);
        }
      });
    };

    const handleState = (groupOrder) => {
      if (groupOrder?.roomCode === activeRoomCode) {
        setActiveRoom(groupOrder);
      }
    };

    const handleUserJoined = ({ name }) => {
      showToast(`${name} joined the group order!`, "👥");
    };

    const handleUserLeft = ({ name }) => {
      showToast(`${name} left the group order.`, "👋");
    };

    const handleLockChanged = ({ status }) => {
      showToast(
        status === "locked"
          ? "Host locked the group cart for checkout."
          : "Host unlocked the group cart for edits.",
        status === "locked" ? "🔒" : "🔓"
      );
    };

    const handleFinalized = ({ orderNumber }) => {
      persistRoomCode(null);
      showToast(`Group order #${orderNumber} placed by host!`, "🎉");
      navigate(`/confirmation/${orderNumber}`);
    };

    socketClient.on("connect", handleConnect);
    socketClient.on("group:state", handleState);
    socketClient.on("group:user_joined", handleUserJoined);
    socketClient.on("group:user_left", handleUserLeft);
    socketClient.on("group:lock_changed", handleLockChanged);
    socketClient.on("group:finalized", handleFinalized);

    if (socketClient.connected) {
      handleConnect();
    }

    return () => {
      socketClient.off("connect", handleConnect);
      socketClient.off("group:state", handleState);
      socketClient.off("group:user_joined", handleUserJoined);
      socketClient.off("group:user_left", handleUserLeft);
      socketClient.off("group:lock_changed", handleLockChanged);
      socketClient.off("group:finalized", handleFinalized);
    };
  }, [user, activeRoomCode, persistRoomCode, showToast, navigate]);

  const createRoom = useCallback(
    async (restaurantId = null) => {
      setRoomLoading(true);
      try {
        const res = await groupOrderApi.create({ restaurantId });
        setActiveRoom(res.groupOrder);
        persistRoomCode(res.groupOrder.roomCode);
        showToast(`Group room ${res.groupOrder.roomCode} created!`, "🎉");
        return res.groupOrder;
      } finally {
        setRoomLoading(false);
      }
    },
    [persistRoomCode, showToast]
  );

  const joinRoom = useCallback(
    async (roomCode) => {
      const normalized = roomCode.toUpperCase().trim();
      setRoomLoading(true);
      try {
        const res = await groupOrderApi.join(normalized);
        setActiveRoom(res.groupOrder);
        persistRoomCode(res.groupOrder.roomCode);
        return res.groupOrder;
      } finally {
        setRoomLoading(false);
      }
    },
    [persistRoomCode]
  );

  const leaveRoom = useCallback(async () => {
    if (!activeRoomCode) return;
    try {
      if (socketClient.connected) {
        await new Promise((resolve) => {
          socketClient.emit("group:leave", { roomCode: activeRoomCode }, () => resolve());
        });
      } else {
        await groupOrderApi.leave(activeRoomCode);
      }
      showToast("Left group order room.", "👋");
    } catch {
      // Clear local state regardless
    } finally {
      persistRoomCode(null);
    }
  }, [activeRoomCode, persistRoomCode, showToast]);

  const addRoomItem = useCallback(
    async (restaurant, dish, replace = false) => {
      if (!activeRoomCode) return { success: false };
      const dishId = dish.id || dish.dishId;

      if (socketClient.connected) {
        return new Promise((resolve) => {
          socketClient.emit(
            "group:add_item",
            { roomCode: activeRoomCode, restaurantId: restaurant.id, dishId, replace },
            (res) => {
              if (res?.success) {
                setActiveRoom(res.groupOrder);
                showToast(`Added "${dish.name}" to group cart!`, "👥");
                resolve({ success: true });
              } else if (res?.conflict) {
                setGroupConflict({
                  restaurant,
                  dish,
                  isCreator: res.isCreator,
                  existingRestaurant: res.existingRestaurant,
                  newRestaurant: res.newRestaurant
                });
                resolve({ conflict: true });
              } else {
                showToast(res?.message || "Could not add item to group cart.", "⚠️");
                resolve({ success: false });
              }
            }
          );
        });
      }

      try {
        const res = await groupOrderApi.addItem(activeRoomCode, {
          restaurantId: restaurant.id,
          dishId,
          replace
        });
        setActiveRoom(res.groupOrder);
        showToast(`Added "${dish.name}" to group cart!`, "👥");
        return { success: true };
      } catch (err) {
        const data = err?.response?.data;
        if (err?.response?.status === 409 && data?.conflict) {
          setGroupConflict({
            restaurant,
            dish,
            isCreator: data.isCreator,
            existingRestaurant: data.existingRestaurant,
            newRestaurant: data.newRestaurant
          });
          return { conflict: true };
        }
        showToast(data?.message || "Could not add item to group cart.", "⚠️");
        return { success: false };
      }
    },
    [activeRoomCode, showToast]
  );

  const updateRoomItemQty = useCallback(
    async (dishId, delta) => {
      if (!activeRoomCode) return;
      if (socketClient.connected) {
        socketClient.emit("group:update_qty", { roomCode: activeRoomCode, dishId, delta }, (res) => {
          if (res?.success) {
            setActiveRoom(res.groupOrder);
          } else if (res?.message) {
            showToast(res.message, "⚠️");
          }
        });
        return;
      }
      try {
        const res = await groupOrderApi.updateQty(activeRoomCode, dishId, { delta });
        setActiveRoom(res.groupOrder);
      } catch (err) {
        showToast(err?.response?.data?.message || "Failed to update item.", "⚠️");
      }
    },
    [activeRoomCode, showToast]
  );

  const toggleLock = useCallback(
    async (locked) => {
      if (!activeRoomCode) return;
      const res = await groupOrderApi.toggleLock(activeRoomCode, locked);
      setActiveRoom(res.groupOrder);
      return res.groupOrder;
    },
    [activeRoomCode]
  );

  const finalizeRoomOrder = useCallback(
    async (deliveryPayload) => {
      if (!activeRoomCode) throw new Error("No active group room.");
      const res = await groupOrderApi.finalize(activeRoomCode, deliveryPayload);
      persistRoomCode(null);
      return res.order;
    },
    [activeRoomCode, persistRoomCode]
  );

  const resolveGroupConflictReplace = useCallback(async () => {
    if (!groupConflict) return;
    const { restaurant, dish } = groupConflict;
    setGroupConflict(null);
    await addRoomItem(restaurant, dish, true);
  }, [groupConflict, addRoomItem]);

  const cancelGroupConflict = useCallback(() => setGroupConflict(null), []);

  const isCreator = Boolean(user && activeRoom && activeRoom.creatorId === user.id);

  const myBill = useMemo(() => {
    if (!user || !activeRoom?.participantBills) return null;
    return activeRoom.participantBills.find((b) => b.userId === user.id) || null;
  }, [user, activeRoom]);

  const clearRoomLocal = useCallback(() => persistRoomCode(null), [persistRoomCode]);

  return (
    <GroupOrderContext.Provider
      value={{
        activeRoomCode,
        activeRoom,
        isCreator,
        myBill,
        roomLoading,
        joinModalOpen,
        setJoinModalOpen,
        createRoom,
        joinRoom,
        leaveRoom,
        clearRoomLocal,
        addRoomItem,
        updateRoomItemQty,
        toggleLock,
        finalizeRoomOrder,
        groupConflict,
        resolveGroupConflictReplace,
        cancelGroupConflict
      }}
    >
      {children}
    </GroupOrderContext.Provider>
  );
}

export function useGroupOrder() {
  const ctx = useContext(GroupOrderContext);
  if (!ctx) throw new Error("useGroupOrder must be used within GroupOrderProvider");
  return ctx;
}
