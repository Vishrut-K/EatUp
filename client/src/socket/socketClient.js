import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || undefined;

export const socketClient = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"]
});
