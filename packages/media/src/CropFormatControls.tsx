"use client";

import { useId, useState, type ReactNode } from "react";
import { Field, Input, Select } from "@alien6-studio/elea-ui";
import { isValidOutputSize, MAX_OUTPUT_DIMENSION, type Size } from "./crop.js";

const presets = {
  square: { ratio: "1:1", size: { width: 1080, height: 1080 } },
  landscape: { ratio: "16:9", size: { width: 1600, height: 900 } },
  portrait: { ratio: "4:5", size: { width: 1080, height: 1350 } },
} as const;
type Format = keyof typeof presets | "original" | "custom" | "free";

export interface CropFormatOptions {
  labels: {
    format: string;
    original: string;
    free: string;
    custom: string;
    move: string;
    resize: string;
    width: string;
    height: string;
    invalidSize: string;
  };
  /** Defaults to the supplied output size in custom mode, otherwise to the original aspect. */
  defaultValue?: Format | undefined;
}

interface Draft {
  width: string;
  height: string;
  /** Keep the frame steady while one of its dimensions is being edited. */
  lastValid: Size | undefined;
}

export function useCropFormat(formats: CropFormatOptions | undefined, initialSize?: Size, natural?: Size | null, disabled = false): {
  controls: ReactNode;
  outputSize: Size | undefined;
  invalid: boolean;
  free: boolean;
} {
  const errorId = useId();
  const [choice, setChoice] = useState<Format>();
  const [draft, setDraft] = useState<Draft>();
  if (!formats) return { controls: null, outputSize: initialSize, invalid: false, free: false };

  const format = choice ?? formats.defaultValue ?? (initialSize ? "custom" : "original");
  const initial = initialSize ?? (isValidOutputSize(natural) ? natural : presets.square.size);
  const custom = draft ?? { width: String(initial.width), height: String(initial.height), lastValid: isValidOutputSize(initial) ? initial : undefined };
  const size = { width: Number(custom.width), height: Number(custom.height) };
  const invalid = format === "custom" && !isValidOutputSize(size);
  const free = format === "free";
  let outputSize: Size | undefined;
  if (format === "custom") outputSize = custom.lastValid;
  else if (!free && format !== "original") outputSize = presets[format].size;
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
    ...Object.entries(presets).map(([value, { ratio, size }]) => ({ value, label: `${ratio} · ${size.width} × ${size.height}` })),
    { value: "custom", label: labels.custom },
  ];
  const controls = (
    <div className="elea-cropper__formats">
      <Field label={labels.format} className="elea-cropper__format-field">
        {control => <Select id={control.id} label={labels.format} options={options} value={format}
          disabled={disabled} onChange={next => setChoice(next as Format)} />}
      </Field>
      {format === "custom" && <div className="elea-cropper__dimensions">
        {dimension("width", badWidth || badArea)}
        {dimension("height", badHeight || badArea)}
      </div>}
      {invalid && <p id={errorId} className="elea-field__error elea-cropper__format-error" role="alert">{labels.invalidSize}</p>}
    </div>
  );
  return { controls, outputSize, invalid, free };
}
