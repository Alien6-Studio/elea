"use client";

import { useId, useState, type ReactNode } from "react";
import { Field, Input, Select } from "@alien6-studio/elea-ui";
import { isValidOutputSize, MAX_OUTPUT_DIMENSION, type CropRecipe, type Size } from "./crop.js";
import type { CropCornerLabels } from "./CropMask.js";

/** Give a publication format an exact output size or lock just its proportions. */
export type CropPreset = { value: string; label: string } & (
  { outputSize: Size; aspect?: never } | { aspect: number; outputSize?: never }
);
const square = { width: 1080, height: 1080 };
const defaultPresets: readonly CropPreset[] = [
  { value: "square", label: "1:1 · 1080 × 1080", outputSize: square },
  { value: "landscape", label: "16:9 · 1600 × 900", outputSize: { width: 1600, height: 900 } },
  { value: "portrait", label: "4:5 · 1080 × 1350", outputSize: { width: 1080, height: 1350 } },
];

export interface CropFormatOptions {
  labels: {
    format: string;
    original: string;
    free: string;
    custom: string;
    move: string;
    resize: string;
    corners?: CropCornerLabels | undefined;
    width: string;
    height: string;
    invalidSize: string;
  };
  /** Defaults to the supplied output size in custom mode, otherwise to the original aspect. */
  defaultValue?: string | undefined;
  /** Replaces the supplied square, landscape and portrait presets. Original, free and custom remain available. */
  presets?: readonly CropPreset[] | undefined;
}

interface Draft {
  width: string;
  height: string;
  /** Keep the frame steady while one of its dimensions is being edited. */
  lastValid: Size | undefined;
}

export function useCropFormat(formats: CropFormatOptions | undefined, initialSize?: Size, natural?: Size | null, disabled = false, initialCrop?: CropRecipe): {
  controls: ReactNode;
  outputSize: Size | undefined;
  aspect?: number | undefined;
  format?: string | undefined;
  invalid: boolean;
  free: boolean;
} {
  const errorId = useId();
  const [choice, setChoice] = useState<string>();
  const [draft, setDraft] = useState<Draft>();
  if (!formats) return { controls: null, outputSize: initialSize, invalid: false, free: false };

  const presets = formats.presets ?? defaultPresets;
  // An older ratio-only preset can still be edited after the host removes it.
  const sourceMode = initialCrop?.mask ? "free" : "original";
  const fallback = initialSize ? "custom" : sourceMode;
  const requested = choice ?? initialCrop?.format ?? formats.defaultValue ?? fallback;
  const preset = presets.find(item => item.value === requested);
  const format = preset || ["original", "free", "custom"].includes(requested) ? requested : fallback;
  const initial = initialSize ?? (isValidOutputSize(natural) ? natural : square);
  const custom = draft ?? { width: String(initial.width), height: String(initial.height), lastValid: isValidOutputSize(initial) ? initial : undefined };
  const size = { width: Number(custom.width), height: Number(custom.height) };
  const invalid = format === "custom" && !isValidOutputSize(size);
  const free = format === "free";
  const outputSize = format === "custom" ? custom.lastValid : preset?.outputSize;
  const { labels } = formats;

  function edit(axis: keyof Size, text: string) {
    const next = { ...custom, [axis]: text };
    const nextSize = { width: Number(next.width), height: Number(next.height) };
    if (isValidOutputSize(nextSize)) next.lastValid = nextSize;
    setDraft(next);
  }

  // A pixel-area error involves both dimensions. A bad width or height belongs to its own field.
  const badWidth = !isValidOutputSize({ width: size.width, height: 1 });
  const badHeight = !isValidOutputSize({ width: 1, height: size.height });
  const badArea = invalid && !badWidth && !badHeight;
  const dimension = (axis: keyof Size, hasError: boolean) => (
    <Field label={labels[axis]} className="elea-cropper__format-field">
      {control => <Input id={control.id} type="number" inputMode="numeric" min={1} max={MAX_OUTPUT_DIMENSION} step={1}
        disabled={disabled} value={custom[axis]} onChange={event => edit(axis, event.currentTarget.value)}
        invalid={hasError} aria-describedby={hasError ? errorId : undefined} />}
    </Field>
  );
  const options = [
    { value: "original", label: labels.original },
    { value: "free", label: labels.free },
    ...presets,
    { value: "custom", label: labels.custom },
  ];
  const controls = (
    <div className="elea-cropper__formats">
      <Field label={labels.format} className="elea-cropper__format-field">
        {control => <Select id={control.id} label={labels.format} options={options} value={format}
          disabled={disabled} onChange={setChoice} />}
      </Field>
      {format === "custom" && <div className="elea-cropper__dimensions">
        {dimension("width", badWidth || badArea)}
        {dimension("height", badHeight || badArea)}
      </div>}
      {invalid && <p id={errorId} className="elea-field__error elea-cropper__format-error" role="alert">{labels.invalidSize}</p>}
    </div>
  );
  return { controls, outputSize, aspect: preset?.aspect, format, invalid, free };
}
