import type { EleaBlock } from "@alien6-studio/elea-content";
import { sitePath } from "./links.js";

export const glacierImage = {
  id: "image",
  type: "image",
  data: {
    file: { id: "", url: `${sitePath}assets/glacier.webp` },
    alt: "Blue crevasses and white ridges seen from above a glacier",
    caption: "Aerial study of a glacier",
  },
} satisfies EleaBlock;

export const notebookTitle = "The glacier notebook";
export const notebookOpening = "From above, the ice reads like a map. Fine blue lines gather into deep folds where the glacier bends around the rock.";
export const notebookSummary = "Field notes on the shapes that ice leaves behind.";
