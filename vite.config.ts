import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ✅ Fix: Make sure the path is correct
      "@emotion/is-prop-valid": path.resolve(__dirname, "node_modules/@emotion/is-prop-valid/dist/emotion-is-prop-valid.cjs.js"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "framer-motion",
    ],
  },
  server: {
    host: '0.0.0.0', // ✅ ADD THIS - Listen on all network interfaces
    port: 1211,       // Your port
    strictPort: true, // Don't try other ports if 1211 is taken
  },
})