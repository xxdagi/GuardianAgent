import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Dev: proxy /api to the BFF (never to the backend directly).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: true,
    proxy: { "/api": process.env.BFF_URL ?? "http://localhost:4000" },
  },
});
