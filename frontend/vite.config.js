import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["./babel-plugin-imagine-loc.cjs"],
      },
    }),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    // In dev the browser sends /api to the Go backend, so CORS is never needed.
    // Uploaded images are served from /api/uploads/<name> by that same backend,
    // so there is no separate media prefix to proxy.
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
    },
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
