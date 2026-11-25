# @alien6-studio/elea-media

Media components for React on Elea tokens: a drop zone for files and an image cropper with
zoom and rotation. Labels come from the host; styles come from `styles.css` and read
`--elea-*` variables only.

```tsx
import { createCropFormats, DropZone, ImageCropper } from "@alien6-studio/elea-media";
import "@alien6-studio/elea-media/bundle.css"; // the tokens, then styles.css

<DropZone accept="image/*" label="Click to add an image" hint="or drop one here" onFiles={([file]) => setFile(file)} />

<ImageCropper
  file={file}
  aspect={16 / 9}
  labels={{ zoom: "Zoom", rotation: "Rotation", confirm: "Use this image", cancel: "Cancel", image: "Picture to frame" }}
  onConfirm={(blob) => upload(blob ?? file)}
/>
```

The geometry (`cropRect`, `coverScale`, `exportCrop`) is exported on its own for hosts that draw
their own frame.

Pass `export={{ outputSize: { width: 1200, height: 800 } }}` for an exact pixel size, including
upscaling. The preview uses that ratio. Exact dimensions take precedence over `aspect` and
`maxWidth`. Each side accepts 1–8192 whole pixels, up to 16,777,216 pixels in total.

Pass `formats={createCropFormats(options)}` to let people move and resize a crop area on the photo. The corner handle
resizes it. Both controls accept arrow keys. Choose the original ratio, a square
(1080 × 1080), landscape (1600 × 900), portrait (1080 × 1350), custom pixel dimensions or
a free ratio. Free crops export the selected source pixels at their natural resolution.
The media `bundle.css` includes the format controls. When importing individual styles,
load the media `styles.css` and `crop-adjustments.css` alongside the UI styles for Field,
Select, Slider and Button.

```tsx
<ImageCropper file={file} labels={labels} onConfirm={saveCrop}
  formats={createCropFormats({
    defaultValue: "landscape",
    labels: {
      format: "Crop format", original: "Original ratio", free: "Free ratio",
      custom: "Custom dimensions", width: "Width (px)", height: "Height (px)",
      move: "Move crop area", resize: "Resize crop area",
      invalidSize: "Use whole pixels from 1 to 8192 per side, up to 16,777,216 pixels in total.",
    },
  })}
/>
```
