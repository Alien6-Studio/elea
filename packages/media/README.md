# @alien6-studio/elea-media

Media components for React on Elea tokens: a drop zone for files and an image cropper with
zoom and rotation. Labels come from the host; styles come from `styles.css` and read
`--elea-*` variables only.

```tsx
import { DropZone, ImageCropper } from "@alien6-studio/elea-media";
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
