import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const serverUrl = process.env.VITE_SERVER_URL || "http://localhost:5000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: serverUrl,
        changeOrigin: true
      },
      "/socket.io": {
        target: serverUrl,
        ws: true,
        changeOrigin: true
      }
    }
  }
});
