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
            // Skip API routes from SPA fallback
            rewrites: [
              {
                from: /^\/api\/.*$/,
                to: (context) => context.parsedUrl.pathname || "/",
              },
            ],
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
      // Single catch-all for API routes to forward to .NET backend
      "/api": {
        target: "https://localhost:7007",
        changeOrigin: true,
        secure: false,
        // Preserve /api prefix in backend requests
        rewrite: (path) => path,
      },
    },
    fs: {
      strict: false,
    },
  },
});
