import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import history from "connect-history-api-fallback";
import fs from "fs";
import type { Connect } from "vite";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "spa-fallback",
      configureServer(server) {
        server.middlewares.use(
          history({
            disableDotRule: true,
            htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
          }) as Connect.NextHandleFunction
        );
      },
    },
  ],
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
    fs: {
      strict: false,
    },
  },
});
