import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { defineConfig, type PreviewServer, type ViteDevServer } from "vite";
import { documentedRelease } from "./scripts/repository-metadata.js";

function serveSiteAssets(server: ViteDevServer | PreviewServer) {
  for (const filename of ["glacier.webp", "glacier-560.webp", "harbour-light.webp", "harbour-light-square.webp"]) {
    server.middlewares.use(`/elea/assets/${filename}`, (_request, response) => {
      response.setHeader("Content-Type", "image/webp");
      response.end(readFileSync(new URL(`../docs/assets/${filename}`, import.meta.url)));
    });
  }
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
  define: {
    "import.meta.env.VITE_ELEA_REPOSITORY_METADATA": JSON.stringify(
      process.env.VITE_ELEA_REPOSITORY_METADATA || JSON.stringify({ release: documentedRelease() })
    ),
  },
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
