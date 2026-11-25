import { Server } from "socket.io";
import { parse as parseCookie } from "cookie";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import {
  addItemToGroupRoom,
  joinGroupRoom,
  leaveGroupRoom,
  setGroupRoomLock,
  setParticipantOnlineStatus,
  updateGroupItemQty
} from "../services/groupOrderService.js";

export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigins,
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  // Authenticate every Socket.IO connection via HTTP-only JWT cookie
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers?.cookie || "";
      const parsed = parseCookie(rawCookie);
      const token = parsed[env.cookieName];
      if (!token) {
        return next(new Error("Authentication required for real-time ordering."));
      }

      const decoded = jwt.verify(token, env.jwtSecret);
      const user = await User.findById(decoded.sub);
      if (!user) {
        return next(new Error("Invalid session."));
      }

      socket.user = user;
      return next();
    } catch {
      return next(new Error("Invalid or expired authentication cookie."));
    }
  });

  io.on("connection", (socket) => {
    socket.data.activeRooms = new Set();

    socket.on("group:join", async ({ roomCode } = {}, ack) => {
      try {
        if (!roomCode) throw new Error("Room code is required.");
        const normalized = roomCode.toUpperCase().trim();
        const groupOrder = await joinGroupRoom({ roomCode: normalized, user: socket.user });
        const channel = `room:${normalized}`;
        await socket.join(channel);
        socket.data.activeRooms.add(normalized);

        io.to(channel).emit("group:state", groupOrder);
        socket.to(channel).emit("group:user_joined", {
          userId: socket.user._id.toString(),
          name: socket.user.name
        });

        if (typeof ack === "function") ack({ success: true, groupOrder });
      } catch (err) {
        if (typeof ack === "function") {
          ack({ success: false, message: err.message });
        }
      }
    });

    socket.on("group:leave", async ({ roomCode } = {}, ack) => {
      try {
        if (!roomCode) throw new Error("Room code is required.");
        const normalized = roomCode.toUpperCase().trim();
        const groupOrder = await leaveGroupRoom({ roomCode: normalized, user: socket.user });
        const channel = `room:${normalized}`;
        await socket.leave(channel);
        socket.data.activeRooms.delete(normalized);

        io.to(channel).emit("group:state", groupOrder);
        socket.to(channel).emit("group:user_left", {
          userId: socket.user._id.toString(),
          name: socket.user.name
        });

        if (typeof ack === "function") ack({ success: true, groupOrder });
      } catch (err) {
        if (typeof ack === "function") {
          ack({ success: false, message: err.message });
        }
      }
    });

    socket.on("group:add_item", async ({ roomCode, restaurantId, dishId, replace = false } = {}, ack) => {
      try {
        const normalized = (roomCode || "").toUpperCase().trim();
        const groupOrder = await addItemToGroupRoom({
          roomCode: normalized,
          user: socket.user,
          restaurantId,
          dishId,
          replace
        });
        io.to(`room:${normalized}`).emit("group:state", groupOrder);
        if (typeof ack === "function") ack({ success: true, groupOrder });
      } catch (err) {
        if (typeof ack === "function") {
          ack({
            success: false,
            message: err.message,
            conflict: Boolean(err.conflict),
            isCreator: err.isCreator,
            existingRestaurant: err.existingRestaurant,
            newRestaurant: err.newRestaurant
          });
        }
      }
    });

    socket.on("group:update_qty", async ({ roomCode, dishId, delta } = {}, ack) => {
      try {
        const normalized = (roomCode || "").toUpperCase().trim();
        const groupOrder = await updateGroupItemQty({
          roomCode: normalized,
          user: socket.user,
          dishId,
          delta
        });
        io.to(`room:${normalized}`).emit("group:state", groupOrder);
        if (typeof ack === "function") ack({ success: true, groupOrder });
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, message: err.message });
      }
    });

    socket.on("group:toggle_lock", async ({ roomCode, locked } = {}, ack) => {
      try {
        const normalized = (roomCode || "").toUpperCase().trim();
        const groupOrder = await setGroupRoomLock({
          roomCode: normalized,
          user: socket.user,
          locked: Boolean(locked)
        });
        const channel = `room:${normalized}`;
        io.to(channel).emit("group:state", groupOrder);
        io.to(channel).emit("group:lock_changed", { status: groupOrder.status });
        if (typeof ack === "function") ack({ success: true, groupOrder });
      } catch (err) {
        if (typeof ack === "function") ack({ success: false, message: err.message });
      }
    });

    socket.on("disconnect", async () => {
      for (const roomCode of socket.data.activeRooms) {
        try {
          const updated = await setParticipantOnlineStatus(roomCode, socket.user._id, false);
          if (updated) {
            io.to(`room:${roomCode}`).emit("group:state", updated);
          }
        } catch {
          // Ignore disconnect cleanup errors
        }
      }
    });
  });

  return io;
}
