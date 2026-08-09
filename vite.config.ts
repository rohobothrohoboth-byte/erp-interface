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
      // ✅ Try this alternative path for emotion
      "@emotion/is-prop-valid": path.resolve(__dirname, "node_modules/@emotion/is-prop-valid/dist/emotion-is-prop-valid.cjs.js"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "framer-motion",
    ],
    // ✅ Remove @emotion packages from include if they don't exist
  },
  server: {
    port: 1211,
  },
})