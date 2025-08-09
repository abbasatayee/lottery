import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  server: {
    proxy: {
      // Proxy for backend API
      "/api/backend": {
        target:
          "https://cst-lottery-backend-mvqoxevj.az-csprod1.cloud-station.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/backend/, ""),
      },
    },
  },
  base: "./",
});
