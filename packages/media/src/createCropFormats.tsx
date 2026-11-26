import { lazy, type ReactNode } from "react";
import type { AdjustableCropProps } from "./AdjustableCrop.js";
import type { CropFormatOptions } from "./CropFormatControls.js";
import { isValidOutputSize } from "./crop.js";

const AdjustableCrop = /* @__PURE__ */ lazy(() => import("./AdjustableCrop.js"));
export type CropFormats = (props: Omit<AdjustableCropProps, "formats">) => ReactNode;

/** Opt into the format picker and movable mask. The controls load when the cropper displays them. */
export function createCropFormats(options: CropFormatOptions): CropFormats {
  const values = new Set(["original", "free", "custom"]);
  for (const preset of options.presets ?? []) {
    if (!preset.value.trim() || !preset.label.trim() || values.has(preset.value)) throw new TypeError("A crop preset needs a unique value and a label.");
    if (preset.outputSize ? !isValidOutputSize(preset.outputSize) : !(Number.isFinite(preset.aspect) && preset.aspect > 0)) {
      throw new RangeError("A crop preset needs valid output dimensions or a positive aspect ratio.");
    }
    values.add(preset.value);
  }
  return props => <AdjustableCrop {...props} formats={options} />;
}
