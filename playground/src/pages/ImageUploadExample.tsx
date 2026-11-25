"use client";

import { useEffect, useRef, useState } from "react";
import { createCropFormats, DropZone, ImageCropper, useObjectUrl } from "@alien6-studio/elea-media";
import { Button } from "@alien6-studio/elea-ui";
import "@alien6-studio/elea-media/styles.css";
import "@alien6-studio/elea-media/crop-adjustments.css";

// Load @alien6-studio/elea-ui/bundle.css once in the app for tokens and controls.

type Step =
  | { kind: "choose"; error?: string }
  | { kind: "crop"; file?: File }
  | { kind: "ready"; blob: Blob; name: string };

const coverFormats = createCropFormats({
  defaultValue: "landscape",
  labels: {
    format: "Crop format", width: "Width (px)", height: "Height (px)",
    custom: "Custom dimensions", original: "Original ratio", free: "Free ratio",
    move: "Move crop area", resize: "Resize crop area",
    invalidSize: "Use whole pixels from 1 to 8192 per side, up to 16,777,216 pixels in total.",
  },
});

export function ImageUploadExample({ sampleUrl }: { sampleUrl: string }) {
  const [step, setStep] = useState<Step>({ kind: "crop" });
  const result = useObjectUrl(step.kind === "ready" ? step.blob : null);
  const container = useRef<HTMLDivElement>(null);
  const previous = useRef(step.kind);

  useEffect(() => {
    const root = container.current;
    if (!root || previous.current === step.kind) return;
    const selector = { choose: 'label[tabindex="0"]', crop: 'button[role="combobox"]:enabled', ready: 'a[download]' }[step.kind];
    function focusControl() {
      const next = root?.querySelector<HTMLElement>(selector);
      if (!next) return false;
      next.focus();
      previous.current = step.kind;
      return true;
    }
    if (focusControl()) return;
    // The crop controls and the downloadable URL can become available after the step changes.
    const observer = new MutationObserver(() => { if (focusControl()) observer.disconnect(); });
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["disabled"] });
    return () => observer.disconnect();
  }, [step.kind]);

  function chooseImage(error?: string) {
    setStep({ kind: "choose", error });
  }

  return (
    <div ref={container} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--elea-space-3)", width: "min(100%, 640px)", marginInline: "auto" }}>
      {step.kind === "choose" && <>
        <DropZone accept="image/jpeg,image/png,image/webp" label="Choose an image"
          hint="Drop a JPEG, PNG or WebP here." error={step.error}
          onRejected={() => chooseImage("Choose a JPEG, PNG or WebP image.")}
          onFiles={([file]) => { if (file) setStep({ kind: "crop", file }); }} />
        <div><Button variant="outline" onClick={() => setStep({ kind: "crop" })}>Use glacier photo</Button></div>
      </>}
      {step.kind === "crop" && (
        <div onErrorCapture={() => chooseImage("This image could not be opened. Choose another image.")}>
          <ImageCropper file={step.file} src={step.file ? undefined : sampleUrl}
            maxHeight={360} export={{ type: "image/png" }}
            formats={coverFormats}
            labels={{ image: "Cover crop", zoom: "Zoom", rotation: "Rotation", cancel: "Replace image", confirm: "Use crop" }}
            onCancel={() => chooseImage()}
            onConfirm={(blob) => {
              if (!blob) return chooseImage("This image could not be exported. Try another image.");
              const name = step.file?.name.replace(/\.[^.]+$/, "") || "glacier";
              setStep({ kind: "ready", blob, name: `${name}-cover.png` });
            }} />
        </div>
      )}
      {step.kind === "ready" && result && <>
        <img src={result} alt="Cropped cover" style={{ display: "block", width: "100%", height: "auto" }} />
        <div style={{ display: "flex", gap: "var(--elea-space-2)", flexWrap: "wrap" }}>
          <Button href={result} download={step.name}>Download PNG</Button>
          <Button variant="outline" onClick={() => chooseImage()}>Replace image</Button>
        </div>
      </>}
    </div>
  );
}
