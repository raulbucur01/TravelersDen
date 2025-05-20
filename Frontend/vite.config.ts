import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import fs from "fs";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    https: {
      key: fs.readFileSync("./certs/localhost-key.pem"),
      cert: fs.readFileSync("./certs/localhost.pem"),
    },
    port: 5173,
    proxy: {
      // Proxy backend calls to .NET API
      "/auth": {
        target: "https://localhost:7007",
        changeOrigin: true,
        secure: false,
      },
      "/users": {
        target: "https://localhost:7007",
        changeOrigin: true,
        secure: false,
      },
      "/posts": {
        target: "https://localhost:7007",
        changeOrigin: true,
        secure: false,
      },
      "/comments": {
        target: "https://localhost:7007",
        changeOrigin: true,
        secure: false,
      },
      "/itinerary-generator": {
        target: "https://localhost:7007",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
