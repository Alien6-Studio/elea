// MkDocs provides the page and its fallback text. Vite serves this module in both preview and production.
import "@vitejs/plugin-react/preamble";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { GeometryPage } from "./src/pages/geometry/GeometryPage.tsx";

const root = document.getElementById("research-lab");
createRoot(root).render(createElement(GeometryPage, { view: root.dataset.view }));
