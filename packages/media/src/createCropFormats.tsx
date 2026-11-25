import { lazy, type ReactNode } from "react";
import type { AdjustableCropProps } from "./AdjustableCrop.js";
import type { CropFormatOptions } from "./CropFormatControls.js";

const AdjustableCrop = /* @__PURE__ */ lazy(() => import("./AdjustableCrop.js"));
export type CropFormats = (props: Omit<AdjustableCropProps, "formats">) => ReactNode;

/** Opt into the format picker and movable mask. The controls load when the cropper displays them. */
export function createCropFormats(options: CropFormatOptions): CropFormats {
  return props => <AdjustableCrop {...props} formats={options} />;
}
