import type { ComponentType, ReactNode } from "react";
import { Button, Slider } from "@alien6-studio/elea-ui";
import type { CropRecipe, CropRect, Size } from "./crop.js";
import { useCropFormat, type CropFormatOptions } from "./CropFormatControls.js";
import { useCropMask } from "./CropMask.js";

export interface CropLayout {
  outputSize?: Size | undefined;
  mask?: CropRect;
  format?: string | undefined;
  overlay?: ReactNode;
  controls?: ReactNode;
  invalid: boolean;
  Button?: ComponentType<CropButtonProps>;
  Slider?: ComponentType<CropSliderProps>;
}

export interface CropButtonProps {
  variant: "primary" | "outline";
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}

export interface CropSliderProps {
  min: number;
  max: number;
  step: number;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export interface AdjustableCropProps {
  formats: CropFormatOptions;
  frame: Size;
  natural: Size | null;
  initialSize?: Size | undefined;
  initialCrop?: CropRecipe | undefined;
  disabled: boolean;
  children: (layout: CropLayout) => ReactNode;
}

/** Load the format picker and direct manipulation only for hosts that request them. */
export default function AdjustableCrop({ formats, frame, natural, initialSize, initialCrop, disabled, children }: AdjustableCropProps) {
  const { controls, outputSize, aspect, format, invalid, free } = useCropFormat(formats, initialSize, natural, disabled, initialCrop);
  const ratio = outputSize ? outputSize.width / outputSize.height : aspect ?? frame.width / frame.height;
  const { rect, overlay } = useCropMask(frame, free ? undefined : ratio, formats.labels, disabled, initialCrop?.mask);
  return children({ controls, outputSize, format, invalid, mask: rect, overlay, Button, Slider });
}
