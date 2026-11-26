import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || undefined;

if (import.meta.env.PROD && !socketUrl) {
  console.warn("[EatUp Socket] VITE_SOCKET_URL is not set; falling back to window.location.origin.");
}

export const socketClient = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"]
});
