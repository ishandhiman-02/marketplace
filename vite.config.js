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
    // dev mein browser /api aur /uploads ko Express pe bhej deta hai,
    // isliye CORS ki zaroorat nahi padti
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
      "/uploads": { target: "http://localhost:3001", changeOrigin: true },
    },
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
