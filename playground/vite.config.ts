import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { defineConfig, type PreviewServer, type ViteDevServer } from "vite";

function serveSiteAssets(server: ViteDevServer | PreviewServer) {
  server.middlewares.use("/elea/colours", (_request, response) => {
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(readFileSync(new URL("../docs/colours/index.html", import.meta.url)));
  });
  server.middlewares.use("/elea/assets/site-theme.js", (_request, response) => {
    response.setHeader("Content-Type", "text/javascript; charset=utf-8");
    response.end(readFileSync(new URL("../docs/assets/site-theme.js", import.meta.url)));
  });
}

export default defineConfig({
  base: "/elea/playground/",
  build: {
    rolldownOptions: {
      input: { index: "index.html", "glyph-carousel": "glyph-carousel.js", "site-profile": "site-profile.js" },
      output: { entryFileNames: entry => ["glyph-carousel", "site-profile"].includes(entry.name) ? "[name].js" : "assets/[name]-[hash].js" },
    },
  },
  plugins: [
    react(),
    {
      name: "site-assets",
      configureServer: serveSiteAssets,
      configurePreviewServer: serveSiteAssets,
    },
  ],
});
