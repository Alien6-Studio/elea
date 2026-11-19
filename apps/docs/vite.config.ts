import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Served from https://alien6-studio.github.io/elea/ on GitHub Pages
export default defineConfig({
  base: process.env.DOCS_BASE ?? "/elea/",
  plugins: [react()],
  server: { port: 5174, strictPort: true },
});
