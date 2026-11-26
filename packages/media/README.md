# @alien6-studio/elea-media

Media components for React on Elea tokens: a drop zone for files and an image cropper with
zoom and rotation. Labels come from the host; styles come from `styles.css` and read
`--elea-*` variables only.

This package ships ES modules only. For Jest with `next/jest`, add `@alien6-studio/elea-media` to `transpilePackages`. Include `@alien6-studio/elea-ui` when testing the crop format controls.

```tsx
"use client";

import { createCropFormats, DropZone, ImageCropper } from "@alien6-studio/elea-media";
import "@alien6-studio/elea-media/bundle.css"; // the tokens, then styles.css

<DropZone accept="image/*" label="Click to add an image" hint="or drop one here" onFiles={([file]) => setFile(file)} />

<ImageCropper
  file={file}
  aspect={16 / 9}
  labels={{ zoom: "Zoom", rotation: "Rotation", confirm: "Use this image", cancel: "Cancel", image: "Picture to frame" }}
  onConfirm={(blob) => {
    if (blob) upload(blob);
    else setError("The cropped image could not be exported.");
  }}
/>
```

The geometry (`cropRect`, `coverScale`, `exportCrop`) is exported on its own for hosts that draw
their own frame.

Pass `export={{ outputSize: { width: 1200, height: 800 } }}` for an exact pixel size, including
upscaling. The preview uses that ratio. Exact dimensions take precedence over `aspect` and
`maxWidth`. Each side accepts 1–8192 whole pixels, up to 16,777,216 pixels in total.

Pass `formats={createCropFormats(options)}` to let people move and resize a crop area on the photo.
The move and resize controls accept arrow keys. Include the four `labels.corners` below to show a handle
at each corner and a composition grid during adjustment. Choose the original ratio, a square
(1080 × 1080), landscape (1600 × 900), portrait (1080 × 1350), custom pixel dimensions or
a free ratio. With `formats` enabled, the confirm button stays disabled until the image has loaded.
Free crops export the selected source pixels at their natural resolution.
The media `bundle.css` includes the format controls. When importing individual styles,
load the media `styles.css` and `crop-adjustments.css` alongside the UI styles for Field,
Select, Slider and Button.

```tsx
<ImageCropper file={file} labels={labels} onConfirm={saveCrop}
  formats={createCropFormats({
    defaultValue: "cover",
    presets: [
      { value: "cover", label: "Article cover · 1600 × 900", outputSize: { width: 1600, height: 900 } },
      { value: "card", label: "Story card · 4:5", aspect: 4 / 5 },
    ],
    labels: {
      format: "Crop format", original: "Original ratio", free: "Free ratio",
      custom: "Custom dimensions", width: "Width (px)", height: "Height (px)",
      move: "Move crop area", resize: "Resize crop area",
      corners: {
        topLeft: "Resize from top left", topRight: "Resize from top right",
        bottomLeft: "Resize from bottom left", bottomRight: "Resize from bottom right",
      },
      invalidSize: "Use whole pixels from 1 to 8192 per side, up to 16,777,216 pixels in total.",
    },
  })}
/>
```

To adjust an exported crop, retain its original file or URL and the recipe from the
fourth argument of `onConfirm`. Mount a new cropper for each edit, pass the same
original, the same format definitions and the saved `initialCrop`. A recipe contains
only JSON data. Its coordinates scale to the current viewport. Each placement of an
image can keep its own recipe.

```tsx
<ImageCropper
  file={original}
  formats={formats}
  initialCrop={savedRecipe}
  labels={labels}
  onConfirm={(blob, _rect, _state, recipe) => {
    if (blob && recipe) savePlacement({ blob, recipe });
  }}
/>
```
