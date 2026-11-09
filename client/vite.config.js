import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  // Client tests (npm test): plain logic tests that run in Node, no browser. Files end in .test.js and sit next to the code.
  test: {
    environment: 'node',
    include: ['src/**/*.test.{js,jsx}'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'router': ['react-router-dom'],
          'motion': ['framer-motion'],
          'axios': ['axios'],
        }
      }
    }
  }
});
